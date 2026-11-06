import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Phone, 
  User, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HomeCrewLogo } from '../components/LogoAnimation';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, loginWithGoogle, loginWithPhone, updateRole } = useAuth();

  // Selected role for registration (strictly customer or worker only)
  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker'>('customer');
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, redirect to their role dashboard or profile setup if not yet completed
  useEffect(() => {
    if (userProfile) {
      if (userProfile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userProfile.role === 'worker') {
        navigate(userProfile.profileCompleted ? '/worker/dashboard' : '/profile-setup?role=worker', { replace: true });
      } else {
        navigate(userProfile.profileCompleted ? '/customer/dashboard' : '/profile-setup?role=customer', { replace: true });
      }
    }
  }, [userProfile, navigate]);

  const redirectAfterLogin = (role: UserRole) => {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    if (redirectParam) {
      navigate(redirectParam);
      return;
    }

    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'worker') {
      navigate(userProfile?.profileCompleted ? '/worker/dashboard' : '/profile-setup?role=worker');
    } else {
      navigate(userProfile?.profileCompleted ? '/customer/dashboard' : '/profile-setup?role=customer');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const loggedIn = await loginWithGoogle();
      if (!loggedIn) {
        setErrorMsg('Google sign-in popup was closed or cancelled. Please try again or use 1-Click Persona Access below.');
        setLoading(false);
        return;
      }
      // If new profile was created, respect selectedRole (customer or worker)
      if (userProfile?.role === 'admin') {
        redirectAfterLogin('admin');
      } else {
        await updateRole(selectedRole);
        redirectAfterLogin(selectedRole);
      }
    } catch (err: any) {
      console.error('Sign-in error details:', err);
      if (err?.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domain ${window.location.hostname} is not authorized in Firebase Console. Please add this domain under Authentication > Settings > Authorized domains.`);
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('Your browser blocked the sign-in popup window. Please allow popups or use Phone Number OTP below.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setErrorMsg('Google Sign-In is not enabled under Firebase Console > Authentication > Sign-in method. You can use Phone Number OTP below.');
      } else {
        setErrorMsg(`Sign-in error (${err?.code || 'failed'}): ${err?.message || 'Unable to connect'}. Please try again or use Phone Number OTP.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setErrorMsg(null);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithPhone(phoneNumber, selectedRole, fullName || 'HomeCrew Member');
      redirectAfterLogin(selectedRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate phone OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Logo and Tagline */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <HomeCrewLogo size="lg" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Join Mumbai's trusted blue-collar service community
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
          {/* Role Choice (Strictly Customer or Worker - Admin is prohibited from public registration) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                I am joining HomeCrew as:
              </label>
              <span className="text-[10px] text-gray-400 font-semibold">2 Available Roles</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'customer'
                    ? 'bg-emerald-50 border-[#0B5D43] text-[#0B5D43] ring-1 ring-[#0B5D43]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <User className="w-4 h-4 text-[#0B5D43]" />
                  <span>Customer</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Hire nearby workers within 30 min</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('worker')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'worker'
                    ? 'bg-emerald-50 border-[#0B5D43] text-[#0B5D43] ring-1 ring-[#0B5D43]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Briefcase className="w-4 h-4 text-[#F9B000]" />
                  <span>Worker</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Offer skills & keep 100% earnings</p>
              </button>
            </div>
          </div>

          {/* Tab Selector: Google vs Phone OTP */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setAuthMethod('google')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMethod === 'google' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              Google Sign-In
            </button>
            <button
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                authMethod === 'phone' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              Phone Number OTP
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
              {errorMsg}
            </div>
          )}

          {authMethod === 'google' ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                Securely authenticate using your Google Account with Firebase Authentication.
              </p>

              {/* Official Google Sign-In Material Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer hover:shadow-md"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="E.g., Aarti Deshmukh"
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Indian Mobile Number (+91)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98200 12345"
                        maxLength={10}
                        required
                        className="w-full pl-12 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#0B5D43]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Send OTP Verification Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800">
                    6-digit verification code sent to +91 {phoneNumber}.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                      className="w-full px-3 py-2 text-center text-lg font-mono font-bold tracking-widest bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B5D43]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Enter HomeCrew'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Security & Social Impact Note */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-[#0B5D43]" />
            <span>Encrypted Auth &bull; 0% Commission &bull; Fair Wages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
