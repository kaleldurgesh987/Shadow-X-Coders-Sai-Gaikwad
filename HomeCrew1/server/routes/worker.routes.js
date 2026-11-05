import { Router } from 'express';
import { verifyToken, requireWorker } from '../middleware/auth.middleware.js';
import { adminDb } from '../config/firebase.admin.js';
import { z } from 'zod';

const router = Router();

const workerProfileSchema = z.object({
  skills: z.array(z.string()).min(1),
  services: z.array(z.string()).min(1),
  experience: z.string(),
  hourlyRate: z.number().positive(),
  workingArea: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
    geohash: z.string().optional(),
  }),
  availability: z.object({
    isAvailable: z.boolean(),
    schedule: z.record(z.any()).optional(),
  }),
  serviceDescriptions: z.string().optional(),
});

// GET /api/workers — get nearby workers (public)
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 30, service, minRating } = req.query;
    
    let query = adminDb.collection('workerProfiles')
      .where('availability.isAvailable', '==', true);

    if (service) {
      query = query.where('skills', 'array-contains', service);
    }

    const snapshot = await query.get();
    let workers = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Calculate distance if coordinates provided
      if (lat && lng && data.location?.lat && data.location?.lng) {
        const distance = calculateDistance(
          parseFloat(lat), parseFloat(lng),
          data.location.lat, data.location.lng
        );
        if (distance <= parseFloat(radius)) {
          workers.push({ id: doc.id, ...data, distance: parseFloat(distance.toFixed(1)) });
        }
      } else {
        workers.push({ id: doc.id, ...data });
      }
    });

    // Filter by rating
    if (minRating) {
      workers = workers.filter(w => w.averageRating >= parseFloat(minRating));
    }

    // Sort by distance
    workers.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    res.json({ workers, count: workers.length });
  } catch (err) {
    console.error('[Workers GET]', err);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// GET /api/workers/:id — single worker profile (public)
router.get('/:id', async (req, res) => {
  try {
    const [workerDoc, userDoc] = await Promise.all([
      adminDb.collection('workerProfiles').doc(req.params.id).get(),
      adminDb.collection('users').doc(req.params.id).get(),
    ]);

    if (!workerDoc.exists) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Merge public data only (exclude sensitive fields)
    const workerData = workerDoc.data();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.json({
      worker: {
        id: workerDoc.id,
        name: userData.name,
        profileImage: userData.profileImage,
        ...workerData,
        // Exclude sensitive fields
        verificationDocumentUrls: undefined,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch worker profile' });
  }
});

// PUT /api/workers/profile — update worker profile (worker only)
router.put('/profile', verifyToken, requireWorker, async (req, res) => {
  try {
    const parsed = workerProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const updateData = {
      ...parsed.data,
      workerId: req.user.uid,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('workerProfiles').doc(req.user.uid).set(updateData, { merge: true });
    res.json({ message: 'Worker profile updated', data: updateData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update worker profile' });
  }
});

// PUT /api/workers/availability — toggle availability
router.put('/availability', verifyToken, requireWorker, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be boolean' });
    }

    await adminDb.collection('workerProfiles').doc(req.user.uid).update({
      'availability.isAvailable': isAvailable,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: `Availability set to ${isAvailable}`, isAvailable });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// POST /api/workers/verification — submit verification docs
router.post('/verification', verifyToken, requireWorker, async (req, res) => {
  try {
    const { documentUrls, documentType } = req.body;
    
    if (!documentUrls || !documentType) {
      return res.status(400).json({ error: 'documentUrls and documentType required' });
    }

    await adminDb.collection('workerProfiles').doc(req.user.uid).update({
      verificationStatus: 'pending',
      verificationDocumentUrls: documentUrls,
      verificationDocumentType: documentType,
      verificationSubmittedAt: new Date().toISOString(),
    });

    res.json({ message: 'Verification documents submitted', status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// Distance calculation helper (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * Math.PI / 180;
}

export default router;
