import React from 'react';

export default function StitchProfileBoard() {
  return (
    <div className="w-[300px] h-[340px] bg-white dark:bg-[#131b2e] rounded-3xl shadow-lg border border-outline/20 overflow-hidden relative flex flex-col justify-between group">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
          alt="Professional headshot"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 p-4 flex justify-between items-center">
        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-label-md font-semibold border border-white/20">
          Pro Athlete
        </span>
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-[18px]">verified</span>
        </div>
      </div>

      <div className="relative z-10 p-5 text-white">
        <h3 className="font-headline-sm text-[18px] font-bold">Sophia Martinez</h3>
        <p className="font-body-md text-[13px] text-white/80">Badminton & Tennis Captain</p>
        
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/10 text-[11px] text-white/70 font-label-sm">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary-fixed">military_tech</span>
            Rank #4 Regional
          </span>
          <span>•</span>
          <span>42 Matches</span>
        </div>
      </div>
    </div>
  );
}
