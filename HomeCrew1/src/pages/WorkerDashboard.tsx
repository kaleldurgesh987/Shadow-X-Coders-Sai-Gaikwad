import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  DollarSign, 
  Star, 
  MessageCircle, 
  Check, 
  X, 
  ArrowRight, 
  TrendingUp, 
  Sliders, 
  Power,
  Play,
  CheckCircle2,
  Phone,
  AlertCircle,
  Eye,
  XCircle,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Job, WorkerProfile, JobStatus } from '../types';
import { processImageFile } from '../components/ImageUpload';
import { 
  subscribeWorkerBookings, 
  subscribeIncomingJobRequests, 
  updateJobStatus, 
  updateWorkerAvailability, 
  updateWorkerRate,
  ensureSeedWorkersInFirestore,
  saveWorkerProfile
} from '../services/firestoreService';
import { SEED_WORKERS } from '../data/seedWorkers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const WorkerDashboard: React.FC = () => {
  const { userProfile, currentUser, updateProfileDetails } = useAuth();
  
  // Real Worker Profile State
  const defaultWorker = SEED_WORKERS[0]; // Rameshwar Pawar default pro
  const [workerData, setWorkerData] = useState<WorkerProfile>(defaultWorker);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [hourlyRate, setHourlyRate] = useState<number>(defaultWorker.hourlyRate);
  const [rateSaved, setRateSaved] = useState<boolean>(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Real Firestore Bookings & Incoming Requests
  const [myBookings, setMyBookings] = useState<Job[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Job[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingFilterTab, setBookingFilterTab] = useState<'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'>('all');

  // Counteroffer Modal
  const [counterofferJob, setCounterofferJob] = useState<Job | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(500);
  const [counterNote, setCounterNote] = useState<string>('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  // Active worker ID
  const activeWorkerId = userProfile?.uid || 'worker-1';

  useEffect(() => {
    ensureSeedWorkersInFirestore();

    // Fetch worker profile from Firestore if exists
    const fetchWorker = async () => {
      try {
        const snap = await getDoc(doc(db, 'workerProfiles', activeWorkerId));
        if (snap.exists()) {
          const data = snap.data() as WorkerProfile;
          setWorkerData(data);
          setIsAvailable(data.availability !== undefined ? data.availability : true);
          setHourlyRate(data.hourlyRate || 350);
        } else {
          // Fallback to worker-1 in Firestore
          const fallbackSnap = await getDoc(doc(db, 'workerProfiles', 'worker-1'));
          if (fallbackSnap.exists()) {
            const data = fallbackSnap.data() as WorkerProfile;
            setWorkerData(data);
            setIsAvailable(data.availability !== undefined ? data.availability : true);
            setHourlyRate(data.hourlyRate || 350);
          }
        }
      } catch (e) {
        console.warn('Worker profile load handled:', e);
      }
    };
    fetchWorker();

    // Listen to worker bookings
    const unsubBookings = subscribeWorkerBookings(activeWorkerId, (jobs) => {
      setMyBookings(jobs);
      setLoadingBookings(false);
    });

    // Listen to incoming pending broadcast requests
    const unsubRequests = subscribeIncomingJobRequests((reqs) => {
      setIncomingRequests(reqs);
    });

    return () => {
      unsubBookings();
      unsubRequests();
    };
  }, [activeWorkerId]);

  // Statistics derived directly from live Firestore jobs
  const totalRequests = incomingRequests.length + myBookings.length;
  const pendingRequestsCount = incomingRequests.length;
  const acceptedBookingsCount = myBookings.filter((b) => b.status === 'confirmed').length;
  const activeJobsCount = myBookings.filter((b) => b.status === 'in_progress').length;
  const completedJobsCount = myBookings.filter((b) => b.status === 'completed').length;
  
  // Total earnings calculated exclusively from actual completed bookings
  const totalEarnings = myBookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.finalPrice || b.initialPrice || 0), 0);

  // Filter Bookings by Tab
  const filteredBookings = myBookings.filter((b) => {
    if (bookingFilterTab === 'all') return true;
    if (bookingFilterTab === 'pending') return b.status === 'pending' || b.status === 'negotiating';
    if (bookingFilterTab === 'accepted') return b.status === 'confirmed';
    if (bookingFilterTab === 'in_progress') return b.status === 'in_progress';
    if (bookingFilterTab === 'completed') return b.status === 'completed';
    if (bookingFilterTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  // Handle Availability Toggle (Saves directly to Firebase)
  const handleToggleAvailability = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    setUpdatingAvailability(true);
    try {
      await updateWorkerAvailability(workerData.id || activeWorkerId, nextState);
    } catch (err) {
      console.error('Failed to update availability in Firebase:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Handle Rate Update (Saves directly to Firebase)
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWorkerRate(workerData.id || activeWorkerId, hourlyRate);
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update hourly rate in Firebase:', err);
    }
  };

  // Worker Actions: Accept Job
  const handleAcceptRequest = async (job: Job) => {
    try {
      await updateJobStatus(job.id, 'confirmed', {
        workerId: workerData.id || activeWorkerId,
        workerName: workerData.name || userProfile?.name || 'Rameshwar Pawar',
        workerPhone: workerData.phoneNumber || userProfile?.phoneNumber,
        workerWhatsapp: workerData.whatsappNumber || userProfile?.whatsappNumber,
        finalPrice: job.initialPrice,
      });
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  // Worker Actions: Decline Job
  const handleDeclineRequest = async (jobId: string) => {
    try {
      await updateJobStatus(jobId, 'cancelled', {
        cancellationReason: 'Declined by worker',
      });
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  // Worker Actions: Start Job (marked in progress / en route)
  const handleStartJob = async (jobId: string) => {
    try {
      await updateJobStatus(jobId, 'in_progress', {
        etaMinutes: 15,
      });
    } catch (err) {
      console.error('Failed to start job:', err);
    }
  };

  // Worker Actions: Mark Completed
  const handleCompleteJob = async (jobId: string) => {
    const confirm = window.confirm('Mark this job as completed and collect direct payment?');
    if (!confirm) return;
    try {
      await updateJobStatus(jobId, 'completed');
    } catch (err) {
      console.error('Failed to complete job:', err);
    }
  };

  // Worker Actions: Submit Counteroffer
  const handleSubmitCounteroffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterofferJob) return;
    setSubmittingCounter(true);
    try {
      await updateJobStatus(counterofferJob.id, 'negotiating', {
        workerId: workerData.id || activeWorkerId,
        workerName: workerData.name || userProfile?.name,
        finalPrice: counterPrice,
      });
      setCounterofferJob(null);
      setCounterNote('');
    } catch (err) {
      console.error('Failed to submit counteroffer:', err);
    } finally {
      setSubmittingCounter(false);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#0B5D43]">In Progress</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Accepted</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">Pending</span>;
      case 'negotiating':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Counteroffer Sent</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Top Worker Profile & Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={workerData.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'}
                alt={workerData.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#0B5D43] shadow-xs"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#0B5D43] text-white p-1 rounded-full shadow-sm z-10">
                <ShieldCheck className="w-4 h-4 text-[#F9B000]" />
              </div>
              <label
                htmlFor="worker-photo-input"
                title="Change Worker Profile Photo"
                className="absolute inset-0 bg-black/45 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer z-20"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Upload</span>
              </label>
              <input
                id="worker-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const dataUrl = await processImageFile(file);
                    setWorkerData((prev) => ({ ...prev, profileImage: dataUrl }));
                    const wid = workerData.id || userProfile?.uid || currentUser?.uid;
                    if (wid) {
                      await saveWorkerProfile({ id: wid, profileImage: dataUrl });
                    }
                    await updateProfileDetails({ profileImage: dataUrl });
                  } catch (err) {
                    console.error('Failed to upload worker photo:', err);
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D43]">
                  Blue-Collar Pro Dashboard
                </span>
                <span className="text-xs font-bold bg-emerald-100 text-[#0B5D43] px-2 py-0.5 rounded-full">
                  Govt. ID Verified
                </span>
              </div>
              <h1 className="text-2xl font-heading font-black text-gray-900 mt-0.5">
                {workerData.name}
              </h1>
              <p className="text-xs text-gray-500">
                {workerData.services.join(', ')} &bull; {workerData.location} &bull; Rating: <strong>{workerData.averageRating} &starf;</strong>
              </p>
            </div>
          </div>

          {/* Actions & Availability */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              to="/profile-setup?role=worker"
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-[#F9B000]" />
              <span>Edit Pro Profile & Rates</span>
            </Link>

            {/* Real-time Online/Offline Availability Switch (Saves in Firebase) */}
            <div className="bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-200 flex items-center justify-between sm:justify-start gap-4">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Duty Status</span>
                <span className={`text-xs font-bold ${isAvailable ? 'text-emerald-700' : 'text-gray-500'}`}>
                  {isAvailable ? 'Available (Online)' : 'Unavailable (Offline)'}
                </span>
              </div>
              <button
                onClick={handleToggleAvailability}
                disabled={updatingAvailability}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isAvailable ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                title="Toggle Online Availability in Firebase"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics (Live from Firebase) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Incoming Requests</span>
            <div className="text-3xl font-heading font-black text-amber-600 mt-1">{pendingRequestsCount}</div>
            <span className="text-[11px] text-amber-700 font-bold">Needs action or offer</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Active Jobs</span>
            <div className="text-3xl font-heading font-black text-[#0B5D43] mt-1">{activeJobsCount}</div>
            <span className="text-[11px] text-emerald-600 font-bold">Currently in progress</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Completed Jobs</span>
            <div className="text-3xl font-heading font-black text-gray-900 mt-1">{completedJobsCount}</div>
            <span className="text-[11px] text-gray-400">Successfully serviced</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Total Earnings</span>
            <div className="text-3xl font-heading font-black text-emerald-600 mt-1">₹{totalEarnings}</div>
            <span className="text-[11px] text-emerald-700 font-bold">100% kept (0% cut)</span>
          </div>
        </div>

        {/* INCOMING JOB REQUESTS SECTION */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F9B000] animate-pulse" />
                <span>Incoming Job Requests ({incomingRequests.length})</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                New service requests sent by nearby customers in Mumbai
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Real-time Firebase Broadcast
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-2xl text-center text-xs text-gray-500 border border-gray-200">
              No new incoming requests right now. Keep your duty status Online to receive nearby broadcast alerts.
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#0B5D43] transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                        {req.isImmediate ? 'URGENT: Within 30 Mins' : 'Standard Scheduled'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{req.id}</span>
                      <span className="text-xs text-gray-400">&bull;</span>
                      <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <h3 className="font-heading font-bold text-gray-900 text-base">{req.service}: {req.description}</h3>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <span>Customer: <strong>{req.customerName}</strong></span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F9B000]" />
                        {req.location}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Offered Amount</span>
                      <div className="text-xl font-heading font-black text-[#0B5D43]">
                        ₹{req.initialPrice}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleAcceptRequest(req)}
                        className="px-4 py-2 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Job</span>
                      </button>

                      <button
                        onClick={() => {
                          setCounterofferJob(req);
                          setCounterPrice(req.initialPrice + 100);
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl text-xs font-bold transition-colors"
                      >
                        Counteroffer
                      </button>

                      <button
                        onClick={() => handleDeclineRequest(req.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-100 transition-colors"
                        title="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY ASSIGNED BOOKINGS SECTION */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0B5D43]" />
                <span>My Bookings (Assigned to Me)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Jobs where you have confirmed, started, or completed services
              </p>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBookingFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilterTab === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                All ({myBookings.length})
              </button>
              <button
                onClick={() => setBookingFilterTab('accepted')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilterTab === 'accepted' ? 'bg-white text-blue-800 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                Accepted ({acceptedBookingsCount})
              </button>
              <button
                onClick={() => setBookingFilterTab('in_progress')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilterTab === 'in_progress' ? 'bg-white text-[#0B5D43] shadow-xs font-bold' : 'text-gray-600'}`}
              >
                In Progress ({activeJobsCount})
              </button>
              <button
                onClick={() => setBookingFilterTab('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilterTab === 'completed' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                Completed ({completedJobsCount})
              </button>
              <button
                onClick={() => setBookingFilterTab('cancelled')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilterTab === 'cancelled' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {loadingBookings ? (
            <div className="text-center py-8 text-xs text-gray-500">Loading your bookings from Firestore...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-2xl text-center text-xs text-gray-500 border border-gray-200">
              No bookings under this status tab.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredBookings.map((b) => (
                <div key={b.id} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(b.status)}
                      <span className="text-xs text-gray-400 font-mono font-bold">#{b.id}</span>
                      <span className="text-xs text-gray-400">&bull;</span>
                      <span className="text-xs text-gray-500">{new Date(b.scheduledAt || b.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-heading font-bold text-gray-900 text-base">
                      {b.service}: {b.description}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                      <span className="font-semibold text-gray-800">
                        Customer: {b.customerName}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-[#F9B000]" />
                        {b.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Agreed Price</span>
                      <div className="text-lg font-heading font-black text-[#0B5D43]">
                        ₹{b.finalPrice || b.initialPrice}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* WhatsApp direct contact */}
                      {b.customerPhone && (
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${b.customerName}, this is ${workerData.name} regarding your HomeCrew booking #${b.id}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Start Job action if confirmed */}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleStartJob(b.id)}
                          className="px-3 py-1.5 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Job (En Route)</span>
                        </button>
                      )}

                      {/* Mark Completed action if in progress */}
                      {b.status === 'in_progress' && (
                        <button
                          onClick={() => handleCompleteJob(b.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rate Setting & Skills Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-gray-900 text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0B5D43]" />
              <span>Set Your Standard Rates (Firebase Saved)</span>
            </h3>
            <p className="text-xs text-gray-500">
              Blue-collar workers on HomeCrew have full autonomy to adjust standard hourly rates anytime.
            </p>

            <form onSubmit={handleSaveRate} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-36">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    min="100"
                    step="50"
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#0B5D43]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B5D43] text-white text-xs font-bold rounded-xl hover:bg-[#084532] transition-colors cursor-pointer"
                >
                  Save to Firebase
                </button>
              </div>

              {rateSaved && (
                <span className="text-xs font-bold text-emerald-600 block">
                  &check; Hourly rate updated to ₹{hourlyRate}/hr in Firestore!
                </span>
              )}
            </form>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-gray-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0B5D43]" />
              <span>Identity & Police Verification</span>
            </h3>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Verification Approved by Admin</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Document on file: {workerData.idProofType || 'Aadhaar Card + ITI Trade Certificate'}. Verified workers receive featured placement on Google Maps.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL: Worker Counteroffer */}
        {counterofferJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-heading font-bold text-base text-gray-900">
                  Send Counteroffer for #{counterofferJob.id}
                </h3>
                <button
                  onClick={() => setCounterofferJob(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p>Customer: <strong>{counterofferJob.customerName}</strong></p>
                <p>Initial Offer: <strong>₹{counterofferJob.initialPrice}</strong></p>
              </div>

              <form onSubmit={handleSubmitCounteroffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Counteroffer Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      required
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#0B5D43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Note for Customer (Optional)
                  </label>
                  <input
                    type="text"
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    placeholder="E.g., Includes replacement gasket and 1-month warranty."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCounterofferJob(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCounter}
                    className="px-5 py-2 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {submittingCounter ? 'Sending...' : 'Send Counteroffer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
