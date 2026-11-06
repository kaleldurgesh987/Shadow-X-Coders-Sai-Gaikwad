import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  MessageCircle, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
  XCircle,
  Filter,
  Map as MapIcon,
  List,
  Eye,
  RefreshCw,
  Phone,
  Check,
  User,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Job, WorkerProfile, JobStatus } from '../types';
import { processImageFile } from '../components/ImageUpload';
import { 
  subscribeCustomerBookings, 
  subscribeWorkers, 
  cancelJobBooking, 
  submitJobReview,
  ensureSeedWorkersInFirestore,
  createJobBooking
} from '../services/firestoreService';

export const CustomerDashboard: React.FC = () => {
  const { userProfile, currentUser, updateProfileDetails } = useAuth();
  
  // Real Firestore data
  const [bookings, setBookings] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // Filters for Workers Nearby
  const [workerSearch, setWorkerSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters for My Bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed' | 'cancelled'>('all');

  // Modals
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<Job | null>(null);
  const [reviewModalJob, setReviewModalJob] = useState<Job | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Quick Book Worker Modal
  const [quickBookWorker, setQuickBookWorker] = useState<WorkerProfile | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobOfferedPrice, setJobOfferedPrice] = useState<number>(500);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    ensureSeedWorkersInFirestore();

    const unsubWorkers = subscribeWorkers((data) => {
      setWorkers(data);
      setLoadingWorkers(false);
    });

    const customerId = userProfile?.uid || currentUser?.uid || '';
    const unsubBookings = subscribeCustomerBookings(
      customerId,
      userProfile?.phoneNumber,
      (data) => {
        setBookings(data);
        setLoadingBookings(false);
      }
    );

    return () => {
      unsubWorkers();
      unsubBookings();
    };
  }, [userProfile?.uid, currentUser?.uid, userProfile?.phoneNumber]);

  // Real-time Statistics computed from live Firebase bookings
  const totalBookings = bookings.length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'in_progress' || b.status === 'confirmed').length;
  const pendingRequestsCount = bookings.filter((b) => b.status === 'pending' || b.status === 'negotiating').length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'completed').length;

  // Filter Bookings by Tab
  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter === 'all') return true;
    if (bookingStatusFilter === 'active') return b.status === 'in_progress' || b.status === 'confirmed';
    if (bookingStatusFilter === 'pending') return b.status === 'pending' || b.status === 'negotiating';
    if (bookingStatusFilter === 'completed') return b.status === 'completed';
    if (bookingStatusFilter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  // Filter Workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = 
      w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.services.some((s) => s.toLowerCase().includes(workerSearch.toLowerCase())) ||
      w.skills.some((sk) => sk.toLowerCase().includes(workerSearch.toLowerCase())) ||
      w.location.toLowerCase().includes(workerSearch.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || w.services.includes(selectedCategory);
    const matchesAvail = !onlyAvailable || w.availability;

    return matchesSearch && matchesCat && matchesAvail;
  });

  const handleCancelBooking = async (jobId: string) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;
    try {
      await cancelJobBooking(jobId, 'Cancelled by customer from dashboard');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalJob) return;
    setSubmittingReview(true);
    try {
      await submitJobReview({
        jobId: reviewModalJob.id,
        customerId: userProfile?.uid || 'customer',
        customerName: userProfile?.name || 'Customer',
        workerId: reviewModalJob.workerId || '',
        rating: reviewRating,
        comment: reviewComment || 'Great service!',
      });
      setReviewModalJob(null);
      setReviewComment('');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCreateDirectBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBookWorker) return;
    setBookingSubmitting(true);
    try {
      const newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
        customerId: userProfile?.uid || currentUser?.uid || '',
        customerName: userProfile?.name || 'HomeCrew Customer',
        customerPhone: userProfile?.phoneNumber || '+919820011223',
        customerWhatsapp: userProfile?.whatsappNumber || '+919820011223',
        workerId: quickBookWorker.id,
        workerName: quickBookWorker.name,
        workerPhone: quickBookWorker.phoneNumber,
        workerWhatsapp: quickBookWorker.whatsappNumber,
        service: quickBookWorker.services[0] || 'General Handyman',
        description: jobDescription || 'Standard requested repair service.',
        location: userProfile?.location || 'Mumbai, Maharashtra',
        scheduledAt: new Date().toISOString(),
        isImmediate: true,
        status: 'pending',
        initialPrice: jobOfferedPrice || quickBookWorker.hourlyRate,
      };

      await createJobBooking(newJob);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setQuickBookWorker(null);
        setJobDescription('');
      }, 1800);
    } catch (err) {
      console.error('Booking creation error:', err);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#0B5D43]">In Progress (En Route)</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">Pending Worker Confirmation</span>;
      case 'negotiating':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Offer In Negotiation</span>;
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
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={userProfile?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                alt="Profile"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0B5D43] shadow-xs"
              />
              <label
                htmlFor="customer-photo-input"
                title="Upload Profile Picture"
                className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span className="text-[9px] font-bold mt-0.5">Edit</span>
              </label>
              <input
                id="customer-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const dataUrl = await processImageFile(file);
                    await updateProfileDetails({ profileImage: dataUrl });
                  } catch (err) {
                    console.error('Failed to upload photo:', err);
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0B5D43] uppercase tracking-wider">
                  Customer Portal
                </span>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Live Firebase Connected
                </span>
              </div>
              <h1 className="text-2xl font-heading font-black text-gray-900 mt-0.5">
                Welcome back, {userProfile?.name || 'Customer'}!
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {userProfile?.location || 'Mumbai, Maharashtra'} &bull; Phone: {userProfile?.phoneNumber || '+91 98200 98200'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Link
              to="/post-job"
              className="flex-1 md:flex-none px-4 py-2.5 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-[#F9B000]" />
              <span>Post New Request</span>
            </Link>
            <Link
              to="/profile-setup?role=customer"
              className="flex-1 md:flex-none px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0B5D43] border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-4 h-4 text-[#0B5D43]" />
              <span>Edit Profile</span>
            </Link>
            <Link
              to="/workers"
              className="flex-1 md:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4 text-[#0B5D43]" />
              <span>Explore Map</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Statistics (Live from Firebase) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Total Bookings</span>
            <div className="text-3xl font-heading font-black text-[#0B5D43] mt-1">{totalBookings}</div>
            <span className="text-[11px] text-gray-400">All customer requests</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Active Bookings</span>
            <div className="text-3xl font-heading font-black text-emerald-600 mt-1">{activeBookingsCount}</div>
            <span className="text-[11px] text-emerald-700 font-bold">In-progress or confirmed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Pending Requests</span>
            <div className="text-3xl font-heading font-black text-amber-600 mt-1">{pendingRequestsCount}</div>
            <span className="text-[11px] text-amber-700 font-bold">Awaiting worker acceptance</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Completed Bookings</span>
            <div className="text-3xl font-heading font-black text-gray-900 mt-1">{completedBookingsCount}</div>
            <span className="text-[11px] text-gray-400">Successfully resolved</span>
          </div>
        </div>

        {/* MY BOOKINGS SECTION */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0B5D43]" />
                <span>My Bookings & Service Requests</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time booking records created by your customer account in Firebase
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBookingStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingStatusFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setBookingStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingStatusFilter === 'active' ? 'bg-white text-[#0B5D43] shadow-xs font-bold' : 'text-gray-600'}`}
              >
                Active ({activeBookingsCount})
              </button>
              <button
                onClick={() => setBookingStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingStatusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                Pending ({pendingRequestsCount})
              </button>
              <button
                onClick={() => setBookingStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingStatusFilter === 'completed' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                Completed ({completedBookingsCount})
              </button>
              <button
                onClick={() => setBookingStatusFilter('cancelled')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${bookingStatusFilter === 'cancelled' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600'}`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {loadingBookings ? (
            <div className="text-center py-8 text-xs text-gray-500">Loading your bookings from Firestore...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <p className="text-xs text-gray-500">No bookings found in this category.</p>
              <Link
                to="/post-job"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B5D43] text-white rounded-xl text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4 text-[#F9B000]" />
                <span>Create a New Service Booking</span>
              </Link>
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
                      <span className="font-semibold text-[#0B5D43]">
                        Worker: {b.workerName || 'Awaiting assignment'}
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
                      <button
                        onClick={() => setSelectedJobForDetails(b)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Details
                      </button>

                      {/* Negotiate if pending or negotiating */}
                      {(b.status === 'pending' || b.status === 'negotiating') && (
                        <Link
                          to={`/negotiate?jobId=${b.id}&workerId=${b.workerId || ''}`}
                          className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors"
                        >
                          Negotiate Price
                        </Link>
                      )}

                      {/* Live Tracking link if active */}
                      {b.status === 'in_progress' && (
                        <Link
                          to={`/tracking?workerId=${b.workerId}&service=${encodeURIComponent(b.service)}&amount=${b.finalPrice || b.initialPrice}`}
                          className="px-3 py-1.5 bg-[#0B5D43] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          <span>Live Tracking</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#F9B000]" />
                        </Link>
                      )}

                      {/* Cancel action if permitted */}
                      {(b.status === 'pending' || b.status === 'confirmed' || b.status === 'negotiating') && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Rate & Review after completion */}
                      {b.status === 'completed' && (
                        <button
                          onClick={() => setReviewModalJob(b)}
                          className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 text-[#F9B000] fill-current" />
                          <span>Rate Service</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FIND WORKERS NEARBY SECTION */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#0B5D43]" />
                <span>Find Nearby Workers (From Firebase)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Browse real certified blue-collar pros available in your locality
              </p>
            </div>

            {/* List / Map View Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${viewMode === 'map' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#0B5D43]" />
                  <span>Interactive Map</span>
                </button>
              </div>

              <label className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-[#0B5D43] border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded text-[#0B5D43]"
                />
                <span>Online Only</span>
              </label>
            </div>
          </div>

          {/* Search and Category Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                placeholder="Search workers by name, trade or locality (e.g. Dadar, Plumber)..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#0B5D43]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0B5D43]"
            >
              <option value="All">All Categories</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
              <option value="AC repair technicians">AC Repair</option>
            </select>
          </div>

          {/* Map View Notice or List */}
          {viewMode === 'map' ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <MapIcon className="w-8 h-8 text-[#0B5D43] mx-auto" />
              <h3 className="font-heading font-bold text-gray-900 text-sm">Full Google Maps View Active</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Explore real GPS pins of all {filteredWorkers.length} nearby workers with 30-minute estimated arrival contours.
              </p>
              <Link
                to="/workers"
                className="inline-block px-5 py-2.5 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Open Full Interactive Map View &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingWorkers ? (
                <div className="col-span-3 text-center py-8 text-xs text-gray-500">
                  Loading workers from Firestore...
                </div>
              ) : filteredWorkers.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-xs text-gray-500 bg-gray-50 rounded-2xl">
                  No workers found matching your filter criteria.
                </div>
              ) : (
                filteredWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="p-5 bg-[#FAFBF8] rounded-2xl border border-gray-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0B5D43] transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={w.profileImage}
                          alt={w.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-heading font-bold text-sm text-gray-900">{w.name}</h4>
                            {w.verificationStatus === 'verified' && (
                              <span title="Govt. ID Verified">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#0B5D43]" />
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-[#0B5D43]">
                            {w.services.join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center justify-between">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {w.location}
                        </span>
                        <span className="flex items-center gap-1 text-amber-800 font-bold shrink-0">
                          <Star className="w-3 h-3 text-[#F9B000] fill-current" />
                          {w.averageRating} ({w.totalReviews})
                        </span>
                      </div>

                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1">
                        {w.skills.slice(0, 3).map((sk) => (
                          <span key={sk} className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-600 font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Standard Rate</span>
                          <div className="font-heading font-extrabold text-gray-900 text-sm">₹{w.hourlyRate}/hr</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Status</span>
                          <div className={`text-xs font-bold ${w.availability ? 'text-emerald-700' : 'text-gray-400'}`}>
                            {w.availability ? 'Online Now' : 'Offline'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link
                        to={`/worker/${w.id}`}
                        className="flex-1 py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          setQuickBookWorker(w);
                          setJobOfferedPrice(w.hourlyRate);
                        }}
                        className="flex-1 py-2 text-center bg-[#0B5D43] hover:bg-[#084532] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* MODAL: Booking Details */}
        {selectedJobForDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-heading font-bold text-base text-gray-900">
                  Booking #{selectedJobForDetails.id}
                </h3>
                <button
                  onClick={() => setSelectedJobForDetails(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block">Service & Description:</span>
                  <p className="font-bold text-gray-900 text-sm">{selectedJobForDetails.service}</p>
                  <p className="text-gray-600 mt-1">{selectedJobForDetails.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-400 font-semibold block">Assigned Worker:</span>
                    <p className="font-bold text-gray-900">{selectedJobForDetails.workerName || 'Awaiting assignment'}</p>
                    <p className="text-gray-500">{selectedJobForDetails.workerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Booking Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedJobForDetails.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-400 font-semibold block">Agreed Price:</span>
                    <p className="font-black text-[#0B5D43] text-base">
                      ₹{selectedJobForDetails.finalPrice || selectedJobForDetails.initialPrice}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Scheduled At:</span>
                    <p className="text-gray-700">{new Date(selectedJobForDetails.scheduledAt || selectedJobForDetails.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedJobForDetails(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Submit Rating & Review */}
        {reviewModalJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-heading font-bold text-base text-gray-900">
                  Rate Service for #{reviewModalJob.id}
                </h3>
                <button
                  onClick={() => setReviewModalJob(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    How was the service provided by {reviewModalJob.workerName || 'the worker'}?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= reviewRating ? 'text-[#F9B000] fill-current' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">{reviewRating}.0 / 5.0</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Feedback & Review (Publicly visible)
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="E.g., Arrived within 20 minutes, very polite, solved the drainage leak quickly."
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalJob(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Direct Quick Booking */}
        {quickBookWorker && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-gray-900">
                    Book {quickBookWorker.name}
                  </h3>
                  <span className="text-xs text-[#0B5D43] font-semibold">{quickBookWorker.services.join(', ')}</span>
                </div>
                <button
                  onClick={() => setQuickBookWorker(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-heading font-bold text-emerald-900 text-sm">Booking Request Sent!</h4>
                  <p className="text-xs text-emerald-700">
                    The request has been written to Firestore and dispatched to {quickBookWorker.name}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateDirectBooking} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Describe the Issue or Service Needed
                    </label>
                    <textarea
                      rows={3}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="E.g., Kitchen sink faucet is dripping continuously, need washer replaced."
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Proposed Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={jobOfferedPrice}
                        onChange={(e) => setJobOfferedPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#0B5D43]"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Worker base rate: ₹{quickBookWorker.hourlyRate}/hr. You can negotiate mutual offers anytime.
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setQuickBookWorker(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="px-5 py-2 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      {bookingSubmitting ? 'Confirming...' : 'Confirm & Dispatch'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
