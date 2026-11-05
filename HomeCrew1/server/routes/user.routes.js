import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase.admin.js';
import { z } from 'zod';

const router = Router();

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }).optional(),
  preferredLanguage: z.enum(['en', 'hi', 'mr']).optional(),
});

// GET /api/users/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDoc = await adminDb.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { id: userDoc.id, ...userDoc.data() } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/me
router.put('/me', verifyToken, async (req, res) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const updateData = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('users').doc(req.user.uid).update(updateData);
    res.json({ message: 'Profile updated', data: updateData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
