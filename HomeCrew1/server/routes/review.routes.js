import { Router } from 'express';
import { verifyToken, requireCustomer } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase.admin.js';
import { z } from 'zod';

const router = Router();

const reviewSchema = z.object({
  jobId: z.string(),
  workerId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// POST /api/reviews
router.post('/', verifyToken, requireCustomer, async (req, res) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    // Verify job is completed and belongs to customer
    const jobDoc = await adminDb.collection('jobs').doc(parsed.data.jobId).get();
    if (!jobDoc.exists) return res.status(404).json({ error: 'Job not found' });
    
    const job = jobDoc.data();
    if (job.customerId !== req.user.uid) return res.status(403).json({ error: 'Not authorized' });
    if (job.status !== 'completed') return res.status(400).json({ error: 'Job must be completed to review' });

    const reviewData = {
      jobId: parsed.data.jobId,
      customerId: req.user.uid,
      workerId: parsed.data.workerId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || '',
      createdAt: new Date().toISOString(),
    };

    const reviewRef = await adminDb.collection('reviews').add(reviewData);

    // Update worker's average rating
    const reviewsSnap = await adminDb.collection('reviews')
      .where('workerId', '==', parsed.data.workerId).get();
    
    let totalRating = 0;
    reviewsSnap.forEach(doc => { totalRating += doc.data().rating; });
    const avgRating = totalRating / reviewsSnap.size;

    await adminDb.collection('workerProfiles').doc(parsed.data.workerId).update({
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviewsSnap.size,
    });

    res.status(201).json({ reviewId: reviewRef.id, review: { id: reviewRef.id, ...reviewData } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /api/workers/:id/reviews
router.get('/workers/:id/reviews', async (req, res) => {
  try {
    const snapshot = await adminDb.collection('reviews')
      .where('workerId', '==', req.params.id)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = [];
    snapshot.forEach(doc => reviews.push({ id: doc.id, ...doc.data() }));
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
