import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin, CheckCircle } from 'lucide-react';
import { HomeCrewLogo } from './LogoAnimation';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B5D43] text-white pt-14 pb-8 border-t-4 border-[#F9B000]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="bg-[#FAFBF8] p-3 rounded-2xl inline-block shadow-sm">
              <HomeCrewLogo size="md" />
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Hyperlocal service marketplace connecting customers with verified nearby blue-collar workers within 30 minutes. Ensuring dignified living wages, safety, and price transparency.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-xs text-[#F9B000] font-semibold">
              <HeartHandshake className="w-4 h-4" />
              <span>Social Impact Initiative</span>
            </div>
          </div>

          {/* Supported Trades */}
          <div>
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-[#F9B000] mb-4">
              Local Blue-Collar Services
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-emerald-100">
              <li className="hover:text-white transition-colors">&bull; Plumbers</li>
              <li className="hover:text-white transition-colors">&bull; Electricians</li>
              <li className="hover:text-white transition-colors">&bull; Painters</li>
              <li className="hover:text-white transition-colors">&bull; Cleaners</li>
              <li className="hover:text-white transition-colors">&bull; Housemaids</li>
              <li className="hover:text-white transition-colors">&bull; Cooks</li>
              <li className="hover:text-white transition-colors">&bull; Carpenters</li>
              <li className="hover:text-white transition-colors">&bull; AC Repair</li>
              <li className="hover:text-white transition-colors">&bull; Appliance Repair</li>
              <li className="hover:text-white transition-colors">&bull; Handymen</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-[#F9B000] mb-4">
              Platform & Safety
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100">
              <li>
                <Link to="/workers" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F9B000]" />
                  <span>Find Nearby Workers</span>
                </Link>
              </li>
              <li>
                <Link to="/post-job" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F9B000]" />
                  <span>Post a Service Job</span>
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F9B000]" />
                  <span>Maps AI Assistant</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F9B000]" />
                  <span>About HomeCrew Mission</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F9B000]" />
                  <span>Privacy Policy & Location Terms</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#F9B000]" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hackathon Badge */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm tracking-wider uppercase text-[#F9B000] mb-4">
              Contact & Support
            </h4>
            <div className="text-xs text-emerald-100 space-y-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F9B000] shrink-0" />
                <span>Mumbai Metropolitan Region, India</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#F9B000] shrink-0" />
                <span>24/7 Helpline: +91 98200 98200</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F9B000] shrink-0" />
                <span>support@homecrew.org</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/50 text-xs">
              <div className="font-semibold text-white">Social Impact Focus</div>
              <div className="text-[11px] text-emerald-200 mt-0.5">
                0% commission taken from worker base earnings. Empowering local informal workers with digital access.
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Hackathon Tagline & Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200 gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span>&copy; {new Date().getFullYear()} HomeCrew.</span>
            <span>&bull;</span>
            <span className="text-[#F9B000] font-bold">Built by Team ShadowX Coders</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-emerald-300">
            Professional Hands in your Services &bull; Powered by Google Maps Platform & Firebase
          </div>
        </div>
      </div>
    </footer>
  );
};
