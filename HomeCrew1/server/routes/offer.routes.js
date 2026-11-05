import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase.admin.js';
import { z } from 'zod';

const router = Router();

const offerSchema = z.object({
  workerId: z.string(),
  offeredAmount: z.number().positive(),
  message: z.string().optional(),
});

// POST /api/jobs/:id/offers — create offer on a job
router.post('/jobs/:id/offers', verifyToken, async (req, res) => {
  try {
    const parsed = offerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const jobDoc = await adminDb.collection('jobs').doc(req.params.id).get();
    if (!jobDoc.exists) return res.status(404).json({ error: 'Job not found' });

    const job = jobDoc.data();
    if (job.status !== 'pending') {
      return res.status(400).json({ error: 'Job is not accepting offers' });
    }

    const offerData = {
      jobId: req.params.id,
      customerId: job.customerId,
      workerId: parsed.data.workerId,
      offeredAmount: parsed.data.offeredAmount,
      counterAmount: null,
      status: 'pending',
      offerHistory: [{
        amount: parsed.data.offeredAmount,
        by: req.user.uid,
        at: new Date().toISOString(),
        message: parsed.data.message || '',
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const offerRef = await adminDb.collection('offers').add(offerData);

    // Notify worker via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${parsed.data.workerId}`).emit('offer:new', {
        offerId: offerRef.id,
        ...offerData,
      });
    }

    res.status(201).json({ offerId: offerRef.id, offer: { id: offerRef.id, ...offerData } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// PATCH /api/offers/:id — accept, reject, or counteroffer
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { action, counterAmount, message } = req.body;
    
    if (!['accept', 'reject', 'counter'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const offerDoc = await adminDb.collection('offers').doc(req.params.id).get();
    if (!offerDoc.exists) return res.status(404).json({ error: 'Offer not found' });

    const offer = offerDoc.data();
    if (offer.customerId !== req.user.uid && offer.workerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const historyEntry = {
      action,
      by: req.user.uid,
      at: new Date().toISOString(),
      message: message || '',
    };

    let updateData = {
      updatedAt: new Date().toISOString(),
      offerHistory: [...(offer.offerHistory || []), historyEntry],
    };

    if (action === 'accept') {
      updateData.status = 'accepted';
      // Update job with final price
      const finalPrice = offer.counterAmount || offer.offeredAmount;
      await adminDb.collection('jobs').doc(offer.jobId).update({
        status: 'accepted',
        workerId: offer.workerId,
        finalPrice,
        updatedAt: new Date().toISOString(),
      });
    } else if (action === 'reject') {
      updateData.status = 'rejected';
    } else if (action === 'counter') {
      if (!counterAmount || counterAmount <= 0) {
        return res.status(400).json({ error: 'counterAmount required for counter action' });
      }
      updateData.status = 'countered';
      updateData.counterAmount = counterAmount;
      historyEntry.amount = counterAmount;
    }

    await adminDb.collection('offers').doc(req.params.id).update(updateData);

    // Notify other party
    const io = req.app.get('io');
    if (io) {
      const notifyId = req.user.uid === offer.customerId ? offer.workerId : offer.customerId;
      io.to(`user:${notifyId}`).emit('offer:update', {
        offerId: req.params.id,
        action,
        ...updateData,
      });
    }

    res.json({ message: `Offer ${action}ed`, offerId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

export default router;
