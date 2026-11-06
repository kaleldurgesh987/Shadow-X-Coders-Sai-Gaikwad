import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  MapPin, 
  Clock, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEED_WORKERS } from '../data/seedWorkers';
import { createJobBooking } from '../services/firestoreService';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();

  const [service, setService] = useState('Plumber');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Dadar West, Mumbai');
  const [timing, setTiming] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [budget, setBudget] = useState('600');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const servicesList = [
    'Plumber',
    'Electrician',
    'Cleaner',
    'Carpenter',
    'Painter',
    'AC repair technicians',
    'Appliance repair technicians',
    'Cooks',
    'Housemaids',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Find closest worker matching service
    const matchedWorker = SEED_WORKERS.find((w) => w.services.includes(service)) || SEED_WORKERS[0];

    try {
      createJobBooking({
        customerId: userProfile?.uid || currentUser?.uid || '',
        customerName: userProfile?.name || 'Customer',
        customerPhone: userProfile?.phoneNumber || '+919820011223',
        customerWhatsapp: userProfile?.whatsappNumber || '+919820011223',
        workerId: matchedWorker.id,
        workerName: matchedWorker.name,
        workerPhone: matchedWorker.phoneNumber,
        workerWhatsapp: matchedWorker.whatsappNumber,
        service,
        description,
        location: location || 'Dadar West, Mumbai',
        scheduledAt: timing === 'now' ? new Date().toISOString() : scheduledDate || new Date().toISOString(),
        isImmediate: timing === 'now',
        status: 'pending',
        initialPrice: Number(budget) || 500,
      });
    } catch (err) {
      console.warn('Booking creation handled:', err);
    }

    setTimeout(() => {
      navigate(`/customer/dashboard`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#0B5D43] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F9B000]" />
            <span>Fast Job Broadcast</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900">
            Post a Service Request
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Nearby verified workers receive your request instantly and respond with offers
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-heading font-black text-gray-900">
                Job Request Broadcasted!
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Notifying top-rated local professionals in Mumbai. Redirecting you to review offers...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Service Category
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 outline-none focus:border-[#0B5D43] focus:bg-white"
                >
                  {servicesList.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Describe Your Problem
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Bathroom shower tap leaking continuously, need replacement and pipe check..."
                  rows={4}
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#0B5D43] focus:bg-white"
                />
              </div>

              {/* Photos upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Attach Problem Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-2 transition-colors border border-gray-200">
                    <Camera className="w-4 h-4 text-[#0B5D43]" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {photoPreview && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Timing */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  When Do You Need The Professional?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTiming('now')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      timing === 'now'
                        ? 'bg-emerald-50 border-[#0B5D43] text-[#0B5D43]'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Clock className="w-4 h-4 text-[#F9B000]" />
                      <span>Immediate (Within 30 Mins)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Dispatches to available nearby workers</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTiming('schedule')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      timing === 'schedule'
                        ? 'bg-emerald-50 border-[#0B5D43] text-[#0B5D43]'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Calendar className="w-4 h-4 text-[#0B5D43]" />
                      <span>Schedule for Later</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Choose convenient day and time</p>
                  </button>
                </div>
              </div>

              {/* Location & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Service Address / Area
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="E.g., Bandra West, Mumbai"
                      required
                      className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#0B5D43] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Initial Budget Offer (₹)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="100"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#0B5D43] focus:bg-white"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Broadcast Request to Nearby Workers</span>
                <ArrowRight className="w-4 h-4 text-[#F9B000]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B5D43]" />
                <span>Zero obligation &bull; Free price negotiation with verified workers</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
