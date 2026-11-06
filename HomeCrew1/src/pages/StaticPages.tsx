import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { HomeCrewLogo } from '../components/LogoAnimation';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFBF8] py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0B5D43] uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4 text-[#F9B000]" />
          <span>Social Impact Mission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900">
          About HomeCrew & Our Mission
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          HomeCrew was built by <strong>Team ShadowX Coders</strong> as an ethical, hyperlocal social impact platform designed to bridge the gap between Mumbai households and trusted blue-collar professionals.
        </p>

        <div className="bg-emerald-50 border-l-4 border-[#0B5D43] p-5 rounded-r-2xl space-y-2">
          <h3 className="font-heading font-bold text-[#0B5D43] text-base">The Core Problem We Solve:</h3>
          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            Mainstream corporate gig platforms charge workers between 20% to 35% commission on their hard-earned daily wages, while obfuscating direct phone contact and imposing rigid automated penalties. Informal workers frequently struggle to build sustainable local client networks.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-heading font-bold text-gray-900">The HomeCrew Difference</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block mb-1">0% Worker Commission</span>
              <p className="text-gray-500">Every single rupee earned goes directly to the professional via cash or direct UPI.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block mb-1">Mutual Price Negotiation</span>
              <p className="text-gray-500">Customers and workers converse directly through real-time counteroffers to agree on fair rates.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block mb-1">Within 30-Minute Dispatch</span>
              <p className="text-gray-500">Google Maps Platform geospatial clustering pairs you with nearby available talent rapidly.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-900 block mb-1">WhatsApp Direct Connection</span>
              <p className="text-gray-500">Instant Click-to-Chat with pre-composed service details for frictionless communication.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Built by Team ShadowX Coders &bull; Mumbai MMR</span>
          <Link to="/" className="text-[#0B5D43] font-bold hover:underline">Return Home &rarr;</Link>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFBF8] py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <h1 className="text-3xl font-heading font-black text-gray-900">
          Privacy Policy & Location Terms
        </h1>
        <p className="text-xs text-gray-400">Last updated: March 2026</p>

        <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <h3 className="font-heading font-bold text-gray-900 text-base">1. Geospatial & Location Privacy</h3>
          <p>
            HomeCrew requests browser geolocation with explicit user permission solely to calculate travel distances to nearby service professionals. Live worker location sharing occurs strictly during active booking sessions and stops immediately once a job is finished or cancelled.
          </p>

          <h3 className="font-heading font-bold text-gray-900 text-base">2. Contact Number Protection</h3>
          <p>
            Personal phone and WhatsApp numbers are not exposed in public search indices. Contact credentials become accessible only between the customer and assigned worker once an offer is accepted and confirmed.
          </p>

          <h3 className="font-heading font-bold text-gray-900 text-base">3. Data Storage & Firebase Infrastructure</h3>
          <p>
            All persistent profile data, negotiations, reviews, and bookings are secured using Cloud Firestore security rules with attribute-based access control. No user passwords or credentials are saved unencrypted.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Link to="/" className="text-[#0B5D43] text-xs font-bold hover:underline">&larr; Return to HomeCrew</Link>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFBF8] py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <h1 className="text-3xl font-heading font-black text-gray-900">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-gray-400">Last updated: March 2026</p>

        <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <h3 className="font-heading font-bold text-gray-900 text-base">1. Direct Professional Engagement</h3>
          <p>
            HomeCrew facilitates direct connections between customers and independent blue-collar workers. All agreed payments for labour and materials are paid directly to the worker via cash or UPI upon job inspection.
          </p>

          <h3 className="font-heading font-bold text-gray-900 text-base">2. Negotiation & Cancellations</h3>
          <p>
            Price quotes generated through the negotiation interface become binding upon acceptance. Customers can cancel a request without penalty prior to the worker beginning transit.
          </p>

          <h3 className="font-heading font-bold text-gray-900 text-base">3. Safety & Emergency Notice</h3>
          <p>
            HomeCrew incorporates in-app safety checklists and simulated Emergency SOS reporting tools for rapid incident logging. For real life emergencies, users should dial national helpline 112.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Link to="/" className="text-[#0B5D43] text-xs font-bold hover:underline">&larr; Return to HomeCrew</Link>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFBF8] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-4">
        <HomeCrewLogo size="lg" />
      </div>
      <h1 className="text-5xl font-heading font-black text-gray-900">404</h1>
      <p className="text-sm font-semibold text-gray-600 mt-2">
        Page Not Found
      </p>
      <p className="text-xs text-gray-400 max-w-xs mt-1">
        The service or page you are looking for has been moved or does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-[#0B5D43] hover:bg-[#084532] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
      >
        Back to HomeCrew Home
      </Link>
    </div>
  );
};
