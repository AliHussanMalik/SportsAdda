import React from 'react';
import { CheckCircle2, QrCode, X } from 'lucide-react';

export default function StitchBookingSheet({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#131b2e] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-[#0052ff]" />
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Match Slot Confirmed!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Apex Athletics • Automated Kiosk Pass
        </p>

        <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-slate-100 mb-4">
          {booking.qrCode ? (
            <img src={booking.qrCode} alt="Booking Pass QR" className="w-44 h-44 mx-auto" />
          ) : (
            <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              <QrCode className="w-20 h-20" />
            </div>
          )}
        </div>

        <div className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl mb-6 break-all">
          Pass ID: {booking.id || 'APEX-88210-PASS'}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-[#0052ff] hover:bg-[#003ec7] text-white font-bold transition-all shadow-lg shadow-[#0052ff]/30 active:scale-98"
        >
          Done
        </button>
      </div>
    </div>
  );
}
