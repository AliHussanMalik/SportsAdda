import React from 'react';

export default function StitchDesignSystemBoard() {
  return (
    <div className="w-[380px] bg-surface-container-low dark:bg-[#0b0f19] p-5 rounded-3xl shadow-lg border border-outline/20 font-body-md text-on-surface select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-outline/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h3 className="font-headline-sm text-[16px] text-on-surface font-bold">Apex Athletics</h3>
          </div>
          <p className="font-label-sm text-[11px] text-on-surface-variant">Design System & Tokens</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-md text-[10px] uppercase font-bold tracking-wider">
          v1.0 Stitch
        </span>
      </div>

      <div className="space-y-5">
        {/* Color Palette Grid */}
        <div>
          <h4 className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-2.5 font-semibold">
            Color Tokens
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0052ff] text-white p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
              <span className="font-label-md text-[11px] font-bold">Primary</span>
              <span className="font-mono text-[10px] opacity-80">#0052FF</span>
            </div>
            <div className="bg-[#003ec7] text-white p-3 rounded-xl flex flex-col justify-between h-20 shadow-md">
              <span className="font-label-md text-[11px] font-bold">Secondary</span>
              <span className="font-mono text-[10px] opacity-80">#003EC7</span>
            </div>
            <div className="bg-[#434656] text-white p-3 rounded-xl flex flex-col justify-between h-20 shadow-sm">
              <span className="font-label-md text-[11px] font-bold">Slate Variant</span>
              <span className="font-mono text-[10px] opacity-80">#434656</span>
            </div>
            <div className="bg-[#faf8ff] dark:bg-[#131b2e] text-on-surface p-3 rounded-xl border border-outline/20 flex flex-col justify-between h-20 shadow-sm">
              <span className="font-label-md text-[11px] font-bold">Neutral Surface</span>
              <span className="font-mono text-[10px] text-on-surface-variant">#FAF8FF</span>
            </div>
          </div>
        </div>

        {/* Typography Scale */}
        <div className="bg-surface dark:bg-[#131b2e] p-4 rounded-2xl border border-outline/10 space-y-3">
          <h4 className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Typography System
          </h4>
          
          <div className="flex items-baseline justify-between border-b border-outline/10 pb-2">
            <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">Headline</span>
            <span className="font-headline-lg text-[22px] font-bold text-on-surface tracking-tight">Aa Bold Headline</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-outline/10 pb-2">
            <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">Body</span>
            <span className="font-body-md text-[14px] text-on-surface">Aa Regular Body Text</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">Label</span>
            <span className="font-label-md text-[12px] font-semibold text-primary uppercase tracking-wider">Aa Label Medium</span>
          </div>
        </div>

        {/* Interactive Controls UI Kit */}
        <div className="bg-surface dark:bg-[#131b2e] p-4 rounded-2xl border border-outline/10 space-y-3">
          <h4 className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Component Scaffolding
          </h4>

          {/* Button Row */}
          <div className="flex gap-2 items-center">
            <button className="flex-1 py-2 px-3 bg-primary text-white rounded-xl font-label-md text-[12px] font-bold shadow-md shadow-primary/20">
              Primary
            </button>
            <button className="flex-1 py-2 px-3 bg-surface-container-high text-on-surface rounded-xl font-label-md text-[12px] font-semibold border border-outline/20">
              Secondary
            </button>
            <button className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
          </div>

          {/* Input & Badges */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline/20">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">search</span>
              <span className="font-body-md text-[12px] text-on-surface-variant">Search courts...</span>
            </div>
            <span className="px-2.5 py-1 bg-primary text-white rounded-full font-label-sm text-[10px] font-bold">
              Label
            </span>
          </div>

          {/* Icons Row */}
          <div className="flex justify-around items-center pt-1 text-primary">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">sports_tennis</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">sports_soccer</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">sports_basketball</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
