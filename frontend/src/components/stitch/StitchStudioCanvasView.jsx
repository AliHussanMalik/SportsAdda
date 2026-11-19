import React, { useState } from 'react';
import StitchDesignSystemBoard from './StitchDesignSystemBoard';
import StitchLogoBoard from './StitchLogoBoard';
import StitchProfileBoard from './StitchProfileBoard';
import StitchHomeScreen from './StitchHomeScreen';
import StitchMyBookingsScreen from './StitchMyBookingsScreen';
import StitchVenueDetailsScreen from './StitchVenueDetailsScreen';
import StitchSlotSelectionScreen from './StitchSlotSelectionScreen';
import StitchProfileScreen from './StitchProfileScreen';
import StitchBookingSheet from './StitchBookingSheet';
import StitchExploreScreen from './StitchExploreScreen';
import StitchMatchesBYOGScreen from './StitchMatchesBYOGScreen';
import StitchLeaderboardScreen from './StitchLeaderboardScreen';

export default function StitchStudioCanvasView() {
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'mobile_app'
  const [activeMobileScreen, setActiveMobileScreen] = useState('home'); // 'home' | 'bookings' | 'venue_detail' | 'checkout'
  const [activePassBooking, setActivePassBooking] = useState(null);
  const [selectedArtboard, setSelectedArtboard] = useState('bookings');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [promptText, setPromptText] = useState('');

  const handleBookingConfirm = (slotInfo) => {
    setActivePassBooking({
      id: `APEX-${Math.floor(10000 + Math.random() * 90000)}-PASS`,
      court: 'Indoor Court A',
      venue: 'Downtown Sports Complex',
      date: slotInfo?.date ? `Oct ${slotInfo.date}, 2026` : 'Oct 12, 2026',
      time: slotInfo?.time || '04:00 PM',
      price: slotInfo?.price || '$45.00'
    });
    setActiveMobileScreen('bookings');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Workspace Header (Recreating Stitch UI Titlebar) */}
      <header className="h-14 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
              Indoor Sports Booking
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold uppercase">
              Apex Athletics Canvas
            </span>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'canvas'
                ? 'bg-white dark:bg-[#0052ff] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            Stitch Studio Canvas View
          </button>
          <button
            onClick={() => setViewMode('mobile_app')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'mobile_app'
                ? 'bg-white dark:bg-[#0052ff] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            Interactive Mobile App Mode
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
          </button>
          <button className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-[#0052ff] text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-[#0052ff]/20 hover:bg-[#003ec7]">
            <span className="material-symbols-outlined text-[16px]">share</span>
            Share
          </button>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
            alt="User"
            className="w-8 h-8 rounded-full ml-1 border border-slate-300 dark:border-slate-700 object-cover"
          />
        </div>
      </header>

      {/* Main Canvas Workspace Container */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        
        {viewMode === 'canvas' ? (
          /* Canvas Multi-Artboard Layout matching screenshot */
          <div
            className="transition-transform duration-200 origin-center flex flex-wrap gap-8 items-center justify-center max-w-[1600px] py-10"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Artboard 1: Design System */}
            <div
              onClick={() => setSelectedArtboard('design_system')}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'design_system' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-3xl' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">palette</span>
                Apex Athletics
              </div>
              <StitchDesignSystemBoard />
            </div>

            {/* Artboard 2: Brand Logo */}
            <div
              onClick={() => setSelectedArtboard('logo')}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'logo' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-3xl' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Apex Athletics Logo
              </div>
              <StitchLogoBoard />
            </div>

            {/* Artboard 3: Profile */}
            <div
              onClick={() => setSelectedArtboard('profile')}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'profile' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-3xl' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                Professional, friendly head...
              </div>
              <StitchProfileBoard />
            </div>

            {/* Artboard 4: Home Screen */}
            <div
              onClick={() => {
                setSelectedArtboard('home');
                setActiveMobileScreen('home');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'home' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">home</span>
                Home
              </div>
              <div className="w-[340px] h-[680px] rounded-[40px] border-[6px] border-slate-900 dark:border-slate-800 overflow-hidden shadow-xl">
                <StitchHomeScreen />
              </div>
            </div>

            {/* Artboard 5: My Bookings Screen (Active outline in screenshot) */}
            <div
              onClick={() => {
                setSelectedArtboard('bookings');
                setActiveMobileScreen('bookings');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'bookings' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#0052ff] font-bold px-1">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                My Bookings ★
              </div>
              <StitchMyBookingsScreen
                onNavigate={(screen) => setActiveMobileScreen(screen)}
                onViewPass={(b) => setActivePassBooking(b)}
              />
            </div>

            {/* Artboard 6: Venue Details Screen */}
            <div
              onClick={() => {
                setSelectedArtboard('venue_detail');
                setActiveMobileScreen('venue_detail');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'venue_detail' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">stadium</span>
                Venue Details
              </div>
              <StitchVenueDetailsScreen
                onNavigate={(screen) => setActiveMobileScreen(screen)}
                onCheckAvailability={() => setActiveMobileScreen('checkout')}
              />
            </div>

            {/* Artboard 7: Slot Selection / Checkout Screen */}
            <div
              onClick={() => {
                setSelectedArtboard('checkout');
                setActiveMobileScreen('checkout');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'checkout' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Slot Selection
              </div>
              <StitchSlotSelectionScreen
                onNavigate={(screen) => setActiveMobileScreen(screen)}
                onConfirmBooking={handleBookingConfirm}
              />
            </div>

            {/* Artboard 8: User Profile Screen */}
            <div
              onClick={() => {
                setSelectedArtboard('profile_screen');
                setActiveMobileScreen('profile');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'profile_screen' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">person</span>
                Profile Settings
              </div>
              <StitchProfileScreen
                onNavigate={(screen) => setActiveMobileScreen(screen)}
              />
            </div>

            {/* Artboard 9: Explore Arenas Screen */}
            <div
              onClick={() => {
                setSelectedArtboard('explore');
                setActiveMobileScreen('explore');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'explore' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">explore</span>
                Explore Directory
              </div>
              <StitchExploreScreen
                onNavigate={(screen) => setActiveMobileScreen(screen)}
              />
            </div>

            {/* Artboard 10: Live Matches & BYOG Screen */}
            <div
              onClick={() => {
                setSelectedArtboard('matches_byog');
                setActiveMobileScreen('matches_byog');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'matches_byog' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">stadium</span>
                Live & BYOG Grounds
              </div>
              <StitchMatchesBYOGScreen
                onNavigate={(screen) => setActiveMobileScreen(screen)}
              />
            </div>

            {/* Artboard 11: Leaderboard & Keeper Stats Screen */}
            <div
              onClick={() => {
                setSelectedArtboard('leaderboard');
                setActiveMobileScreen('leaderboard');
              }}
              className={`flex flex-col items-start gap-2 cursor-pointer transition-all ${
                selectedArtboard === 'leaderboard' ? 'ring-4 ring-[#0052ff] ring-offset-4 rounded-[42px]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span className="material-symbols-outlined text-[16px]">trophy</span>
                Stats & Leaderboards
              </div>
              <StitchLeaderboardScreen
                onNavigate={(screen) => setActiveMobileScreen(screen)}
              />
            </div>

          </div>
        ) : (
          /* Interactive Mobile Frame Mode */
          <div className="flex flex-col items-center gap-4 my-6">
            <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md max-w-4xl justify-center">
              <button
                onClick={() => setActiveMobileScreen('home')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'home' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                1. Home
              </button>
              <button
                onClick={() => setActiveMobileScreen('explore')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'explore' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                2. Explore Directory
              </button>
              <button
                onClick={() => setActiveMobileScreen('matches_byog')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'matches_byog' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                3. Live & BYOG
              </button>
              <button
                onClick={() => setActiveMobileScreen('leaderboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'leaderboard' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                4. Leaderboard & Stats
              </button>
              <button
                onClick={() => setActiveMobileScreen('venue_detail')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'venue_detail' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                5. Venue Details
              </button>
              <button
                onClick={() => setActiveMobileScreen('checkout')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'checkout' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                6. Slot Selection
              </button>
              <button
                onClick={() => setActiveMobileScreen('bookings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'bookings' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                7. My Bookings
              </button>
              <button
                onClick={() => setActiveMobileScreen('profile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMobileScreen === 'profile' ? 'bg-[#0052ff] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                8. Profile
              </button>
            </div>

            {/* Active Phone Screen */}
            <div className="shadow-2xl rounded-[44px] overflow-hidden border-[8px] border-slate-900 dark:border-slate-800">
              {activeMobileScreen === 'home' && <StitchHomeScreen onNavigate={(screen) => setActiveMobileScreen(screen)} />}
              {activeMobileScreen === 'explore' && <StitchExploreScreen onNavigate={(screen) => setActiveMobileScreen(screen)} />}
              {activeMobileScreen === 'matches_byog' && <StitchMatchesBYOGScreen onNavigate={(screen) => setActiveMobileScreen(screen)} />}
              {activeMobileScreen === 'leaderboard' && <StitchLeaderboardScreen onNavigate={(screen) => setActiveMobileScreen(screen)} />}
              {activeMobileScreen === 'bookings' && (
                <StitchMyBookingsScreen
                  onNavigate={(screen) => setActiveMobileScreen(screen)}
                  onViewPass={(b) => setActivePassBooking(b)}
                  passedBooking={activePassBooking}
                />
              )}
              {activeMobileScreen === 'venue_detail' && (
                <StitchVenueDetailsScreen
                  onNavigate={(screen) => setActiveMobileScreen(screen)}
                  onCheckAvailability={() => setActiveMobileScreen('checkout')}
                />
              )}
              {activeMobileScreen === 'checkout' && (
                <StitchSlotSelectionScreen
                  onNavigate={(screen) => setActiveMobileScreen(screen)}
                  onConfirmBooking={handleBookingConfirm}
                />
              )}
              {activeMobileScreen === 'profile' && (
                <StitchProfileScreen
                  onNavigate={(screen) => setActiveMobileScreen(screen)}
                />
              )}
            </div>
          </div>
        )}

        {/* Canvas Right Tools Bar (Matching Stitch UI) */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-white dark:bg-[#131b2e] p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2 z-20">
          <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0052ff] hover:bg-slate-200">
            <span className="material-symbols-outlined text-[20px]">near_me</span>
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">crop</span>
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">pan_tool</span>
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">image</span>
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">palette</span>
          </button>
          <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[20px]">star</span>
          </button>
        </div>

        {/* Canvas Bottom Left/Center AI Prompt Floating Bar (Matching screenshot) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#131b2e] px-4 py-3 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 w-full max-w-xl z-20">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700 font-light">/</span>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="What would you like to change or create?"
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400"
          />
          <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-[14px] text-amber-500">bolt</span>
            3 Flash
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#0052ff] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </div>

        {/* Canvas Bottom Right Zoom & History Controls */}
        <div className="absolute bottom-6 right-6 bg-white dark:bg-[#131b2e] p-1.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 z-20">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">redo</span>
          </button>
          <button
            onClick={() => setZoomLevel(zoomLevel === 100 ? 75 : 100)}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            {zoomLevel}%
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
          </button>
        </div>

      </div>

      {/* Booking QR Code Pass Modal */}
      {activePassBooking && (
        <StitchBookingSheet
          booking={activePassBooking}
          onClose={() => setActivePassBooking(null)}
        />
      )}

    </div>
  );
}
