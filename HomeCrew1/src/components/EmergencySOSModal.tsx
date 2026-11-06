import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, PhoneCall, MessageCircle, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  workerName?: string;
  customerLocation?: string;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  bookingId = 'BK-LIVE-001',
  workerName = 'Assigned Professional',
  customerLocation = 'Current Location in Mumbai',
}) => {
  const { userProfile } = useAuth();
  const [dispatched, setDispatched] = useState(false);
  const [notifiedContact, setNotifiedContact] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedDispatch = () => {
    setDispatched(true);
  };

  const handleNotifyEmergencyContact = () => {
    setNotifiedContact(true);
    const msg = `[HomeCrew Safety Alert] Emergency triggered during booking #${bookingId} at ${customerLocation}. Worker: ${workerName}.`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-700 rounded-full animate-pulse">
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Safety & Emergency SOS</h3>
              <p className="text-xs text-red-100">Live Active Booking Safety Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-red-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Disclaimer */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <span className="font-semibold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-sm">HACKATHON DEMO</span>
          <span>This feature triggers a simulated rapid safety incident report for hackathon testing.</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Booking ID:</span>
              <span className="font-semibold text-gray-800">{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Professional On-Site:</span>
              <span className="font-semibold text-gray-800">{workerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Broadcast Location:</span>
              <span className="font-semibold text-gray-800 text-right">{customerLocation}</span>
            </div>
          </div>

          {dispatched ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Simulated Safety Alert Dispatched</span>
              </div>
              <p className="text-xs leading-relaxed">
                HomeCrew 24/7 Safety Desk incident ticket has been created. A dedicated safety liaison will initiate phone verification within 90 seconds. Location GPS coordinates locked.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleSimulatedDispatch}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Trigger Emergency Safety Protocol (Simulated)</span>
              </button>

              <button
                onClick={handleNotifyEmergencyContact}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Share Live Alert with Family on WhatsApp</span>
              </button>
            </div>
          )}

          {/* Quick Helplines */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Official Indian Emergency Helplines
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:112"
                className="flex items-center gap-2 p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium"
              >
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>Police / National: <strong>112</strong></span>
              </a>
              <a
                href="tel:1091"
                className="flex items-center gap-2 p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Women Helpline: <strong>1091</strong></span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
