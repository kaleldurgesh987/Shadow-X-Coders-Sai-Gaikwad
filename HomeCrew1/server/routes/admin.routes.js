import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase.admin.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyToken, requireAdmin);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
    const users = [];
    snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    res.json({ users, count: users.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const { status } = req.query;
    let query = adminDb.collection('jobs').orderBy('createdAt', 'desc');
    if (status) query = query.where('status', '==', status);
    
    const snapshot = await query.get();
    const jobs = [];
    snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
    res.json({ jobs, count: jobs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/admin/pending-workers
router.get('/pending-workers', async (req, res) => {
  try {
    const snapshot = await adminDb.collection('workerProfiles')
      .where('verificationStatus', '==', 'pending').get();
    const workers = [];
    snapshot.forEach(doc => workers.push({ id: doc.id, ...doc.data() }));
    res.json({ workers, count: workers.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending workers' });
  }
});

// PATCH /api/admin/workers/:id/verify
router.patch('/workers/:id/verify', async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be approve or reject' });
    }

    const status = action === 'approve' ? 'verified' : 'rejected';
    await adminDb.collection('workerProfiles').doc(req.params.id).update({
      verificationStatus: status,
      verificationReviewedAt: new Date().toISOString(),
      verificationReviewedBy: req.user.uid,
      verificationRejectionReason: reason || null,
    });

    res.json({ message: `Worker ${action}d`, workerId: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [usersSnap, jobsSnap, workersSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('jobs').get(),
      adminDb.collection('workerProfiles').get(),
    ]);

    let customers = 0, workers = 0;
    usersSnap.forEach(doc => {
      if (doc.data().role === 'customer') customers++;
      else if (doc.data().role === 'worker') workers++;
    });

    let completed = 0, pending = 0;
    jobsSnap.forEach(doc => {
      if (doc.data().status === 'completed') completed++;
      else if (doc.data().status === 'pending') pending++;
    });

    res.json({
      stats: {
        totalUsers: usersSnap.size,
        customers,
        workers,
        totalJobs: jobsSnap.size,
        completedJobs: completed,
        pendingJobs: pending,
        totalWorkerProfiles: workersSnap.size,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
