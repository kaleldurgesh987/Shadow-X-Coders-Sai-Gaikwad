import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  Sparkles, 
  Paintbrush, 
  Hammer, 
  Wind, 
  Utensils, 
  UserCheck, 
  ArrowRight, 
  Star, 
  MessageCircle, 
  CheckCircle2, 
  HeartHandshake,
  Phone,
  Mail,
  Building,
  User,
  Briefcase,
  Award,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SEED_WORKERS } from '../data/seedWorkers';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { name: 'Plumber', icon: Wrench, count: '3 Nearby', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Electrician', icon: Zap, count: '3 Nearby', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Cleaner', icon: Sparkles, count: '4 Nearby', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Carpenter', icon: Hammer, count: '2 Nearby', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'Painter', icon: Paintbrush, count: '2 Nearby', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'AC repair technicians', icon: Wind, count: '3 Nearby', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { name: 'Cooks', icon: Utensils, count: '2 Nearby', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Housemaids', icon: UserCheck, count: '2 Nearby', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/workers?q=${encodeURIComponent(searchQuery)}&cat=${encodeURIComponent(selectedCategory)}`);
  };

  const featuredWorkers = SEED_WORKERS.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFBF8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-radial from-emerald-50/70 via-white to-[#FAFBF8]">
        {/* Subtle Decorative Background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs sm:text-sm font-bold text-[#0B5D43] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#0B5D43] animate-pulse" />
              <span>Hyperlocal Social Impact &bull; Real Mumbai Blue-Collar Pros</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              HomeCrew
              <span className="text-[#0B5D43] block mt-1 text-2xl sm:text-4xl lg:text-5xl font-heading font-bold">
                Professional Hands in your Services
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
              Connecting Mumbai residents with trusted local plumbers, electricians, carpenters, painters, and domestic help within 30 minutes. Direct rates, zero platform commissions.
            </p>

            {/* Hyperlocal Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-6">
              <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-gray-200 flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1 flex items-center gap-3 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100">
                  <Search className="w-5 h-5 text-[#0B5D43] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by trade (Plumber, AC, Electrician)..."
                    className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 font-medium"
                  />
                </div>

                <div className="flex-1 flex items-center gap-3 px-3 py-1.5">
                  <MapPin className="w-5 h-5 text-[#F9B000] shrink-0" />
                  <input
                    type="text"
                    placeholder="Locality (Dadar, Bandra, Andheri...)"
                    className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <span>Search Pros</span>
                  <ArrowRight className="w-4 h-4 text-[#F9B000]" />
                </button>
              </div>
            </form>

            {/* Visitor CTAs: Login / Register vs Dashboard Link */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {currentUser || userProfile ? (
                <>
                  <Link
                    to={userProfile?.role === 'admin' ? '/admin' : userProfile?.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'}
                    className="px-6 py-3 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Go to My Dashboard ({userProfile?.role?.toUpperCase()})</span>
                    <ArrowRight className="w-4 h-4 text-[#F9B000]" />
                  </Link>
                  <Link
                    to="/profile-setup"
                    className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#0B5D43]" />
                    <span>My Profile & Settings</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-6 py-3 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#F9B000]" />
                    <span>Login / Sign Up</span>
                  </Link>
                  <Link
                    to="/profile-setup?role=worker"
                    className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-[#F9B000]" />
                    <span>Join as Worker Pro</span>
                  </Link>
                  <Link
                    to="/workers"
                    className="px-5 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-[#0B5D43]" />
                    <span>Explore Workers Map</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0B5D43]" />
                <span>30-Min Arrival Window</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0B5D43]" />
                <span>Govt. ID Verified Workers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-[#0B5D43]" />
                <span>Direct WhatsApp Connect</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white border-y border-gray-200/80">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D43] bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
                About HomeCrew
              </span>
              <h2 className="text-3xl font-heading font-black text-gray-900 leading-tight">
                Empowering Communities Through Dignity of Labor
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                HomeCrew was created by <strong>Team ShadowX Coders</strong> as a transformative social impact platform. In mega-cities like Mumbai, millions of highly skilled blue-collar professionals—plumbers, electricians, painters, and carpenters—struggle with low wages, predatory middlemen, and 25-30% aggregator commission cuts.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                HomeCrew redefines local services by establishing direct, respectful, and transparent relationships between homeowners and service pros. With live Google Maps integration, direct rate negotiation, and instant dispatch, HomeCrew delivers dependable service within 30 minutes while ensuring workers keep 100% of their earnings.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-bold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0B5D43]" />
                  <span>0% Commission Model</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0B5D43]" />
                  <span>Direct Customer Payment</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FAFBF8] p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#F9B000]" />
                <span>Our Core Values & Guarantees</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 text-[#0B5D43] rounded-lg shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Thorough Police & Identity Verification</strong>
                    Every worker uploads Aadhaar cards and trade diplomas verified before receiving a verified badge.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 text-[#F9B000] rounded-lg shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Transparent, Negotiable Rates</strong>
                    No hidden surge fees. Customers and workers discuss quotes transparently before confirming the booking.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 text-[#0B5D43] rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Prompt 30-Minute Dispatch Window</strong>
                    Hyperlocal radius matching connects you to the nearest active professional for prompt emergency arrival.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services We Provide Grid */}
      <section id="services" className="py-16 bg-[#FAFBF8]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D43] bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
                Comprehensive Offerings
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 mt-2">
                Services We Provide Across Mumbai
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                From emergency leaks to full home renovations, browse certified specialists available today
              </p>
            </div>
            <Link
              to="/workers"
              className="text-sm font-bold text-[#0B5D43] hover:text-[#084532] flex items-center gap-1 shrink-0"
            >
              <span>Explore All 15+ Workers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/workers?cat=${encodeURIComponent(cat.name)}`}
                  className="group p-5 rounded-2xl border border-gray-200/80 hover:border-[#0B5D43] bg-white hover:shadow-lg transition-all text-left flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {cat.count}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-900 text-base group-hover:text-[#0B5D43] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Direct rate negotiation &bull; 30 min ETA
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Verified Workers */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D43] bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              Verified & Available
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 mt-3">
              Top Rated Workers in Mumbai
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Read real customer ratings, check hourly rates, and initiate a direct booking or offer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={worker.profileImage}
                      alt={worker.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#0B5D43] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F9B000]" />
                      <span>{worker.verificationStatus === 'verified' ? 'Verified' : 'Pending'}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#F9B000] fill-current" />
                      <span>{worker.averageRating}</span>
                      <span className="text-gray-400 font-normal">({worker.totalReviews})</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-heading font-bold text-gray-900 text-lg group-hover:text-[#0B5D43] transition-colors">
                      {worker.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#0B5D43] mt-0.5">
                      {worker.services.join(' & ')} &bull; {worker.experienceYears} yrs exp.
                    </p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{worker.location}</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Standard Rate</span>
                        <div className="text-lg font-heading font-extrabold text-gray-900">
                          ₹{worker.hourlyRate} <span className="text-xs font-normal text-gray-500">/hr</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase">Availability</span>
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Online Now</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex gap-2">
                  <Link
                    to={`/worker/${worker.id}`}
                    className="flex-1 py-2 text-center rounded-xl bg-[#0B5D43] hover:bg-[#084532] text-white text-xs font-bold transition-colors"
                  >
                    View & Book
                  </Link>
                  <a
                    href={`https://wa.me/${worker.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${worker.name}, I found your profile on HomeCrew and need assistance.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    title="WhatsApp Direct"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How HomeCrew Works */}
      <section id="how-it-works" className="py-16 bg-[#FAFBF8] border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F9B000] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 mt-3">
              How HomeCrew Works
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Transparent, dignified, and fast service booking designed specifically for Mumbai
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#0B5D43] font-heading font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                1
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Browse or Post</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Discover nearby workers on the interactive Google Map or post a custom job with requirements and photos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#F9B000] font-heading font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                2
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Direct Negotiation</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Send initial offers and receive instant counteroffers. Agree on a mutually respectful price without intermediaries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#0B5D43] font-heading font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                3
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">30-Min Arrival</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Track your worker en route with live GPS coordinates, estimated arrival time, and arrival alerts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#F9B000] font-heading font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                4
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Direct Pay & WhatsApp</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pay the worker directly via UPI or cash. Zero commission cut from worker wages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HomeCrew Section */}
      <section id="why-choose" className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D43] bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              The HomeCrew Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 mt-3">
              Why Choose HomeCrew?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Built differently from profit-driven gig monopolies to benefit both homeowners and local workers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-[#FAFBF8] rounded-2xl border border-gray-200/90 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B5D43] flex items-center justify-center font-bold">
                0%
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Zero Platform Commission</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Corporate apps take 20-30% of worker earnings. On HomeCrew, workers take home 100% of agreed fees.
              </p>
            </div>

            <div className="p-6 bg-[#FAFBF8] rounded-2xl border border-gray-200/90 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F9B000] flex items-center justify-center font-bold">
                30m
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Rapid 30-Minute Dispatch</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Hyperlocal radius tracking matches requests with workers located within walking or scooter distance.
              </p>
            </div>

            <div className="p-6 bg-[#FAFBF8] rounded-2xl border border-gray-200/90 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B5D43] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Verified Police & ID Proofs</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Safety first: Aadhaar cards, trade certifications, and background documents audited by administrators.
              </p>
            </div>

            <div className="p-6 bg-[#FAFBF8] rounded-2xl border border-gray-200/90 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F9B000] flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Direct WhatsApp Integration</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Chat or voice call directly on WhatsApp for instantaneous directions, photo sharing, and clarifications.
              </p>
            </div>

            <div className="p-6 bg-[#FAFBF8] rounded-2xl border border-gray-200/90 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B5D43] flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Fair Mutual Price Negotiation</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Customers and workers propose counteroffers dynamically until an equitable price is confirmed.
              </p>
            </div>

            <div className="p-6 bg-[#FAFBF8] rounded-2xl border border-gray-200/90 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                SOS
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-base">Emergency SOS Safety Alert</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Built-in one-tap emergency beacon dispatches live location coordinates to HomeCrew safety helplines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact Banner */}
      <section id="social-impact" className="py-14 bg-gradient-to-br from-[#0B5D43] to-[#084532] text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-xs text-[#F9B000] font-bold">
                <HeartHandshake className="w-4 h-4" />
                <span>Our Mission & Social Impact</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold">
                Empowering India's Informal Workforce
              </h2>
              <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
                Unlike corporate gig aggregators that deduct 20% to 30% from daily wage earners, HomeCrew charges 0% commission on worker services. Workers set their own prices, build authentic customer relationships, and keep 100% of their earnings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link
                to="/auth"
                className="px-6 py-3.5 rounded-xl bg-[#F9B000] hover:bg-[#e09e00] text-gray-950 font-bold text-sm text-center shadow-md transition-colors"
              >
                Sign In / Join HomeCrew
              </Link>
              <Link
                to="/workers"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm text-center border border-white/20 transition-colors"
              >
                Browse Map View
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section id="contact" className="py-16 bg-[#FAFBF8] border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D43] bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              Get in Touch
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 mt-2">
              Contact HomeCrew Support
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Have questions, need emergency assistance, or want to register as an institutional partner?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B5D43] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-sm">24/7 Helpline</h3>
              <p className="text-xs text-gray-500">Toll-free customer & worker assistance desk:</p>
              <p className="text-sm font-bold text-[#0B5D43]">1800-HOMECREW</p>
              <p className="text-xs text-gray-400">+91 (22) 2430-1000</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F9B000] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-sm">Email Support</h3>
              <p className="text-xs text-gray-500">Inquiries, partner onboarding & billing:</p>
              <p className="text-sm font-bold text-[#0B5D43]">support@homecrew.local</p>
              <p className="text-xs text-gray-400">admin@homecrew.local</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0B5D43] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-gray-900 text-sm">Operations Headquarters</h3>
              <p className="text-xs text-gray-500">Mumbai Metropolitan Hub:</p>
              <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                Team ShadowX Coders Innovation Lab,<br />
                Senapati Bapat Marg, Dadar West, Mumbai 400028
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
