import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Search,
  Filter,
  DollarSign,
  User,
  Phone,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { WorkerProfile, UserProfile, Job, JobStatus } from '../types';
import { 
  subscribeWorkers, 
  subscribeAllBookings, 
  subscribeAllUsers, 
  updateWorkerVerification,
  updateJobStatus,
  cancelJobBooking,
  ensureSeedWorkersInFirestore
} from '../services/firestoreService';
import { SEED_WORKERS } from '../data/seedWorkers';

export const AdminDashboard: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerProfile[]>(SEED_WORKERS);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Active section tabs in Admin Dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'bookings'>('overview');

  // Booking management status filter
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // User management search filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'customer' | 'worker'>('all');

  // Worker verification filter
  const [workerFilterQuery, setWorkerFilterQuery] = useState('');

  useEffect(() => {
    ensureSeedWorkersInFirestore();

    const unsubWorkers = subscribeWorkers((data) => {
      setWorkers(data);
    });

    const unsubBookings = subscribeAllBookings((data) => {
      setBookings(data);
      setLoading(false);
    });

    const unsubUsers = subscribeAllUsers((data) => {
      setUsers(data);
    });

    return () => {
      unsubWorkers();
      unsubBookings();
      unsubUsers();
    };
  }, []);

  // Overview Statistics
  const totalCustomers = users.filter((u) => u.role === 'customer').length || 8;
  const totalWorkersCount = workers.length;
  const totalBookingsCount = bookings.length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'in_progress' || b.status === 'confirmed').length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledBookingsCount = bookings.filter((b) => b.status === 'cancelled').length;
  
  // Pending worker verification list
  const pendingWorkers = workers.filter((w) => w.verificationStatus === 'pending' || !w.verificationStatus);
  const pendingVerificationsCount = pendingWorkers.length;

  // Handle Approve Worker Verification (Saves in Firebase)
  const handleApproveWorker = async (workerId: string) => {
    try {
      await updateWorkerVerification(workerId, 'verified');
    } catch (err) {
      console.error('Failed to approve worker in Firebase:', err);
    }
  };

  // Handle Reject Worker Verification (Saves in Firebase)
  const handleRejectWorker = async (workerId: string) => {
    try {
      await updateWorkerVerification(workerId, 'unverified');
    } catch (err) {
      console.error('Failed to reject worker in Firebase:', err);
    }
  };

  // Admin Booking Action: Cancel Booking
  const handleAdminCancelBooking = async (jobId: string) => {
    const reason = window.prompt('Enter cancellation reason (e.g. Inappropriate request / Duplicate):', 'Cancelled by Admin');
    if (!reason) return;
    try {
      await cancelJobBooking(jobId, reason);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  // Admin Booking Action: Resolve Booking
  const handleAdminResolveBooking = async (jobId: string) => {
    try {
      await updateJobStatus(jobId, 'completed');
    } catch (err) {
      console.error('Failed to resolve booking:', err);
    }
  };

  // Filtered Bookings for Management
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = 
      bookingFilter === 'all' ||
      (bookingFilter === 'pending' && (b.status === 'pending' || b.status === 'negotiating')) ||
      (bookingFilter === 'accepted' && b.status === 'confirmed') ||
      (bookingFilter === 'in_progress' && b.status === 'in_progress') ||
      (bookingFilter === 'completed' && b.status === 'completed') ||
      (bookingFilter === 'cancelled' && b.status === 'cancelled');

    const matchesSearch = 
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.service.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.workerName && b.workerName.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      b.location.toLowerCase().includes(bookingSearch.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(userSearch));
    return matchesRole && matchesSearch;
  });

  // Filtered Workers for Directory
  const filteredWorkersList = workers.filter((w) =>
    w.name.toLowerCase().includes(workerFilterQuery.toLowerCase()) ||
    w.services.some((s) => s.toLowerCase().includes(workerFilterQuery.toLowerCase())) ||
    w.location.toLowerCase().includes(workerFilterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Admin Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0B5D43] text-white rounded-2xl shadow-sm">
              <ShieldCheck className="w-7 h-7 text-[#F9B000]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0B5D43] uppercase tracking-wider">
                  System Administration
                </span>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  Master Privileges
                </span>
              </div>
              <h1 className="text-2xl font-heading font-black text-gray-900 mt-0.5">
                HomeCrew Operations Hub
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Full platform oversight &bull; Real-time Firebase database connected
              </p>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-[#0B5D43] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'verifications' ? 'bg-[#0B5D43] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Verifications</span>
              {pendingVerificationsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-[10px] flex items-center justify-center font-black">
                  {pendingVerificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-[#0B5D43] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'bookings' ? 'bg-[#0B5D43] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bookings
            </button>
          </div>
        </div>

        {/* OVERVIEW SECTION: Real-time Statistics */}
        {(activeTab === 'overview' || activeTab === 'verifications') && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Total Customers</span>
              <div className="text-3xl font-heading font-black text-gray-900 mt-1">{totalCustomers}</div>
              <span className="text-[11px] text-gray-400">Registered platform users</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Total Workers</span>
              <div className="text-3xl font-heading font-black text-[#0B5D43] mt-1">{totalWorkersCount}</div>
              <span className="text-[11px] text-emerald-600 font-bold">
                {workers.filter((w) => w.verificationStatus === 'verified').length} verified by ID
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Total Bookings</span>
              <div className="text-3xl font-heading font-black text-gray-900 mt-1">{totalBookingsCount}</div>
              <span className="text-[11px] text-gray-400">
                {completedBookingsCount} completed &bull; {activeBookingsCount} active
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Pending Verifications</span>
              <div className="text-3xl font-heading font-black text-amber-600 mt-1">{pendingVerificationsCount}</div>
              <span className="text-[11px] text-amber-700 font-bold">Requires audit below</span>
            </div>
          </div>
        )}

        {/* WORKER VERIFICATION QUEUE */}
        {(activeTab === 'overview' || activeTab === 'verifications') && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0B5D43]" />
                  <span>Worker Verification Approval Queue</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review submitted Aadhaar, trade certificates, and background documents before granting verified badge in Firebase
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                {pendingWorkers.length} Pending Approval
              </span>
            </div>

            {pendingWorkers.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                All registered workers have been audited and verified in Firebase!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWorkers.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.profileImage}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-gray-900">{item.name}</span>
                          <span className="text-xs font-semibold text-[#0B5D43] bg-emerald-100 px-2 py-0.5 rounded-md">
                            {item.services.join(', ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {item.location} &bull; Document: <strong>{item.idProofType || 'Aadhaar Card + Trade Certification'}</strong>
                        </p>
                        <span className="text-[11px] text-gray-400">Phone: {item.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleApproveWorker(item.id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Verification</span>
                      </button>
                      <button
                        onClick={() => handleRejectWorker(item.id)}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-gray-200 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKING MANAGEMENT SECTION */}
        {(activeTab === 'overview' || activeTab === 'bookings') && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0B5D43]" />
                  <span>Platform-Wide Booking Management</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Oversight of all customer service bookings across Mumbai MMR
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setBookingFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600'}`}
                >
                  All ({bookings.length})
                </button>
                <button
                  onClick={() => setBookingFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-gray-600'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setBookingFilter('accepted')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilter === 'accepted' ? 'bg-white text-blue-800 shadow-xs font-bold' : 'text-gray-600'}`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setBookingFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilter === 'in_progress' ? 'bg-white text-[#0B5D43] shadow-xs font-bold' : 'text-gray-600'}`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setBookingFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilter === 'completed' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-600'}`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setBookingFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${bookingFilter === 'cancelled' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600'}`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {/* Booking Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Filter bookings by ID, customer name, worker name, service or locality..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
              />
            </div>

            {filteredBookings.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                No bookings match the selected filters.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-mono text-[#0B5D43]">#{b.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">&bull;</span>
                        <span className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h4 className="font-heading font-bold text-sm text-gray-900">
                        {b.service}: {b.description}
                      </h4>

                      <div className="text-xs text-gray-600 flex items-center gap-3 flex-wrap">
                        <span>Customer: <strong>{b.customerName}</strong> ({b.customerPhone || 'N/A'})</span>
                        <span>&bull;</span>
                        <span>Worker: <strong>{b.workerName || 'Not Assigned'}</strong> ({b.workerPhone || 'N/A'})</span>
                        <span>&bull;</span>
                        <span>Location: {b.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Agreed Amount</span>
                        <div className="text-base font-heading font-black text-[#0B5D43]">
                          ₹{b.finalPrice || b.initialPrice}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {b.status !== 'completed' && b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleAdminResolveBooking(b.id)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                            title="Mark Resolved"
                          >
                            Resolve
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleAdminCancelBooking(b.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USER MANAGEMENT SECTION */}
        {(activeTab === 'overview' || activeTab === 'users') && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0B5D43]" />
                  <span>Platform Users Directory</span>
                </h2>
                <p className="text-xs text-gray-500">Live roster of customers and workers registered in Firebase</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={userRoleFilter}
                  onChange={(e: any) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#0B5D43]"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="worker">Workers</option>
                </select>

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, email, phone..."
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase font-semibold text-[10px]">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Contact Information</th>
                    <th className="py-3 px-3">Locality</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-gray-500">
                        No user profiles found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2 font-bold text-gray-900">
                          <img src={u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'} alt="" className="w-7 h-7 rounded-lg object-cover" />
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'worker' ? 'bg-amber-100 text-amber-900' :
                            'bg-emerald-100 text-[#0B5D43]'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          <div>{u.email || 'Phone verified'}</div>
                          <div className="text-[11px] text-gray-400">{u.phoneNumber || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-3 text-gray-500">{u.location || 'Mumbai, Maharashtra'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
