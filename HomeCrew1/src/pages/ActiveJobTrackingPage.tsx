
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  Navigation,
  Share2,
} from 'lucide-react';

import confetti from 'canvas-confetti';
import { SEED_WORKERS } from '../data/seedWorkers';
import { EmergencySOSModal } from '../components/EmergencySOSModal';
import { useAuth } from '../context/AuthContext';

export const ActiveJobTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();

  const workerId = searchParams.get('workerId') || 'worker-1';
  const service = searchParams.get('service') || 'General Home Service';
  const amount = Number(searchParams.get('amount')) || 700;

  const worker =
    SEED_WORKERS.find((w) => w.id === workerId) || SEED_WORKERS[0];

  // Customer Coordinates (Defaults to Dadar West)
  const [customerCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.0178,
    lng: 72.8478,
  });

  // Dynamic Worker Coordinates (Simulates movement towards customer)
  const [workerCoords, setWorkerCoords] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: worker.latitude,
    lng: worker.longitude,
  });

  // Step Progress State
  const [bookingStep, setBookingStep] = useState<number>(2);
  const [etaMinutes, setEtaMinutes] = useState<number>(18);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Simulate worker movement every 4 seconds
  useEffect(() => {
    if (bookingStep !== 2) return;

    const interval = setInterval(() => {
      setWorkerCoords((prev) => {
        const stepLat = (customerCoords.lat - prev.lat) * 0.2;
        const stepLng = (customerCoords.lng - prev.lng) * 0.2;

        return {
          lat: prev.lat + stepLat,
          lng: prev.lng + stepLng,
        };
      });

      setEtaMinutes((prev) => Math.max(3, prev - 2));
    }, 4000);

    return () => clearInterval(interval);
  }, [bookingStep, customerCoords]);

  const handleAdvanceStep = () => {
    if (bookingStep === 2) {
      setBookingStep(3);
      setEtaMinutes(0);
    } else if (bookingStep === 3) {
      setBookingStep(4);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleShareTracking = () => {
    const shareText = `Live tracking my HomeCrew service with ${worker.name} (${service}). ETA: ${etaMinutes} mins.`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    window.open(waUrl, '_blank');
    setShareSuccess(true);

    setTimeout(() => setShareSuccess(false), 3000);
  };

  const cleanPhone = worker.whatsappNumber.replace(/[^0-9]/g, '');

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${worker.name}, tracking your arrival for our ${service} booking. See you soon!`
  )}`;

  // Customer Map Marker
  const customerIcon = L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#2563eb;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:bold;white-space:nowrap;">
          Your Home
        </div>
        <div style="width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;margin-top:3px;box-shadow:0 0 0 5px #3b82eb55;"></div>
      </div>
    `,
    iconSize: [90, 45],
    iconAnchor: [45, 45],
  });

  // Worker Map Marker
  const workerIcon = L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#0B5D43;color:white;padding:5px 9px;border-radius:9px;font-size:11px;font-weight:800;white-space:nowrap;border:1px solid white;">
          ${worker.name}
        </div>
        <div style="width:38px;height:38px;border-radius:50%;border:3px solid #0B5D43;overflow:hidden;background:white;margin-top:3px;">
          <img
            src="${worker.profileImage}"
            alt="${worker.name}"
            style="width:100%;height:100%;object-fit:cover;"
          />
        </div>
      </div>
    `,
    iconSize: [110, 65],
    iconAnchor: [55, 65],
  });

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl space-y-6">

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B5D43]">
                Live Job Tracking &bull; Booking #HC-8921
              </span>
            </div>

            <h1 className="text-2xl font-heading font-extrabold text-gray-900 mt-1">
              {service} with {worker.name}
            </h1>

            <p className="text-xs text-gray-500 mt-0.5">
              Service location: Customer Residence, Mumbai MMR
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Emergency SOS Button */}
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-colors shadow-sm cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
              <span>EMERGENCY SOS</span>
            </button>

            <button
              onClick={handleShareTracking}
              className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareSuccess ? 'Shared!' : 'Share Live Trip'}</span>
            </button>
          </div>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center">

            <div className={`space-y-1 ${bookingStep >= 1 ? 'text-[#0B5D43]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                bookingStep >= 1 ? 'bg-[#0B5D43] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                1
              </div>
              <span className="text-xs font-bold block">Confirmed</span>
            </div>

            <div className={`space-y-1 ${bookingStep >= 2 ? 'text-[#0B5D43]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                bookingStep >= 2 ? 'bg-[#0B5D43] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-xs font-bold block">En Route</span>
            </div>

            <div className={`space-y-1 ${bookingStep >= 3 ? 'text-[#0B5D43]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                bookingStep >= 3 ? 'bg-[#0B5D43] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-xs font-bold block">Arrived & Working</span>
            </div>

            <div className={`space-y-1 ${bookingStep >= 4 ? 'text-[#0B5D43]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                bookingStep >= 4 ? 'bg-[#0B5D43] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                4
              </div>
              <span className="text-xs font-bold block">Completed</span>
            </div>

          </div>
        </div>

        {/* Map and Tracking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Live OpenStreetMap Tracking Container */}
          <div className="lg:col-span-2 h-[420px] rounded-3xl overflow-hidden border border-gray-200 shadow-md relative bg-emerald-50/20">

            <MapContainer
              center={customerCoords}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Customer Marker */}
              <Marker
                position={customerCoords}
                icon={customerIcon}
              >
                <Popup>
                  Customer Service Address
                </Popup>
              </Marker>

              {/* Worker Live Marker */}
              <Marker
                position={workerCoords}
                icon={workerIcon}
              >
                <Popup>
                  {worker.name} — Service Professional
                </Popup>
              </Marker>
            </MapContainer>

            {/* Floating ETA Badge */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-200 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-[#0B5D43] rounded-xl">
                <Clock className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Estimated Travel Time
                </span>

                <div className="text-lg font-heading font-black text-[#0B5D43]">
                  {bookingStep === 2
                    ? `${etaMinutes} Minutes`
                    : bookingStep === 3
                    ? 'Arrived at Doorstep'
                    : 'Completed'}
                </div>

                {bookingStep === 2 && etaMinutes <= 30 && (
                  <span className="text-[10px] font-bold text-emerald-600 block">
                    &check; Within 30 Minutes Promise Met
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Worker Card & Controls */}
          <div className="space-y-6">

            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">

              <div className="flex items-center gap-3">
                <img
                  src={worker.profileImage}
                  alt={worker.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-emerald-100 shadow-xs"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-bold text-gray-900 text-base">
                      {worker.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-[#0B5D43]" />
                  </div>

                  <p className="text-xs text-gray-500">
                    {worker.services[0]} &bull; {worker.experienceYears}y exp
                  </p>

                  <div className="text-xs font-bold text-emerald-700 mt-1">
                    ₹{amount} (Agreed Price)
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">

                <a
                  href={`tel:${worker.phoneNumber}`}
                  className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0B5D43]" />
                  <span>Call Pro</span>
                </a>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Live Job Actions */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-500 block mb-2">
                  Live Job Actions:
                </span>

                {bookingStep < 4 ? (
                  <button
                    onClick={handleAdvanceStep}
                    className="w-full py-2.5 px-4 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    {bookingStep === 2
                      ? 'Confirm Worker Arrival'
                      : 'Mark Job Completed'}
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center space-y-2">
                    <div className="text-xs font-bold text-emerald-800">
                      Job Finished Successfully!
                    </div>

                    <Link
                      to={`/worker/${worker.id}`}
                      className="inline-block px-4 py-1.5 bg-[#0B5D43] text-white text-xs font-bold rounded-lg"
                    >
                      Rate & Review {worker.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy & Safety Guarantee */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Location Privacy Protected</span>
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed">
                Worker location is broadcast exclusively during this active booking session and permanently unmounts upon job completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        bookingId="BK-HC-8921"
        workerName={worker.name}
        customerLocation="Current Customer Address, Mumbai"
      />
    </div>
  );
};
