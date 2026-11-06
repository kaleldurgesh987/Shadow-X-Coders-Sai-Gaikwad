import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Award, 
  FileText, 
  ChevronRight, 
  ThumbsUp, 
  AlertCircle 
} from 'lucide-react';
import { SEED_WORKERS } from '../data/seedWorkers';
import { useAuth } from '../context/AuthContext';
import { createJobBooking } from '../services/firestoreService';

export const WorkerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();

  const worker = SEED_WORKERS.find((w) => w.id === id) || SEED_WORKERS[0];

  const [bookingHours, setBookingHours] = useState<number>(2);
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      author: 'Priya Sharma (Bandra West)',
      rating: 5,
      date: '2 days ago',
      comment: 'Arrived exactly within 25 minutes! Extremely courteous, quickly solved the kitchen pipe leakage, and charged the exact agreed rate. Super professional!',
    },
    {
      id: 'rev-2',
      author: 'Vikram Mehta (Dadar)',
      rating: 5,
      date: '1 week ago',
      comment: 'Top quality workmanship. Brought all specialized tools, wore shoe covers before entering, and left the work area completely clean. Highly recommended.',
    },
    {
      id: 'rev-3',
      author: 'Ananya Deshmukh (Andheri)',
      rating: 4.8,
      date: '2 weeks ago',
      comment: 'Very polite and skilled. Transparent with parts cost receipt. HomeCrew direct negotiation made it so hassle-free.',
    },
  ]);

  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setReviewsList([
      {
        id: `rev-${Date.now()}`,
        author: userProfile?.name || 'Verified Customer',
        rating: newRating,
        date: 'Just now',
        comment: newReviewText,
      },
      ...reviewsList,
    ]);
    setNewReviewText('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const estimatedTotal = worker.hourlyRate * bookingHours;

  const cleanPhone = worker.whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${worker.name}, I am viewing your profile on HomeCrew and would like to hire you for ${worker.services.join(', ')}.`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#0B5D43]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/workers" className="hover:text-[#0B5D43]">Workers</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-semibold">{worker.name}</span>
        </div>

        {/* Worker Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative">
              <img
                src={worker.profileImage}
                alt={worker.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm shrink-0"
              />
              <div className="absolute -bottom-2 -right-2 bg-[#0B5D43] text-white p-1.5 rounded-full shadow-md" title="Govt ID Verified">
                <ShieldCheck className="w-5 h-5 text-[#F9B000]" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900">
                    {worker.name}
                  </h1>
                  <p className="text-sm font-bold text-[#0B5D43] mt-0.5">
                    {worker.services.join(' & ')} &bull; {worker.experienceYears} Years On-Field Experience
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-xl text-sm font-extrabold flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F9B000] fill-current" />
                    <span>{worker.averageRating}</span>
                    <span className="text-xs text-gray-500 font-normal">({worker.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {worker.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#F9B000]" />
                  <span>{worker.location} ({worker.workingArea})</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Avg. Arrival: &lt;25 Minutes</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <Award className="w-4 h-4" />
                  <span>{worker.idProofType || 'Aadhaar Verified Professional'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Details & Booking Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Skills & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills & Specialties */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-lg font-heading font-bold text-gray-900">
                Verified Skills & Service Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl bg-[#FAFBF8] border border-emerald-200 text-[#0B5D43] text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F9B000]" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Service & Rate Transparency */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-lg font-heading font-bold text-gray-900">
                Pricing & Transparency
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 font-semibold uppercase">Hourly Labour Charge</span>
                  <div className="text-xl font-heading font-black text-gray-900 mt-1">₹{worker.hourlyRate} / hr</div>
                  <p className="text-gray-500 mt-1">Includes basic diagnosis and standard hand tooling.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-gray-400 font-semibold uppercase">Spare Parts & Consumables</span>
                  <div className="text-base font-heading font-bold text-gray-900 mt-1">At Actual Bill</div>
                  <p className="text-gray-500 mt-1">Worker presents original GST hardware receipts without markup.</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-[#0B5D43] shrink-0" />
                <span>HomeCrew Social Guarantee: 100% of your payment goes straight to {worker.name}.</span>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-bold text-gray-900">
                    Customer Reviews & Feedback
                  </h2>
                  <p className="text-xs text-gray-500">Real feedback from verified Mumbai service bookings</p>
                </div>
                <span className="text-xs font-bold text-[#0B5D43] bg-emerald-50 px-2.5 py-1 rounded-full">
                  {reviewsList.length} Verified Reviews
                </span>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">Leave a Review for {worker.name}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-0.5 text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${star <= newRating ? 'fill-current text-[#F9B000]' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share details about punctuality, skill quality, and experience..."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#0B5D43]"
                />

                <div className="flex justify-between items-center">
                  {reviewSubmitted ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Review published!</span>
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B5D43] hover:bg-[#084532] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-xs text-gray-900">{rev.author}</span>
                      <div className="flex items-center gap-1">
                        <div className="flex text-[#F9B000]">
                          {Array.from({ length: Math.round(rev.rating) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 ml-1">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Instant Booking & Action Widget */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-[#0B5D43] shadow-lg sticky top-24 space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Fast Booking</span>
                <h3 className="text-xl font-heading font-black text-gray-900 mt-1">Book {worker.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose your duration or make an offer</p>
              </div>

              {/* Hours Selector */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Estimated Duration</span>
                  <span>{bookingHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={bookingHours}
                  onChange={(e) => setBookingHours(Number(e.target.value))}
                  className="w-full accent-[#0B5D43] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>1 Hour (Quick fix)</span>
                  <span>4 Hours (Half day)</span>
                  <span>8 Hours (Full day)</span>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Rate per hour</span>
                  <span>₹{worker.hourlyRate}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Service duration</span>
                  <span>&times; {bookingHours} hrs</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-heading font-extrabold text-gray-900">
                  <span className="text-sm">Estimated Total</span>
                  <span className="text-2xl text-[#0B5D43]">₹{estimatedTotal}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to={`/negotiate?workerId=${worker.id}&hours=${bookingHours}`}
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl font-extrabold text-sm text-center block transition-colors shadow-sm"
                >
                  Negotiate & Send Counteroffer
                </Link>

                <button
                  onClick={async () => {
                    try {
                      await createJobBooking({
                        customerId: userProfile?.uid || currentUser?.uid || '',
                        customerName: userProfile?.name || 'HomeCrew Customer',
                        customerPhone: userProfile?.phoneNumber || '+919820011223',
                        customerWhatsapp: userProfile?.whatsappNumber || '+919820011223',
                        workerId: worker.id,
                        workerName: worker.name,
                        workerPhone: worker.phoneNumber,
                        workerWhatsapp: worker.whatsappNumber,
                        service: worker.services[0] || 'General Repair',
                        description: `Booked ${bookingHours} hour(s) of ${worker.services.join(', ')} service.`,
                        location: userProfile?.location || 'Mumbai, Maharashtra',
                        scheduledAt: new Date().toISOString(),
                        isImmediate: true,
                        status: 'in_progress',
                        initialPrice: estimatedTotal,
                        finalPrice: estimatedTotal,
                        etaMinutes: 20,
                      });
                    } catch (e) {
                      console.warn('Booking creation handled:', e);
                    }
                    navigate(`/tracking?workerId=${worker.id}&service=${encodeURIComponent(worker.services[0])}&amount=${estimatedTotal}`);
                  }}
                  className="w-full py-3.5 px-4 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl font-extrabold text-sm text-center block transition-colors shadow-md cursor-pointer"
                >
                  Instant Book (₹{estimatedTotal})
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>

              {/* Privacy Notice */}
              <p className="text-[11px] text-gray-400 text-center leading-normal">
                Your exact phone number and home address are only shared with {worker.name} once booking is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
