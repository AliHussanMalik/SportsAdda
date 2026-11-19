import React from 'react';
import { Zap } from 'lucide-react';

export default function StitchTimeSlotChip({
  startTime,
  endTime,
  price,
  isPeak = false,
  isBooked = false,
  isSelected = false,
  onSelect
}) {
  return (
    <button
      disabled={isBooked}
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-2 text-left ${
        isBooked
          ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
          : isSelected
          ? 'bg-[#0052ff] border-[#0052ff] text-white shadow-lg shadow-[#0052ff]/30 ring-2 ring-[#0052ff]/50'
          : isPeak
          ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500 text-slate-900 dark:text-white'
          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 hover:border-[#0052ff] text-slate-900 dark:text-white'
      }`}
    >
      <div className="flex justify-between items-center w-full">
        <span className={`font-bold text-sm ${isSelected ? 'text-white' : ''}`}>
          {startTime} - {endTime}
        </span>
        {isPeak && !isBooked && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
            isSelected ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-500'
          }`}>
            <Zap className="w-3 h-3" /> PEAK
          </span>
        )}
      </div>

      <div className="flex justify-between items-center w-full mt-1">
        <span className={`font-extrabold text-sm ${isSelected ? 'text-white' : 'text-[#0052ff]'}`}>
          {price}
        </span>
        <span className={`text-xs font-semibold ${isSelected ? 'text-white/90' : isBooked ? 'text-slate-400' : 'text-slate-500'}`}>
          {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
        </span>
      </div>
    </button>
  );
}
