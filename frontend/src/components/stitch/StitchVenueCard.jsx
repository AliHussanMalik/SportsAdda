import React from 'react';

export default function StitchVenueCard({
  name = 'Apex Stadium',
  price = '$25/hr',
  rating = '4.8',
  location = 'Downtown District',
  category = 'Badminton',
  type = 'Indoor',
  image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCvKnwHFLpGX-fWadzmm984FRQ7GrOU6wNb4DYj__SMGW8EP30jYERonAYh3bZCE38FqRPBnLJ8ZUTvqqctYTNJCIs-SzfPU1Af8JAO_Qdc5oRfdD4chKccqPQIQnJ-2ONYm4O_gu0_KInK_zPrdni0Z00hcs0Sgwz0KuejOSKtWMYnBo82edLPGD-853P892a-VXXGPQi7HgO9-eg7KLLxob0R9bjkutm-tvanR3clRAyjQvBl23r',
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className="snap-start shrink-0 w-[260px] bg-surface rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] overflow-hidden relative group cursor-pointer transform transition-transform active:scale-[0.98]"
    >
      <div className="relative h-[146px] w-full">
        <img className="w-full h-full object-cover" alt={name} src={image} />
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[14px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-label-sm text-label-sm text-on-surface">{rating}</span>
        </div>
      </div>
      <div className="p-stack-md">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline-sm text-[16px] leading-[24px] text-on-surface truncate pr-2">{name}</h3>
          <span className="font-label-md text-label-md text-primary shrink-0 mt-1">{price}</span>
        </div>
        <div className="flex items-center text-on-surface-variant gap-1 mb-3">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          <span className="font-body-md text-[13px] truncate">{location}</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-surface-container rounded-md font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
            {category}
          </span>
          <span className="px-2 py-1 bg-surface-container rounded-md font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
            {type}
          </span>
        </div>
      </div>
    </div>
  );
}
