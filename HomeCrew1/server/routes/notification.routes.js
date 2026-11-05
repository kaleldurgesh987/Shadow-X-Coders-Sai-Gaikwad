import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase.admin.js';

const router = Router();

// GET /api/notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await adminDb.collection('notifications')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = [];
    snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notifDoc = await adminDb.collection('notifications').doc(req.params.id).get();
    if (!notifDoc.exists) return res.status(404).json({ error: 'Notification not found' });
    if (notifDoc.data().userId !== req.user.uid) return res.status(403).json({ error: 'Not authorized' });

    await adminDb.collection('notifications').doc(req.params.id).update({ isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
});

export default router;
