import React from 'react';

export default function StitchLogoBoard() {
  return (
    <div className="w-[300px] h-[340px] bg-white dark:bg-[#131b2e] p-6 rounded-3xl shadow-lg border border-outline/20 flex flex-col items-center justify-center text-center select-none group">
      <div className="relative mb-6">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-[#0052ff]/20 blur-xl rounded-full group-hover:bg-[#0052ff]/30 transition-all" />
        
        {/* Stylized Apex Athletics Logo Symbol */}
        <svg
          className="w-36 h-36 relative text-[#0052ff] drop-shadow-md transform group-hover:scale-105 transition-transform duration-300"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 12L15 78H32L50 42L68 78H85L50 12Z"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M38 56L50 32L62 56"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="22" r="4" fill="currentColor" />
        </svg>
      </div>

      <h2 className="font-headline-lg text-[22px] font-extrabold text-[#0052ff] tracking-wider uppercase font-sans">
        Apex Athletics
      </h2>
      <p className="font-label-sm text-[12px] text-on-surface-variant font-medium tracking-widest mt-1 uppercase">
        Indoor Sports Ecosystem
      </p>
    </div>
  );
}
