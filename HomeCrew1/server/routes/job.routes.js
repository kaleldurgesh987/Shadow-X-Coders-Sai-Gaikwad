import { Router } from 'express';
import { verifyToken, requireCustomer } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase.admin.js';
import { z } from 'zod';

const router = Router();

const createJobSchema = z.object({
  workerId: z.string().optional(),
  service: z.string().min(2),
  description: z.string().min(10).max(2000),
  images: z.array(z.string().url()).optional().default([]),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  scheduledAt: z.string().datetime().optional(),
  initialPrice: z.number().positive().optional(),
});

// POST /api/jobs
router.post('/', verifyToken, requireCustomer, async (req, res) => {
  try {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const jobData = {
      customerId: req.user.uid,
      workerId: parsed.data.workerId || null,
      service: parsed.data.service,
      description: parsed.data.description,
      images: parsed.data.images,
      location: parsed.data.location,
      scheduledAt: parsed.data.scheduledAt || null,
      status: 'pending',
      initialPrice: parsed.data.initialPrice || null,
      finalPrice: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const jobRef = await adminDb.collection('jobs').add(jobData);

    // Emit real-time notification via Socket.io if worker specified
    if (parsed.data.workerId) {
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${parsed.data.workerId}`).emit('job:new', {
          jobId: jobRef.id,
          ...jobData,
        });
      }
    }

    res.status(201).json({ jobId: jobRef.id, job: { id: jobRef.id, ...jobData } });
  } catch (err) {
    console.error('[Jobs POST]', err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// GET /api/jobs/my — get current user's jobs
router.get('/my', verifyToken, async (req, res) => {
  try {
    const field = req.user.role === 'customer' ? 'customerId' : 'workerId';
    const { status } = req.query;

    let query = adminDb.collection('jobs').where(field, '==', req.user.uid);
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const jobs = [];
    snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const jobDoc = await adminDb.collection('jobs').doc(req.params.id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobDoc.data();
    if (job.customerId !== req.user.uid && job.workerId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ job: { id: jobDoc.id, ...job } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

const validStatusTransitions = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: [],
};

// PATCH /api/jobs/:id/status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const jobDoc = await adminDb.collection('jobs').doc(req.params.id).get();

    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobDoc.data();
    const currentStatus = job.status;
    const allowedNext = validStatusTransitions[currentStatus] || [];

    if (!allowedNext.includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from '${currentStatus}' to '${status}'` 
      });
    }

    // Authorization checks
    if (status === 'accepted' || status === 'rejected') {
      if (job.workerId !== req.user.uid) {
        return res.status(403).json({ error: 'Only the assigned worker can accept/reject' });
      }
    }

    await adminDb.collection('jobs').doc(req.params.id).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      const notifyId = req.user.uid === job.customerId ? job.workerId : job.customerId;
      io.to(`user:${notifyId}`).emit('job:status', { jobId: req.params.id, status });
    }

    res.json({ message: 'Status updated', jobId: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH /api/jobs/:id/cancel
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const jobDoc = await adminDb.collection('jobs').doc(req.params.id).get();
    if (!jobDoc.exists) return res.status(404).json({ error: 'Job not found' });

    const job = jobDoc.data();
    if (job.customerId !== req.user.uid && job.workerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(job.status)) {
      return res.status(400).json({ error: 'Job cannot be cancelled' });
    }

    await adminDb.collection('jobs').doc(req.params.id).update({
      status: 'cancelled',
      cancelledBy: req.user.uid,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: 'Job cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

export default router;
