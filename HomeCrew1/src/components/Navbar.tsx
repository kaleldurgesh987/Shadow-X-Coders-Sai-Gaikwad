import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  PlusCircle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Globe,
  Briefcase,
  Info
} from 'lucide-react';
import { HomeCrewLogo } from './LogoAnimation';
import { useAuth } from '../context/AuthContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { userProfile, currentUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Dynamic Navigation Links based on Login & Role
  const isWorker = userProfile?.role === 'worker';
  const isAdmin = userProfile?.role === 'admin';
  const isLoggedIn = !!currentUser || !!userProfile;

  const navLinks = [
    { name: 'Home', path: '/', icon: Info, publicOnly: true },
    { name: t('findWorkers'), path: '/workers', icon: Search, always: true },
    ...(isLoggedIn && !isWorker ? [{ name: t('postJob'), path: '/post-job', icon: PlusCircle }] : []),
    ...(isLoggedIn && !isWorker && !isAdmin ? [{ name: 'Customer Dashboard', path: '/customer/dashboard', icon: Clock }] : []),
    ...(isLoggedIn && isWorker ? [{ name: 'Worker Dashboard', path: '/worker/dashboard', icon: Briefcase }] : []),
    ...(isAdmin ? [{ name: 'Admin Hub', path: '/admin', icon: ShieldCheck }] : []),
    { name: t('aiAssistant'), path: '/ai-assistant', icon: Sparkles, always: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      {/* Top micro announcement */}
      <div className="bg-[#0B5D43] text-white py-1 px-4 text-xs font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F9B000] animate-ping" />
            <span>Professional Hands in your Services &bull; Mumbai MMR Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-gray-200">
            <span>Built by <strong>Team ShadowX Coders</strong></span>
            <span>&bull;</span>
            <span>24/7 Helpline: 1800-HOMECREW</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <HomeCrewLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0B5D43] text-white shadow-xs'
                    : 'text-gray-700 hover:text-[#0B5D43] hover:bg-[#FAFBF8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F9B000]' : 'text-gray-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative group">
            <button
              aria-label="Select Language"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#0B5D43]" />
              <span className="uppercase">{language}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-200 py-1 hidden group-hover:block z-50">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 ${language === 'en' ? 'text-[#0B5D43] font-bold' : 'text-gray-700'}`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 ${language === 'hi' ? 'text-[#0B5D43] font-bold' : 'text-gray-700'}`}
              >
                हिंदी (HI)
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 ${language === 'mr' ? 'text-[#0B5D43] font-bold' : 'text-gray-700'}`}
              >
                मराठी (MR)
              </button>
            </div>
          </div>

          {/* Authenticated Dashboard Link */}
          {userProfile && (
            <Link
              to={userProfile.role === 'admin' ? '/admin' : userProfile.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all bg-[#0B5D43]/5 border-[#0B5D43]/20 text-[#0B5D43] hover:bg-[#0B5D43]/10"
              title={`View ${userProfile.role} dashboard`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#F9B000]" />
              <span className="capitalize">{userProfile.role} Portal</span>
            </Link>
          )}

          {/* User Sign In / Profile Avatar */}
          {userProfile ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile-setup"
                title="Edit / View Profile"
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#0B5D43]" />
                <span>Profile</span>
              </Link>
              <Link
                to={userProfile.role === 'admin' ? '/admin' : userProfile.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title={`${userProfile.name} (${userProfile.role})`}
              >
                <img
                  src={userProfile.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#0B5D43]"
                />
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-xl bg-[#0B5D43] hover:bg-[#084532] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <User className="w-4 h-4 text-[#F9B000]" />
              <span>Login / Sign Up</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-[#0B5D43] text-white' : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#F9B000]' : 'text-gray-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {!userProfile && (
            <div className="pt-2 border-t border-gray-100">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-[#0B5D43] text-white text-center rounded-xl text-sm font-bold block"
              >
                Login / Sign Up with Google
              </Link>
            </div>
          )}

          {userProfile && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Current Role: <strong className="text-gray-900 capitalize">{userProfile.role}</strong></span>
                <button
                  onClick={logout}
                  className="text-red-600 font-bold"
                >
                  Sign Out
                </button>
              </div>
              <div className="pt-1">
                <Link
                  to={userProfile.role === 'admin' ? '/admin' : userProfile.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 bg-[#0B5D43] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Go to {userProfile.role.toUpperCase()} Dashboard &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
