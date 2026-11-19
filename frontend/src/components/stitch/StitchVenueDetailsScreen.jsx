import React from 'react';

export default function StitchVenueDetailsScreen({ venue, onNavigate, onCheckAvailability }) {
  const venueTitle = venue?.name || 'Elite Sports Center';
  const venueAddress = venue?.address || venue?.location || '123 Athletics Way, Downtown';
  const venuePrice = venue?.price || (venue?.hourly_rate ? `PKR ${venue.hourly_rate}` : '$30');
  const venueRating = venue?.rating || venue?.avg_rating || '4.9';
  const venueImg = venue?.image || venue?.image_url || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="w-[340px] h-[680px] bg-surface-container-low dark:bg-[#0b0f19] rounded-[40px] shadow-2xl border-[6px] border-slate-900 dark:border-slate-800 flex flex-col overflow-hidden relative font-body-md text-on-surface select-none">
      {/* Top Bar Header */}
      <div className="bg-surface/90 dark:bg-[#131b2e]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-outline/10 shrink-0 z-20">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
        <span className="font-headline-sm text-[15px] font-bold text-on-surface">Venue Detail</span>
        <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
          <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
        </button>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Hero Image */}
        <div className="relative h-[180px] w-full">
          <img
            src={venueImg}
            alt={venueTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-primary text-white font-label-sm text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
            PREMIUM
          </div>
        </div>

        {/* Title & Info Section */}
        <div className="p-4 space-y-4">
          <div>
            <h1 className="font-headline-lg text-[20px] font-extrabold text-on-surface leading-tight">
              {venueTitle}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant font-body-md text-[12px]">
              <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
              <span>{venueAddress}</span>
            </div>
          </div>

          {/* Amenities Chips */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-surface dark:bg-[#131b2e] px-3 py-1.5 rounded-xl border border-outline/15 text-[11px] font-label-md text-on-surface">
              <span className="material-symbols-outlined text-[14px] text-primary">shower</span>
              Showers
            </div>
            <div className="flex items-center gap-1 bg-surface dark:bg-[#131b2e] px-3 py-1.5 rounded-xl border border-outline/15 text-[11px] font-label-md text-on-surface">
              <span className="material-symbols-outlined text-[14px] text-primary">local_parking</span>
              Parking
            </div>
            <div className="flex items-center gap-1 bg-surface dark:bg-[#131b2e] px-3 py-1.5 rounded-xl border border-outline/15 text-[11px] font-label-md text-on-surface">
              <span className="material-symbols-outlined text-[14px] text-primary">sports</span>
              Gear Rental
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-1.5">
            <h3 className="font-headline-sm text-[14px] font-bold text-on-surface">About</h3>
            <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">
              Experience top-tier athletic facilities designed for both amateur and professional athletes. Our center features FIBA-standard courts, professional-grade lighting, and comprehensive recovery areas to support your peak performance.
            </p>
          </div>

          {/* Location Map Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-[14px] font-bold text-on-surface">Location</h3>
              <a href="#" className="font-label-md text-[11px] text-primary font-semibold hover:underline">
                Get Directions
              </a>
            </div>
            <div className="h-28 rounded-2xl bg-surface-container dark:bg-slate-900 border border-outline/15 overflow-hidden relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600"
                alt="Map location preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-primary/10" />
              <div className="relative z-10 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-bounce">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-[14px] font-bold text-on-surface">Reviews</h3>
              <div className="flex items-center gap-1 text-amber-500 font-label-md text-[12px] font-bold">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                4.9 <span className="text-on-surface-variant font-normal">(128)</span>
              </div>
            </div>

            <div className="bg-surface dark:bg-[#131b2e] p-3 rounded-2xl border border-outline/15 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-[12px] font-bold text-on-surface">James F.</span>
                <div className="flex text-amber-400">
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
              <p className="font-body-md text-[11px] text-on-surface-variant leading-normal">
                Incredible courts, very clean facilities. The lighting is perfect for evening games. Will definitely be booking again next week!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="bg-surface/95 dark:bg-[#131b2e]/95 backdrop-blur-xl border-t border-outline/10 p-4 flex items-center justify-between shrink-0 z-20">
        <div>
          <span className="font-headline-lg text-[18px] font-extrabold text-on-surface">{venuePrice}</span>
          <span className="font-body-md text-[12px] text-on-surface-variant font-normal"> / hr</span>
        </div>
        <button
          onClick={() => onCheckAvailability && onCheckAvailability()}
          className="py-3 px-6 bg-primary hover:bg-[#003ec7] text-white rounded-2xl font-label-md text-[13px] font-bold shadow-lg shadow-primary/30 transition-all active:scale-95"
        >
          Check Availability
        </button>
      </div>
    </div>
  );
}
