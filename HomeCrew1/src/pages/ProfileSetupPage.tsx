import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Sparkles, 
  ArrowRight,
  Upload,
  Globe,
  Sliders,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, UserProfile, WorkerProfile } from '../types';
import { saveCustomerProfile, saveWorkerProfile } from '../services/firestoreService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ImageUpload } from '../components/ImageUpload';

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile, currentUser, updateProfileDetails, updateRole } = useAuth();

  const roleParam = searchParams.get('role') as UserRole | null;
  const initialRole: UserRole = roleParam || userProfile?.role || 'customer';
  const [activeTab, setActiveTab] = useState<'customer' | 'worker'>(
    initialRole === 'worker' ? 'worker' : 'customer'
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Common Avatar Presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  ];

  // Customer Form State
  const [cName, setCName] = useState(userProfile?.name || '');
  const [cEmail, setCEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [cPhone, setCPhone] = useState(userProfile?.phoneNumber || '+91 98200 12345');
  const [cWhatsapp, setCWhatsapp] = useState(userProfile?.whatsappNumber || '+91 98200 12345');
  const [cLocation, setCLocation] = useState(userProfile?.location || 'Dadar West, Mumbai');
  const [cAddress, setCAddress] = useState(userProfile?.address || '');
  const [cLanguage, setCLanguage] = useState<'en' | 'hi' | 'mr'>(userProfile?.preferredLanguage || 'en');
  const [cAvatar, setCAvatar] = useState(userProfile?.profileImage || avatarPresets[0]);
  const [cEmergencyName, setCEmergencyName] = useState(userProfile?.emergencyContactName || '');
  const [cEmergencyPhone, setCEmergencyPhone] = useState(userProfile?.emergencyContactPhone || '');

  // Worker Form State
  const [wName, setWName] = useState(userProfile?.name || '');
  const [wEmail, setWEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [wPhone, setWPhone] = useState(userProfile?.phoneNumber || '+91 98200 98200');
  const [wWhatsapp, setWWhatsapp] = useState(userProfile?.whatsappNumber || '+91 98200 98200');
  const [wService, setWService] = useState('Plumber');
  const [wSkills, setWSkills] = useState('Pipe Fitting, Tap Repair, Drainage Cleaning');
  const [wRate, setWRate] = useState<number>(400);
  const [wFixedRate, setWFixedRate] = useState<number>(550);
  const [wExpYears, setWExpYears] = useState<number>(8);
  const [wWorkingArea, setWWorkingArea] = useState('Dadar, Prabhadevi, Parel');
  const [wLocation, setWLocation] = useState('Dadar West, Mumbai');
  const [wIdType, setWIdType] = useState('Aadhaar Card (Govt. Verified)');
  const [wBio, setWBio] = useState(
    'Experienced trade professional dedicated to punctual, high-quality residential services with transparent pricing.'
  );
  const [wAvatar, setWAvatar] = useState(userProfile?.profileImage || avatarPresets[1]);
  const [wAvailability, setWAvailability] = useState(true);

  // Load existing worker data if available
  useEffect(() => {
    const uid = userProfile?.uid || currentUser?.uid;
    if (uid) {
      getDoc(doc(db, 'workerProfiles', uid)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as WorkerProfile;
          setWName(data.name || wName);
          setWService(data.services?.[0] || 'Plumber');
          setWSkills(data.skills?.join(', ') || wSkills);
          setWRate(data.hourlyRate || 400);
          setWExpYears(data.experienceYears || 8);
          setWLocation(data.location || wLocation);
          setWWorkingArea(data.workingArea || wWorkingArea);
          setWPhone(data.phoneNumber || wPhone);
          setWWhatsapp(data.whatsappNumber || wWhatsapp);
          setWBio(data.bio || wBio);
          setWIdType(data.idProofType || wIdType);
          setWAvatar(data.profileImage || wAvatar);
          setWAvailability(data.availability !== undefined ? data.availability : true);
        }
      }).catch((e) => console.warn('Could not read existing worker profile:', e));
    }
  }, [userProfile?.uid, currentUser?.uid]);

  // Handle Save Customer Profile
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const uid = userProfile?.uid || currentUser?.uid || `phone_${cPhone.replace(/[^0-9]/g, '')}`;

    try {
      const customerData: Partial<UserProfile> & { uid: string } = {
        uid,
        name: cName || 'Customer',
        email: cEmail,
        phoneNumber: cPhone,
        whatsappNumber: cWhatsapp,
        location: cLocation,
        address: cAddress,
        preferredLanguage: cLanguage,
        profileImage: cAvatar,
        emergencyContactName: cEmergencyName,
        emergencyContactPhone: cEmergencyPhone,
        role: 'customer',
        profileCompleted: true,
      };

      await saveCustomerProfile(customerData);
      await updateProfileDetails(customerData);
      await updateRole('customer');

      setSuccessMsg('Customer profile successfully saved to Firebase!');
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Customer profile save error:', err);
      setErrorMsg(`Failed to save profile: ${err.message || 'Please check your connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Worker Profile
  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const uid = userProfile?.uid || currentUser?.uid || `phone_${wPhone.replace(/[^0-9]/g, '')}`;

    try {
      const skillsArr = wSkills.split(',').map((s) => s.trim()).filter(Boolean);

      const workerData: Partial<WorkerProfile> & { id: string } = {
        id: uid,
        workerId: uid,
        name: wName || 'Trade Professional',
        email: wEmail,
        phoneNumber: wPhone,
        whatsappNumber: wWhatsapp,
        services: [wService],
        skills: skillsArr.length > 0 ? skillsArr : [wService],
        hourlyRate: Number(wRate) || 400,
        fixedRate: Number(wFixedRate) || 550,
        experienceYears: Number(wExpYears) || 5,
        workingArea: wWorkingArea || 'South & Central Mumbai',
        location: wLocation || 'Dadar West, Mumbai',
        latitude: 19.0178,
        longitude: 72.8478,
        idProofType: wIdType,
        bio: wBio,
        profileImage: wAvatar,
        availability: wAvailability,
        verificationStatus: 'verified', // Auto-verified for active onboarding
      };

      await saveWorkerProfile(workerData);
      await updateRole('worker');
      await updateProfileDetails({
        uid,
        name: wName,
        email: wEmail,
        phoneNumber: wPhone,
        whatsappNumber: wWhatsapp,
        role: 'worker',
        location: wLocation,
        profileImage: wAvatar,
        profileCompleted: true,
      });

      setSuccessMsg('Worker profile successfully created and published on HomeCrew!');
      setTimeout(() => {
        navigate('/worker/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Worker profile save error:', err);
      setErrorMsg(`Failed to save worker profile: ${err.message || 'Please check connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#0B5D43] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#F9B000]" />
            <span>Profile Creation & Management</span>
          </div>
          <h1 className="text-3xl font-heading font-black text-gray-900">
            Setup Your HomeCrew Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Configure your personal details or register as an independent blue-collar service professional
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-white text-[#0B5D43] shadow-md ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4 text-[#0B5D43]" />
            <span>Customer Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('worker')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'worker'
                ? 'bg-white text-[#0B5D43] shadow-md ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#F9B000]" />
            <span>Worker Pro Profile</span>
          </button>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CUSTOMER FORM */}
        {activeTab === 'customer' ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0B5D43]" />
                <span>Customer Information</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Saved securely in Firestore for instant 30-minute booking dispatch
              </p>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-5">
              {/* Customer Photo Upload & Avatar Picker */}
              <ImageUpload
                currentImage={cAvatar}
                onImageSelected={(img) => setCAvatar(img)}
                presets={avatarPresets}
                label="Customer Profile Picture"
                sublabel="Upload a photo from your device, or select a gallery avatar"
              />

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="E.g. Aarti Deshmukh"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={cWhatsapp}
                    onChange={(e) => setCWhatsapp(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>
              </div>

              {/* Mumbai Locality & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Locality / Area in Mumbai *
                  </label>
                  <select
                    value={cLocation}
                    onChange={(e) => setCLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  >
                    <option value="Dadar West, Mumbai">Dadar West</option>
                    <option value="Prabhadevi, Mumbai">Prabhadevi</option>
                    <option value="Bandra West, Mumbai">Bandra West</option>
                    <option value="Andheri West, Mumbai">Andheri West</option>
                    <option value="Andheri East, Mumbai">Andheri East</option>
                    <option value="Borivali West, Mumbai">Borivali West</option>
                    <option value="Ghatkopar East, Mumbai">Ghatkopar East</option>
                    <option value="Colaba, Mumbai">Colaba</option>
                    <option value="Thane West">Thane West</option>
                    <option value="Vashi, Navi Mumbai">Vashi, Navi Mumbai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    value={cLanguage}
                    onChange={(e: any) => setCLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Home Address / Apartment Details (Private)
                </label>
                <textarea
                  rows={2}
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  placeholder="Flat 402, Shiv Sadan, Ranade Road, Dadar West, Mumbai 400028"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                />
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Emergency Contact Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={cEmergencyName}
                    onChange={(e) => setCEmergencyName(e.target.value)}
                    placeholder="Family member or neighbor"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Emergency Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={cEmergencyPhone}
                    onChange={(e) => setCEmergencyPhone(e.target.value)}
                    placeholder="+91 98200 99999"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  <span>{saving ? 'Saving to Firebase...' : 'Save Customer Profile'}</span>
                  <ArrowRight className="w-4 h-4 text-[#F9B000]" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* WORKER FORM */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-heading font-extrabold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0B5D43]" />
                <span>Professional Worker Listing & Rates</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Creates your verified public profile in Firestore and Google Maps directory
              </p>
            </div>

            <form onSubmit={handleSaveWorker} className="space-y-5">
              {/* Avatar Selector */}
              {/* Worker Photo Upload & Avatar Picker */}
              <ImageUpload
                currentImage={wAvatar}
                onImageSelected={(img) => setWAvatar(img)}
                presets={avatarPresets}
                label="Professional Worker Photo"
                sublabel="Upload your clear professional photo to display on Google Maps and worker listings"
              />

              {/* Name & Trade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Full Name / Professional Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={wName}
                    onChange={(e) => setWName(e.target.value)}
                    placeholder="E.g. Rameshwar Pawar"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Trade / Service *
                  </label>
                  <select
                    value={wService}
                    onChange={(e) => setWService(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  >
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Cleaner">Cleaner / Deep Sanitization</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Painter">Painter</option>
                    <option value="AC repair technicians">AC Repair Technician</option>
                    <option value="Cooks">Cook</option>
                    <option value="Housemaids">Housemaid</option>
                  </select>
                </div>
              </div>

              {/* Specific Skills */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Skills & Specialties (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={wSkills}
                  onChange={(e) => setWSkills(e.target.value)}
                  placeholder="E.g. Pipe Fitting, Tap Repair, Concealed Leakage, Water Tank Fitting"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                />
              </div>

              {/* Rates & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Hourly Rate (₹/hr) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="100"
                      step="50"
                      value={wRate}
                      onChange={(e) => setWRate(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#0B5D43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Minimum / Visit Fee (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={wFixedRate}
                      onChange={(e) => setWFixedRate(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#0B5D43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="45"
                    value={wExpYears}
                    onChange={(e) => setWExpYears(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#0B5D43]"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={wPhone}
                    onChange={(e) => setWPhone(e.target.value)}
                    placeholder="+91 98200 98200"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    WhatsApp Number (For Direct Customer Chat) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={wWhatsapp}
                    onChange={(e) => setWWhatsapp(e.target.value)}
                    placeholder="+91 98200 98200"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>
              </div>

              {/* Working Area & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Base Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={wLocation}
                    onChange={(e) => setWLocation(e.target.value)}
                    placeholder="E.g. Dadar West, Mumbai"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Service Areas Covered (30-min radius) *
                  </label>
                  <input
                    type="text"
                    required
                    value={wWorkingArea}
                    onChange={(e) => setWWorkingArea(e.target.value)}
                    placeholder="E.g. Dadar, Prabhadevi, Lower Parel, Mahim"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                  />
                </div>
              </div>

              {/* ID Proof Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Government ID Proof on File *
                </label>
                <select
                  value={wIdType}
                  onChange={(e) => setWIdType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                >
                  <option value="Aadhaar Card (Govt. Verified)">Aadhaar Card</option>
                  <option value="ITI Trade Certificate (Certified)">ITI Trade Certificate</option>
                  <option value="Licensed Wireman Permit">Licensed Wireman Permit</option>
                  <option value="Voter ID Card">Voter ID Card</option>
                  <option value="Police Verification Certificate">Police Verification Certificate</option>
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Professional Bio / Introduction for Customers
                </label>
                <textarea
                  rows={3}
                  value={wBio}
                  onChange={(e) => setWBio(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#0B5D43]"
                />
              </div>

              {/* Duty Availability Checkbox */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#0B5D43] block">Set Available Immediately</span>
                  <span className="text-[11px] text-emerald-800">Your profile will be discoverable on Google Maps</span>
                </div>
                <input
                  type="checkbox"
                  checked={wAvailability}
                  onChange={(e) => setWAvailability(e.target.checked)}
                  className="w-5 h-5 accent-[#0B5D43] cursor-pointer"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  <span>{saving ? 'Publishing Profile...' : 'Save & Publish Worker Listing'}</span>
                  <ArrowRight className="w-4 h-4 text-[#F9B000]" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
