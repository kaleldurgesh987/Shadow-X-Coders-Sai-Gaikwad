import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Job, JobStatus, WorkerProfile, UserProfile, Review } from '../types';
import { SEED_WORKERS } from '../data/seedWorkers';

/**
 * Ensures workers are seeded into Firestore workerProfiles if collection is empty.
 * Also seeds initial realistic jobs so both Customer and Worker dashboards have live data.
 */
export async function ensureSeedWorkersInFirestore(): Promise<void> {
  try {
    const workerCol = collection(db, 'workerProfiles');
    const existingSnap = await getDocs(query(workerCol, limit(1)));
    
    if (existingSnap.empty) {
      console.log('Seeding initial worker profiles to Firestore...');
      for (const worker of SEED_WORKERS) {
        await setDoc(doc(db, 'workerProfiles', worker.id), {
          ...worker,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Seed initial sample jobs for demonstration
      const jobsCol = collection(db, 'jobs');
      const sampleJobs: Omit<Job, 'id'>[] = [
        {
          customerId: 'demo_customer_aarti',
          customerName: 'Aarti Deshmukh',
          customerPhone: '+919820011223',
          customerWhatsapp: '+919820011223',
          workerId: 'worker-1',
          workerName: 'Rameshwar "Ramesh" Pawar',
          workerPhone: '+919820112233',
          workerWhatsapp: '+919820112233',
          service: 'Plumber',
          description: 'Emergency concealed pipe leakage under kitchen sink with water spilling onto tiles.',
          location: 'Dadar West, Mumbai',
          customerLat: 19.0178,
          customerLng: 72.8478,
          workerLat: 19.0220,
          workerLng: 72.8420,
          scheduledAt: new Date().toISOString(),
          isImmediate: true,
          status: 'in_progress',
          initialPrice: 500,
          finalPrice: 650,
          etaMinutes: 15,
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          customerId: 'demo_customer_kunal',
          customerName: 'Kunal Singhania',
          customerPhone: '+919820022334',
          customerWhatsapp: '+919820022334',
          workerId: 'worker-1',
          workerName: 'Rameshwar "Ramesh" Pawar',
          workerPhone: '+919820112233',
          workerWhatsapp: '+919820112233',
          service: 'Plumber',
          description: 'Flush tank overflow valve stuck, continuous water flow in bathroom.',
          location: 'Prabhadevi, Mumbai',
          customerLat: 19.0145,
          customerLng: 72.8285,
          scheduledAt: new Date().toISOString(),
          isImmediate: true,
          status: 'pending',
          initialPrice: 400,
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          customerId: 'demo_customer_aarti',
          customerName: 'Aarti Deshmukh',
          customerPhone: '+919820011223',
          customerWhatsapp: '+919820011223',
          workerId: 'worker-2',
          workerName: 'Santosh Kumar Yadav',
          workerPhone: '+919820223344',
          workerWhatsapp: '+919820223344',
          service: 'Electrician',
          description: 'Main MCB tripping repeatedly when water heater turned on.',
          location: 'Dadar West, Mumbai',
          scheduledAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          isImmediate: false,
          status: 'completed',
          initialPrice: 500,
          finalPrice: 600,
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 46 * 3600 * 1000).toISOString(),
        },
        {
          customerId: 'demo_customer_priya',
          customerName: 'Priya Mehta',
          customerPhone: '+919820033445',
          customerWhatsapp: '+919820033445',
          workerId: 'worker-3',
          workerName: 'Sunita Tai Kamble',
          workerPhone: '+919820334455',
          workerWhatsapp: '+919820334455',
          service: 'Cleaner',
          description: 'Full 2BHK deep sanitization and kitchen degreasing before festival.',
          location: 'Andheri East, Mumbai',
          scheduledAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
          isImmediate: false,
          status: 'completed',
          initialPrice: 1200,
          finalPrice: 1200,
          createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 68 * 3600 * 1000).toISOString(),
        }
      ];

      for (let i = 0; i < sampleJobs.length; i++) {
        const j = sampleJobs[i];
        await setDoc(doc(db, 'jobs', `JOB-${1001 + i}`), {
          ...j,
          id: `JOB-${1001 + i}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.warn('Seed worker profiles skipped or handled:', error);
  }
}

/**
 * Real-time subscription to worker profiles in Firestore
 */
export function subscribeWorkers(
  callback: (workers: WorkerProfile[]) => void,
  onlyAvailable = false
): () => void {
  const colRef = collection(db, 'workerProfiles');
  const q = onlyAvailable 
    ? query(colRef, where('availability', '==', true))
    : colRef;

  return onSnapshot(
    q,
    (snapshot) => {
      const workers: WorkerProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as WorkerProfile;
        workers.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Fallback to SEED_WORKERS if firestore is still empty
      if (workers.length === 0) {
        callback(onlyAvailable ? SEED_WORKERS.filter(w => w.availability) : SEED_WORKERS);
      } else {
        callback(workers);
      }
    },
    (error) => {
      console.warn('Worker snapshot warning, serving cached/seed data:', error);
      callback(onlyAvailable ? SEED_WORKERS.filter(w => w.availability) : SEED_WORKERS);
    }
  );
}

/**
 * Save / Create Customer Profile in Firestore
 */
export async function saveCustomerProfile(
  profile: Partial<UserProfile> & { uid: string }
): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      role: 'customer',
      profileCompleted: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Save customer profile error:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Create Worker Profile in Firestore
 */
export async function saveWorkerProfile(
  worker: Partial<WorkerProfile> & { id: string }
): Promise<void> {
  const workerPath = `workerProfiles/${worker.id}`;
  const userPath = `users/${worker.id}`;
  try {
    const fullWorkerData = {
      ...worker,
      workerId: worker.id,
      availability: worker.availability !== undefined ? worker.availability : true,
      verificationStatus: worker.verificationStatus || 'verified',
      averageRating: worker.averageRating || 5.0,
      totalReviews: worker.totalReviews || 0,
      completedJobs: worker.completedJobs || 0,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'workerProfiles', worker.id), fullWorkerData, { merge: true });

    // Also sync to users collection
    await setDoc(doc(db, 'users', worker.id), {
      uid: worker.id,
      name: worker.name,
      email: worker.email || '',
      phoneNumber: worker.phoneNumber,
      whatsappNumber: worker.whatsappNumber,
      profileImage: worker.profileImage,
      role: 'worker',
      location: worker.location,
      profileCompleted: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Save worker profile error:', error);
    handleFirestoreError(error, OperationType.WRITE, workerPath);
  }
}

/**
 * Update worker availability toggle (Available / Unavailable) in Firestore
 */
export async function updateWorkerAvailability(
  workerId: string, 
  availability: boolean
): Promise<void> {
  const path = `workerProfiles/${workerId}`;
  try {
    await updateDoc(doc(db, 'workerProfiles', workerId), {
      availability,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update worker hourly rate in Firestore
 */
export async function updateWorkerRate(
  workerId: string, 
  hourlyRate: number
): Promise<void> {
  const path = `workerProfiles/${workerId}`;
  try {
    await updateDoc(doc(db, 'workerProfiles', workerId), {
      hourlyRate,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update worker verification status (Admin action) in Firestore
 */
export async function updateWorkerVerification(
  workerId: string, 
  verificationStatus: 'verified' | 'pending' | 'unverified'
): Promise<void> {
  const path = `workerProfiles/${workerId}`;
  try {
    await updateDoc(doc(db, 'workerProfiles', workerId), {
      verificationStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Real-time subscription to bookings created by the logged-in Customer
 */
export function subscribeCustomerBookings(
  customerId: string,
  userPhone: string | undefined,
  callback: (bookings: Job[]) => void
): () => void {
  const colRef = collection(db, 'jobs');
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      const all: Job[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as Job;
        // Match either by customerId or customer phone
        if (
          item.customerId === customerId || 
          (userPhone && item.customerPhone && item.customerPhone.includes(userPhone.slice(-8)))
        ) {
          all.push({ ...item, id: d.id });
        }
      });
      // Sort newest first
      all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(all);
    },
    (error) => {
      console.warn('Customer bookings snapshot warning:', error);
      callback([]);
    }
  );
}

/**
 * Real-time subscription to bookings assigned to the logged-in Worker
 */
export function subscribeWorkerBookings(
  workerId: string,
  callback: (bookings: Job[]) => void
): () => void {
  const colRef = collection(db, 'jobs');
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      const assigned: Job[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as Job;
        // Match by workerId (supports direct workerId or default worker-1 demo)
        if (item.workerId === workerId || (!item.workerId && item.status === 'pending') || workerId === 'worker-1') {
          assigned.push({ ...item, id: d.id });
        }
      });
      assigned.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(assigned);
    },
    (error) => {
      console.warn('Worker bookings snapshot warning:', error);
      callback([]);
    }
  );
}

/**
 * Real-time subscription to incoming pending requests for workers
 */
export function subscribeIncomingJobRequests(
  callback: (requests: Job[]) => void
): () => void {
  const colRef = collection(db, 'jobs');
  
  return onSnapshot(
    colRef,
    (snapshot) => {
      const pendingJobs: Job[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as Job;
        if (item.status === 'pending' || item.status === 'negotiating') {
          pendingJobs.push({ ...item, id: d.id });
        }
      });
      pendingJobs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(pendingJobs);
    },
    (error) => {
      console.warn('Incoming requests snapshot warning:', error);
      callback([]);
    }
  );
}

/**
 * Real-time subscription to ALL bookings across platform for Admin
 */
export function subscribeAllBookings(
  callback: (bookings: Job[]) => void
): () => void {
  const colRef = collection(db, 'jobs');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const all: Job[] = [];
      snapshot.forEach((d) => {
        all.push({ ...(d.data() as Job), id: d.id });
      });
      all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(all);
    },
    (error) => {
      console.warn('All bookings snapshot warning:', error);
      callback([]);
    }
  );
}

/**
 * Real-time subscription to all registered users for Admin
 */
export function subscribeAllUsers(
  callback: (users: UserProfile[]) => void
): () => void {
  const colRef = collection(db, 'users');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((d) => {
        users.push({ ...(d.data() as UserProfile), uid: d.id });
      });
      callback(users);
    },
    (error) => {
      console.warn('All users snapshot warning:', error);
      callback([]);
    }
  );
}

/**
 * Create a new booking request in Firestore
 */
export async function createJobBooking(
  jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const path = 'jobs';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Update a job status (accept, start, complete, cancel, etc.)
 */
export async function updateJobStatus(
  jobId: string, 
  status: JobStatus,
  extra?: Partial<Job>
): Promise<void> {
  const path = `jobs/${jobId}`;
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      status,
      ...extra,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Cancel a booking with optional reason
 */
export async function cancelJobBooking(
  jobId: string, 
  cancellationReason?: string
): Promise<void> {
  const path = `jobs/${jobId}`;
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'cancelled',
      cancellationReason: cancellationReason || 'Cancelled by user',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Submit rating and review after job completion
 */
export async function submitJobReview(
  reviewData: Omit<Review, 'id' | 'createdAt'>
): Promise<void> {
  const path = 'reviews';
  try {
    await addDoc(collection(db, path), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // Update worker averageRating and totalReviews if workerId present
    if (reviewData.workerId) {
      const workerRef = doc(db, 'workerProfiles', reviewData.workerId);
      const workerSnap = await getDoc(workerRef);
      if (workerSnap.exists()) {
        const currentData = workerSnap.data() as WorkerProfile;
        const currentTotal = currentData.totalReviews || 0;
        const currentAvg = currentData.averageRating || 5.0;
        const newTotal = currentTotal + 1;
        const newAvg = Number(((currentAvg * currentTotal + reviewData.rating) / newTotal).toFixed(1));
        
        await updateDoc(workerRef, {
          averageRating: newAvg,
          totalReviews: newTotal,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}
