import React from 'react';
import { getPlayerPhoto } from '../../utils/playerPhotos';

export default function StitchProfileScreen({ onNavigate, onLogout }) {
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/profiles');
        const data = await res.json();
        if (data.success && Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfile(data.profiles[0]);
        }
      } catch (e) {
        console.warn('Error fetching profile:', e);
      }
    }
    loadProfile();
  }, []);

  const userName = profile?.display_name || 'Babar Azam';
  const userEmail = profile?.email || 'alex@sportsadda.com';
  const userRole = profile?.role || 'PLAYER';
  const sport = profile?.primary_sport || 'CRICKET';
  const userPhoto = getPlayerPhoto(profile, 1);

  return (
    <div className="w-[340px] h-[680px] bg-surface-container-low dark:bg-[#0b0f19] rounded-[40px] shadow-2xl border-[6px] border-slate-900 dark:border-slate-800 flex flex-col overflow-hidden relative font-body-md text-on-surface select-none">
      
      {/* Fixed Top Header Bar */}
      <header className="bg-surface/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-outline/10 shrink-0 z-20">
        <div className="h-14 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-stack-sm">
            <img
              alt="Apex Athletics Logo"
              className="h-7 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4nRhePK8GMSYlWyCAX170-YglvcmVzD20rpQhS2675ELT4ma4zt6iY5LO4pS_oeQR7TgqZF_dTbYIF3S6XNld7vFpp8QljErc2bgadiQDRUeSGCjg3TSTYnk7orpU-KQejqWY6Al5srdH6qqwu5HncNzf20t0NsX7iMQdm9cGt-JczKCznZkYzazXOViIBcE6J-iyC1sTCwlTEJ7yYhoZ4wXYe7JbhMsnFbtuh3JEa2ScjdRzR_Yh"
            />
            <span className="font-headline-sm text-[16px] text-primary font-bold">Profile</span>
          </div>
          <img
            alt={userName}
            className="w-8 h-8 rounded-full object-cover border border-primary/30"
            src={userPhoto}
          />
        </div>
      </header>

      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 bg-surface-container-low dark:bg-[#0b0f19]">
        <div className="flex flex-col w-full bg-surface dark:bg-[#131b2e]">
          
          {/* User Profile Info Card */}
          <div className="px-margin-mobile py-stack-lg flex flex-col items-center">
            <div className="relative w-20 h-20 mb-stack-sm">
              <img
                alt={userName}
                className="w-full h-full object-cover rounded-full shadow-md border-2 border-primary/20"
                src={userPhoto}
              />
              <button
                aria-label="Edit Profile"
                className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm text-white hover:bg-[#003ec7] transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
              </button>
            </div>
            <h1 className="font-headline-md text-[18px] font-bold text-on-surface">{userName}</h1>
            <p className="font-body-md text-[12px] text-on-surface-variant">{userRole} • {sport} • {userEmail}</p>
          </div>

          {/* Quick Stats Cards Grid */}
          <div className="px-margin-mobile mb-stack-lg">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-container-low dark:bg-slate-900 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border border-outline/10">
                <span className="font-headline-md text-[16px] font-extrabold text-primary mb-0.5">24</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">Total Bookings</span>
              </div>
              <div className="bg-surface-container-low dark:bg-slate-900 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border border-outline/10">
                <span className="font-headline-md text-[16px] font-extrabold text-primary mb-0.5">36</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">Hours Played</span>
              </div>
              <div className="bg-surface-container-low dark:bg-slate-900 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border border-outline/10">
                <span className="material-symbols-outlined text-primary mb-0.5 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  sports_tennis
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">Top Sport</span>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="px-margin-mobile mb-stack-md">
            <h2 className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-2 px-1 font-semibold">
              Account Settings
            </h2>
            <div className="bg-surface-container-lowest dark:bg-slate-900/80 rounded-xl shadow-sm overflow-hidden border border-outline/10">
              
              <button className="w-full py-3 px-3 flex items-center gap-3 bg-transparent hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-body-lg text-[13px] text-on-surface font-medium">Personal Information</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>
              
              <div className="h-px bg-outline/10 ml-12"></div>

              <button className="w-full py-3 px-3 flex items-center gap-3 bg-transparent hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">payment</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-body-lg text-[13px] text-on-surface font-medium">Payment Methods</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>

              <div className="h-px bg-outline/10 ml-12"></div>

              <button className="w-full py-3 px-3 flex items-center gap-3 bg-transparent hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">notifications</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-body-lg text-[13px] text-on-surface font-medium">Notifications</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>

              <div className="h-px bg-outline/10 ml-12"></div>

              <button className="w-full py-3 px-3 flex items-center gap-3 bg-transparent hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">security</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-body-lg text-[13px] text-on-surface font-medium">Security</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>

              <div className="h-px bg-outline/10 ml-12"></div>

              <button className="w-full py-3 px-3 flex items-center gap-3 bg-transparent hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">policy</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-body-lg text-[13px] text-on-surface font-medium">Privacy Policy</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>

            </div>
          </div>

          {/* Help & Support Section */}
          <div className="px-margin-mobile mb-stack-md">
            <h2 className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mb-2 px-1 font-semibold">
              Help &amp; Support
            </h2>
            <div className="bg-surface-container-lowest dark:bg-slate-900/80 rounded-xl shadow-sm overflow-hidden border border-outline/10">
              
              <button className="w-full py-3 px-3 flex items-center gap-3 bg-transparent hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">help_center</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-body-lg text-[13px] text-on-surface font-medium">Help Center</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>

              <div className="h-px bg-outline/10 ml-12"></div>

              <button className="w-full py-3 px-3 flex items-center gap-3 bg-transparent hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="block font-body-lg text-[13px] text-on-surface font-medium">Contact Us</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>

            </div>
          </div>

          {/* Log Out Button */}
          <div className="px-margin-mobile mb-stack-lg pt-2 pb-4">
            <button
              onClick={() => onLogout && onLogout()}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-headline-sm text-[13px] font-bold hover:bg-rose-500 hover:text-white transition-colors shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Log Out
            </button>
          </div>

        </div>
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 dark:bg-[#131b2e]/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)] border-t border-outline/10">
        <div className="flex justify-around items-center h-16 px-gutter-mobile">
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="font-label-md text-[10px]">Home</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('venue_detail')}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
            <span className="font-label-md text-[10px]">Explore</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('bookings')}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <span className="font-label-md text-[10px]">Bookings</span>
          </button>
          <button
            className="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors text-primary font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="font-label-md text-[10px]">Profile</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
