import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { adminAuth, adminDb } from '../config/firebase.admin.js';

const router = Router();

// POST /api/auth/verify — verify token and return user info
router.post('/verify', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/me — get current authenticated user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDoc = await adminDb.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({ user: { id: userDoc.id, ...userDoc.data() } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
