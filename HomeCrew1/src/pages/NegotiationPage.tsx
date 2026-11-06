import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Check, 
  X, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  User, 
  Briefcase,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SEED_WORKERS } from '../data/seedWorkers';
import { useAuth } from '../context/AuthContext';
import { OfferHistoryItem } from '../types';
import { createJobBooking, updateJobStatus } from '../services/firestoreService';

export const NegotiationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile, currentUser, oauthAccessToken } = useAuth();

  const workerId = searchParams.get('workerId') || 'worker-1';
  const worker = SEED_WORKERS.find((w) => w.id === workerId) || SEED_WORKERS[0];
  const initialBasePrice = worker.hourlyRate * 2;

  // Perspective based on logged-in role (Customer vs Worker)
  const activeRole: 'customer' | 'worker' = userProfile?.role === 'worker' ? 'worker' : 'customer';

  // Offer history state
  const [history, setHistory] = useState<OfferHistoryItem[]>([
    {
      senderId: worker.id,
      senderRole: 'worker',
      amount: initialBasePrice,
      note: `Standard initial estimate for 2 hours of ${worker.services[0]} (₹${worker.hourlyRate}/hr).`,
      timestamp: '10 mins ago',
    },
    {
      senderId: 'customer-1',
      senderRole: 'customer',
      amount: Math.round(initialBasePrice * 0.85),
      note: 'Can you do it for this amount? It is a quick pipe fitting repair.',
      timestamp: '5 mins ago',
    },
  ]);

  const [counterInput, setCounterInput] = useState<string>('');
  const [counterNote, setCounterNote] = useState<string>('');
  const [status, setStatus] = useState<'negotiating' | 'accepted' | 'declined'>('negotiating');
  const [emailStatus, setEmailStatus] = useState<string>('');

  const currentOffer = history[history.length - 1];
  const lastSender = currentOffer.senderRole;

  // Send a counteroffer
  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(counterInput);
    if (!amount || amount <= 0) return;

    const newItem: OfferHistoryItem = {
      senderId: activeRole === 'customer' ? (userProfile?.uid || 'customer-1') : worker.id,
      senderRole: activeRole,
      amount,
      note: counterNote || `${activeRole === 'customer' ? 'Customer' : 'Worker'} counteroffer: ₹${amount}`,
      timestamp: 'Just now',
    };

    setHistory([...history, newItem]);
    setCounterInput('');
    setCounterNote('');
  };

  // Quick preset adjustment
  const handlePresetAdjust = (diff: number) => {
    const newAmount = Math.max(100, currentOffer.amount + diff);
    setCounterInput(String(newAmount));
  };

  // Accept offer
  const handleAccept = async () => {
    setStatus('accepted');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const jobId = searchParams.get('jobId');
    if (jobId) {
      try {
        await updateJobStatus(jobId, 'confirmed', {
          finalPrice: currentOffer.amount,
          workerId: worker.id,
          workerName: worker.name,
        });
      } catch (e) {
        console.warn('Update job status handled:', e);
      }
    } else {
      try {
        await createJobBooking({
          customerId: userProfile?.uid || currentUser?.uid || '',
          customerName: userProfile?.name || 'Customer',
          customerPhone: userProfile?.phoneNumber || '+919820011223',
          customerWhatsapp: userProfile?.whatsappNumber || '+919820011223',
          workerId: worker.id,
          workerName: worker.name,
          workerPhone: worker.phoneNumber,
          workerWhatsapp: worker.whatsappNumber,
          service: worker.services[0] || 'General Repair',
          description: `Negotiated service agreement at mutually agreed price.`,
          location: userProfile?.location || 'Mumbai, Maharashtra',
          scheduledAt: new Date().toISOString(),
          isImmediate: true,
          status: 'confirmed',
          initialPrice: initialBasePrice,
          finalPrice: currentOffer.amount,
          etaMinutes: 20,
        });
      } catch (e) {
        console.warn('Booking creation handled:', e);
      }
    }

    // Try sending Gmail notification via Workspace OAuth token if available
    if (oauthAccessToken && userProfile?.email) {
      try {
        setEmailStatus('Sending Gmail booking confirmation...');
        const res = await fetch('/api/email/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${oauthAccessToken}`,
          },
          body: JSON.stringify({
            to: userProfile.email,
            subject: `HomeCrew Booking Confirmed: ${worker.services[0]} with ${worker.name}`,
            htmlBody: `
              <div style="font-family: sans-serif; padding: 20px; color: #111;">
                <h2 style="color: #0B5D43;">HomeCrew Booking Confirmation</h2>
                <p>Your booking with <strong>${worker.name}</strong> for <strong>${worker.services[0]}</strong> has been agreed upon!</p>
                <div style="background: #f4fbf8; padding: 16px; border-radius: 8px; border: 1px solid #c2e5d9;">
                  <p><strong>Agreed Final Price:</strong> ₹${currentOffer.amount}</p>
                  <p><strong>Worker Contact:</strong> ${worker.phoneNumber}</p>
                  <p><strong>Status:</strong> Worker en route (ETA &lt; 30 minutes)</p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">Built by Team ShadowX Coders &bull; HomeCrew Social Impact Platform</p>
              </div>
            `,
          }),
        });
        if (res.ok) {
          setEmailStatus('Gmail confirmation sent to ' + userProfile.email);
        } else {
          setEmailStatus('');
        }
      } catch (err) {
        console.warn('Gmail notification skipped:', err);
        setEmailStatus('');
      }
    }
  };

  const handleDecline = () => {
    setStatus('declined');
  };

  const cleanPhone = worker.whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hi ${worker.name}, about our HomeCrew booking for ${worker.services[0]} (Price: ₹${currentOffer.amount}):`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-xl border border-gray-200 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </button>
        </div>

        {/* Worker Summary Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              src={worker.profileImage}
              alt={worker.name}
              className="w-14 h-14 rounded-xl object-cover border border-emerald-100"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-heading font-bold text-gray-900 text-base">{worker.name}</h2>
                <ShieldCheck className="w-4 h-4 text-[#0B5D43]" />
              </div>
              <p className="text-xs text-gray-500">{worker.services.join(', ')} &bull; {worker.location}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Initial Rate</span>
            <div className="text-sm font-heading font-extrabold text-gray-800">₹{initialBasePrice}</div>
          </div>
        </div>

        {/* Main Negotiation Container */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="bg-emerald-900 text-white px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'accepted' ? 'bg-emerald-400' : 'bg-[#F9B000] animate-ping'}`} />
              <span className="font-bold uppercase tracking-wider">
                {status === 'accepted' ? 'Price Agreement Reached' : status === 'declined' ? 'Offer Declined' : 'Active Price Negotiation'}
              </span>
            </div>
            <div className="text-emerald-200">
              Current Leading Offer: <strong className="text-[#F9B000] text-sm font-heading">₹{currentOffer.amount}</strong>
            </div>
          </div>

          {/* Negotiation Timeline Chat */}
          <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-gray-50/50">
            {history.map((item, idx) => {
              const isCustomer = item.senderRole === 'customer';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
                    <span>{isCustomer ? 'Customer Offer' : `${worker.name} (Worker)`}</span>
                    <span>&bull;</span>
                    <span>{item.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-md p-4 rounded-2xl shadow-xs border ${
                      isCustomer
                        ? 'bg-[#0B5D43] text-white rounded-tr-none border-[#0B5D43]'
                        : 'bg-white text-gray-900 rounded-tl-none border-gray-200'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-xs font-semibold opacity-90">Offer Amount</span>
                      <span className={`text-xl font-heading font-black ${isCustomer ? 'text-[#F9B000]' : 'text-[#0B5D43]'}`}>
                        ₹{item.amount}
                      </span>
                    </div>
                    {item.note && (
                      <p className={`text-xs mt-2 leading-relaxed ${isCustomer ? 'text-emerald-100' : 'text-gray-600'}`}>
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {status === 'accepted' && (
              <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="font-heading font-black text-emerald-950 text-xl">
                  Booking Confirmed at ₹{currentOffer.amount}!
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Both parties have agreed. {worker.name} has accepted the booking request and will arrive at your address within 30 minutes.
                </p>

                {emailStatus && (
                  <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <span>{emailStatus}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      navigate(`/tracking?workerId=${worker.id}&service=${encodeURIComponent(worker.services[0])}&amount=${currentOffer.amount}`);
                    }}
                    className="px-6 py-3 bg-[#0B5D43] hover:bg-[#084532] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Open Live Arrival Tracker &rarr;
                  </button>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Notify on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {status === 'declined' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center text-xs text-red-800">
                The negotiation has ended without an agreement. You can return to search for other nearby workers.
              </div>
            )}
          </div>

          {/* Action Decision Controls (if still negotiating) */}
          {status === 'negotiating' && (
            <div className="p-6 bg-white border-t border-gray-200 space-y-4">
              {/* If other party sent last offer: can Accept or Decline */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Last offer was made by <strong className="capitalize">{lastSender}</strong>: <strong>₹{currentOffer.amount}</strong>
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept ₹{currentOffer.amount}</span>
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-3.5 py-2.5 bg-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>

              {/* Counteroffer form */}
              <form onSubmit={handleSendCounter} className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">Or Send a Counteroffer:</span>
                  {/* Quick Preset Buttons */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePresetAdjust(-50)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-bold text-gray-700"
                    >
                      -₹50
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetAdjust(50)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-bold text-gray-700"
                    >
                      +₹50
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetAdjust(100)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-bold text-gray-700"
                    >
                      +₹100
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative w-36">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={counterInput}
                      onChange={(e) => setCounterInput(e.target.value)}
                      placeholder="Amount"
                      min="50"
                      className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B5D43]"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    placeholder="Add brief reason (e.g., simple job, includes materials)..."
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B5D43]"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B5D43] hover:bg-[#084532] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-[#F9B000]" />
                    <span>Send Counter</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
