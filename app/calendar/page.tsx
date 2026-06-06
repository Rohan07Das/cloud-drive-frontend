"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';
import StaggeredMenu from '@/components/StaggeredMenu';

// Initialize Space Grotesk font family metrics
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/dashboard' },
  { label: 'Calendar', ariaLabel: 'View our calendar', link: '/calendar' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
];

const socialItems = [
  { label: 'GitHub', link: 'https://github.com/Rohan07Das' },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/rohan-lal-das-87b1332a5' }
];

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Available theme colors for task badges matching neo-brutalist styling palette
const colorTracks = [
  { value: 'bg-[#cae2db]', label: 'Sage Green' },
  { value: 'bg-[#ebd2cc]', label: 'Blush Pink' },
  { value: 'bg-[#d2daeb]', label: 'Periwinkle Blue' },
  { value: 'bg-[#f0e3be]', label: 'Sand Yellow' }
];

interface EventItem {
  year: number;
  month: number;
  day: number;
  title: string;
  track: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [cardSize, setCardSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [username, setUsername] = useState('Guest');
  
  // Dynamic Real-time Task State initialization with localStorage fallback
  const [scheduleEvents, setScheduleEvents] = useState<EventItem[]>([]);

  // Modal Dialog UI state managers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDay, setNewTaskDay] = useState(1);
  const [newTaskColor, setNewTaskColor] = useState('bg-[#cae2db]');

  // Track real system "Today" parameters safely inside states after mounting
  const [todayDate, setTodayDate] = useState<{ day: number; month: number; year: number } | null>(null);

  // Track layout month (0-11) and year dynamically
  const [currentMonth, setCurrentMonth] = useState(5); // June default
  const [currentYear, setCurrentYear] = useState(2026); // 2026 default

  useEffect(() => {
    const savedUsername = localStorage.getItem('cloud_username');
    if (savedUsername) setUsername(savedUsername);

    // Load tasks from localStorage if available, otherwise fallback to defaults
    const savedEvents = localStorage.getItem('calendar_schedule_events');
    if (savedEvents) {
      setScheduleEvents(JSON.parse(savedEvents));
    } else {
      setScheduleEvents([
        { year: 2026, month: 5, day: 5, title: "Assets Sync", track: "bg-[#ebd2cc]" },
        { year: 2026, month: 5, day: 12, title: "Node Cleanup", track: "bg-[#cae2db]" },
        { year: 2026, month: 5, day: 19, title: "DB Optimize", track: "bg-[#d2daeb]" },
      ]);
    }

    // Capture system date specs cleanly
    const rightNow = new Date();
    setTodayDate({
      day: rightNow.getDate(),
      month: rightNow.getMonth(),
      year: rightNow.getFullYear()
    });
  }, []);

  // Automatically save to localStorage when scheduleEvents state changes
  useEffect(() => {
    if (scheduleEvents.length > 0 || localStorage.getItem('calendar_schedule_events')) {
      localStorage.setItem('calendar_schedule_events', JSON.stringify(scheduleEvents));
    }
  }, [scheduleEvents]);

  // ─── DYNAMIC MULTI-YEAR CALENDAR LOGIC ───
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffsetDays = new Date(currentYear, currentMonth, 1).getDay();

  const currentMonthEvents = scheduleEvents.filter(
    ev => ev.year === currentYear && ev.month === currentMonth
  );

  // ─── TASK ADDITION HANDLER ───
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const addedItem: EventItem = {
      year: currentYear,
      month: currentMonth,
      day: Number(newTaskDay),
      title: newTaskTitle.trim(),
      track: newTaskColor
    };

    setScheduleEvents(prev => [...prev, addedItem]);
    
    // Reset Form Input fields safely
    setNewTaskTitle('');
    setNewTaskDay(1);
    setIsModalOpen(false);
  };

  // ─── TASK REMOVAL HANDLER ───
  const handleRemoveTask = (targetEvent: EventItem) => {
    setScheduleEvents(prev => 
      prev.filter(ev => !(ev.year === targetEvent.year && ev.month === targetEvent.month && ev.day === targetEvent.day && ev.title === targetEvent.title))
    );
  };

  // ─── MULTI-YEAR NAVIGATION HANDLERS ───
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  // ─── MULTI-YEAR NAVIGATION HANDLERS ───
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const logout = () => {
    localStorage.removeItem('cloud_token');
    router.push('/');
  };

  // ─── DYNAMIC SIZE CALCULATIONS ───
  const getGridStyles = () => {
    if (cardSize === 'sm') return { gap: 'gap-2', p: 'p-2', text: 'text-[10px]', cellHeight: 'min-h-[60px]' };
    if (cardSize === 'md') return { gap: 'gap-3', p: 'p-4', text: 'text-sm', cellHeight: 'min-h-[100px]' };
    return { gap: 'gap-5', p: 'p-6', text: 'text-lg', cellHeight: 'min-h-[140px]' };
  };

  const styles = getGridStyles();

  // ─── ONEKO CURSOR MASCOT CONTROLLER INTERSECTION ───
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const el = document.createElement('div');
    el.id = "oneko";
    el.style.display = 'block';
    document.body.appendChild(el);

    let nX = 32, nY = 32, mX = 0, mY = 0, fCount = 0, iTime = 0, iAnim: string | null = null, iFrame = 0;
    const speed = 10;
    const sprites: Record<string, number[][]> = {
      idle: [[-3, -3]], alert: [[-7, -3]], scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
      tired: [[-3, -2]], sleeping: [[-2, 0], [-2, -1]],
      N: [[-1, -2], [-1, -3]], NE: [[0, -2], [0, -3]], E: [[-3, 0], [-3, -1]], SE: [[-5, -1], [-5, -2]],
      S: [[-6, -3], [-7, -2]], SW: [[-5, -3], [-6, -1]], W: [[-4, -2], [-4, -3]], NW: [[-1, -1], [-1, 0]],
    };

    const handleMove = (e: MouseEvent) => { mX = e.clientX; mY = e.clientY; };
    document.addEventListener("mousemove", handleMove);

    let lastTime = 0;
    const loop = (ts: number) => {
      if (ts - lastTime > 100) {
        lastTime = ts; fCount++; const dX = nX - mX + 16, dY = nY - mY + 16, dist = Math.sqrt(dX * dX + dY * dY);
        if (dist < speed || dist < 48) {
          iTime++; if (iTime > 10 && Math.floor(Math.random() * 200) === 0 && !iAnim) iAnim = ["sleeping", "scratchSelf"][Math.floor(Math.random() * 2)];
          if (iAnim && sprites[iAnim]) { 
             const arr = sprites[iAnim];
             const sp = arr[iFrame % arr.length]; 
             el.style.backgroundPosition = `${sp[0] * 32}px ${sp[1] * 32}px`; 
             if (iFrame > 9) { iAnim = null; iFrame = 0; } 
          }
          else el.style.backgroundPosition = `${sprites.idle[0][0] * 32}px ${sprites.idle[0][1] * 32}px`; iFrame++;
        } else {
          iAnim = null; iFrame = 0;
          if (iTime > 1) {
            el.style.backgroundPosition = `${sprites.alert[0][0] * 32}px ${sprites.alert[0][1] * 32}px`;
            iTime = Math.max(iTime - 1, 0);
          } else {
            /* ─── FIXED DIAGONAL DIRECTION MATRIX LOGIC ─── */
            let dir = "";
            if (dY / dist > 0.3) dir += "N";
            else if (dY / dist < -0.3) dir += "S";
            
            if (dX / dist > 0.3) dir += "W";
            else if (dX / dist < -0.3) dir += "E";

            const animName = dir || "idle";
            const arr = sprites[animName] ? sprites[animName] : sprites.idle;
            const sp = arr[fCount % arr.length];

            el.style.backgroundPosition = `${sp[0] * 32}px ${sp[1] * 32}px`; nX -= (dX / dist) * speed; nY -= (dY / dist) * speed; el.style.left = `${nX - 16}px`; el.style.top = `${nY - 16}px`;
          }
        }
      } requestAnimationFrame(loop);
    }; requestAnimationFrame(loop);
    return () => { document.removeEventListener("mousemove", handleMove); if (document.body.contains(el)) document.body.removeChild(el); };
  }, []);

  return (
    <div className={`min-h-screen bg-[#f7f5ee] text-[#111111] antialiased flex flex-col ${spaceGrotesk.className}`}>
      
      {/* ─── STYLES INJECTION BLOCK (ONEKO STYLING OVERLAY) ─── */}
      <style dangerouslySetInnerHTML={{__html: `
        #oneko {
          position: fixed;
          width: 32px;
          height: 32px;
          pointer-events: none;
          image-rendering: pixelated;
          z-index: 99999;
          background-image: url('https://raw.githubusercontent.com/adryd325/oneko.js/main/oneko.gif');
          display: none;
        }
        @media (max-width: 600px) {
          #oneko { display: none !important; }
        }
      `}} />

      {/* ─── FLOATING BLUR HEADER LAYER ─── */}
      <div className="fixed top-0 left-0 w-full z-[110]">
        <div className="absolute inset-0 h-[40px] bg-[#f7f5ee]/55 backdrop-blur-md border-b border-black/5" />
        <div className="fixed top-1 right-30 z-[120]">
          <div className="relative">
            {/* UPDATED PROFILE ACCOUNT BUTTON TO MATCH THE CALENDAR ARROW BUTTON HOVER AND ACTIVE TRANSLATION PATTERNS EXACTLY */}
            <button 
              onClick={() => setIsAccountOpen(!isAccountOpen)} 
              className="w-12 h-7.5 rounded-2xl border-2 border-[#161513] bg-white shadow-[4px_4px_0px_0px_rgba(22,21,19,1)] flex items-center justify-center hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#161513] fill-none" strokeWidth="2.2"><path d="M20 21C20 17.134 16.866 14 13 14H11C7.134 14 4 17.134 4 21" /><circle cx="12" cy="7" r="4" /></svg>
            </button>
            {isAccountOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-[#161513] rounded-[1.7rem] p-4 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)]">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-[#161513] text-white flex items-center justify-center text-sm font-black uppercase">{username.charAt(0)}</div>
                  <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account</p><h4 className="text-sm font-black text-[#161513] truncate">Rohan</h4></div>
                </div>
                <button 
                  onClick={logout} 
                  className="mt-4 w-full py-3 rounded-2xl border-2 border-[#161513] bg-white text-[#161513] text-xs font-black uppercase tracking-[0.18em] transition-all shadow-[4px_4px_0px_0px_rgba(22,21,19,1)] hover:bg-red-500 hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <StaggeredMenu position="left" items={menuItems} socialItems={socialItems} displaySocials displayItemNumbering={true} menuButtonColor="#161513" openMenuButtonColor="#161513" changeMenuColorOnOpen={true} colors={['#161513', '#F97B0C']} accentColor="#161513" />
        </div>
      </div>

      <main className="flex-1 min-w-0 p-6 sm:p-10 md:p-12 pl-6 sm:pl-[40px] pt-20">
        
        {/* BLACK NAVIGATION HEADER BAR */}
        <header className="flex items-center justify-between gap-4 mb-8 bg-[#161513] text-[#f7f5ee] px-8 py-3.5 rounded-2xl border-2 border-[#161513] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase tracking-tight">Cloud Drive</h1>
          </div>
          <div className="flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-300">
            <span className="hidden sm:inline opacity-60">Secure Vault</span>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition font-black">Back to Drive</button>
          </div>
        </header>

        {/* CONTROLLER FILTERS RULER BAR WITH MONTH NAVIGATION AND SIZES */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8 w-full">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 shrink-0">カレンダー</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
            
            {/* MONTH & YEAR NAVIGATION */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrevMonth}
                className="w-10 h-10 rounded-xl border-2 border-[#161513] bg-white flex items-center justify-center transition-all duration-100 shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)] shrink-0"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#161513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-[#161513] w-[220px] sm:w-[320px] text-center shrink-0">
                {months[currentMonth]} {currentYear}
              </h3>
              
              <button 
                onClick={handleNextMonth}
                className="w-10 h-10 rounded-xl border-2 border-[#161513] bg-white flex items-center justify-center transition-all duration-100 shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)] shrink-0"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#161513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            {/* SIZE SELECTOR BUTTONS */}
            <div className="flex bg-[#f7f5ee] p-1.5 rounded-xl border-2 border-[#161513] items-center gap-2 text-[10px] font-black tracking-wider uppercase shadow-[3px_3px_0px_0px_rgba(22,21,19,1)]">
              <button 
                onClick={() => setCardSize('sm')} 
                className={`w-8 h-8 rounded-lg font-black text-xs transition-all duration-100 border-2 border-[#161513] ${
                  cardSize === 'sm' 
                    ? 'bg-[#161513] text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]' 
                    : 'bg-white text-[#161513] shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]'
                }`}
              >
                S
              </button>

              <button 
                onClick={() => setCardSize('md')} 
                className={`w-8 h-8 rounded-lg font-black text-xs transition-all duration-100 border-2 border-[#161513] ${
                  cardSize === 'md' 
                    ? 'bg-[#161513] text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]' 
                    : 'bg-white text-[#161513] shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]'
                }`}
              >
                M
              </button>

              <button 
                onClick={() => setCardSize('lg')} 
                className={`w-8 h-8 rounded-lg font-black text-xs transition-all duration-100 border-2 border-[#161513] ${
                  cardSize === 'lg' 
                    ? 'bg-[#161513] text-white translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]' 
                    : 'bg-white text-[#161513] shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]'
                }`}
              >
                L
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* SIDE SCHEDULE CARD WITH SCROLLBAR INTEGRATION */}
          <div className="w-full lg:w-[320px] shrink-0 bg-white border-2 border-[#161513] rounded-[2rem] p-6 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)]">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Tasks</h3>
              
              {/* TRIGGER ADD MODAL ACTION ICON BUTTON */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-8 h-8 rounded-lg border-2 border-[#161513] bg-white flex items-center justify-center transition-all duration-100 shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]"
                title="Add task node descriptor"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#161513" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            {/* --- ADDED OVERFLOW CONTAINER LAYER FOR VERTICAL SCROLL ALIGNMENT --- */}
            {currentMonthEvents.length > 0 ? (
              <div className="max-h-[340px] overflow-y-auto pr-1 space-y-4 [scrollbar-gutter:stable]">
                {currentMonthEvents.map((ev, idx) => (
                  <div key={idx} className={`relative group p-4 pr-10 rounded-xl border-2 border-[#161513] shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] ${ev.track}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Day {ev.day}</span>
                    <h4 className="text-sm font-black tracking-tight mt-0.5">{ev.title}</h4>
                    
                    {/* Realtime Remove Button */}
                    <button
                      onClick={() => handleRemoveTask(ev)}
                      className="absolute top-2 right-2.5 w-6 h-6 rounded-lg border-2 border-[#161513] bg-white flex items-center justify-center font-black text-xs text-[#161513] transition-all duration-100 shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] hover:bg-red-500 hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]"
                      title="Remove Task"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-400 opacity-80">No tasks for this month.</p>
            )}
          </div>

          {/* DYNAMIC CALENDAR AREA */}
          <div className="flex-1 w-full flex flex-col gap-4">
            
            {/* DYNAMIC CALENDAR GRID CONTAINER */}
            <div className="w-full bg-white border-2 border-[#161513] rounded-[2rem] p-6 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)] transition-all duration-300">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-widest border-b-2 border-[#161513] pb-4 mb-4 text-slate-400">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div className={`grid grid-cols-7 ${styles.gap}`}>
                {Array.from({ length: startOffsetDays }).map((_, i) => (
                  <div key={`empty-${i}`} className={`bg-[#f7f5ee]/40 rounded-xl border border-dashed border-slate-200 ${styles.cellHeight}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  // Look up all events targeted onto specific day keys 
                  const matchedEvents = scheduleEvents.filter(e => e.year === currentYear && e.month === currentMonth && e.day === dayNum);
                  
                  // Check if this card matches exact today system attributes
                  const isToday = todayDate !== null && 
                                  todayDate.day === dayNum && 
                                  todayDate.month === currentMonth && 
                                  todayDate.year === currentYear;

                  return (
                    <div 
                      key={`day-${dayNum}`} 
                      className={`
                        relative overflow-hidden ${styles.p} ${styles.cellHeight} 
                        rounded-2xl border-2 border-[#161513] 
                        flex flex-col justify-between 
                        transition-all hover:-translate-y-0.5 cursor-pointer 
                        ${matchedEvents.length > 0 ? matchedEvents[0].track : 'bg-[#f7f5ee]/50 hover:bg-[#f6f2e8]'}
                        ${isToday ? 'outline-4 outline-dashed outline-offset-2 outline-black bg-white shadow-inner' : ''}
                      `}
                    >
                      {/* ─── DIRECT LINK DOODLE BACKGROUND IMAGE INSIDE TODAY'S BOX ─── */}
                      {isToday && (
                        <div 
                          className="absolute inset-0 z-0 pointer-events-none select-none mix-blend-multiply opacity-80"
                          style={{
                            backgroundImage: "url(/MR-doodle.jpg)",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      )}

                      {/* ─── ENHANCED TODAY DATE POPUP INDICATOR ─── */}
                      <span 
                        className={`
                          relative z-10 font-black tracking-tight transition-all duration-300
                          ${isToday 
                            ? 'text-4xl text-white drop-shadow-[0_3px_5px_rgba(0,0,0,0.95)]' 
                            : `${styles.text} text-slate-800`
                          }
                        `}
                        style={isToday ? { WebkitTextStroke: '1.5px #000000' } : {}}
                      >
                        {dayNum}
                      </span>

                      {/* Render stacked events list block targets */}
                      <div className="relative z-10 w-full space-y-1">
                        {matchedEvents.map((ev, evIdx) => (
                          <span key={evIdx} className={`block ${cardSize === 'sm' ? 'text-[6px] px-1 py-0' : 'text-[9px] px-1.5 py-0.5'} font-black uppercase tracking-tight truncate bg-white rounded-md border border-[#161513] shadow-[1px_1px_0px_0px_rgba(22,21,19,1)]`}>
                            {ev.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>
      </main>

      {/* ─── NEO-BRUTALIST INTERACTIVE POPUP MODAL ARCHITECTURE ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop screen filter boundary mask */}
          <div 
            onClick={() => setIsModalOpen(false)} 
            className="absolute inset-0 bg-[#161513]/40 backdrop-blur-xs transition-opacity"
          />
          
          <div className="relative w-full max-w-md bg-white border-4 border-[#161513] rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(22,21,19,1)] z-10 transform transition-all">
            <div className="flex items-center justify-between border-b-2 border-[#161513] pb-4 mb-6">
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#161513]">Create Task Node</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg border-2 border-[#161513] bg-white text-[#161513] font-black flex items-center justify-center text-sm transition-all duration-100 shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] hover:bg-red-500 hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddTaskSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Title Descriptor</label>
                <input 
                  type="text" 
                  required 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#161513] bg-[#f7f5ee]/50 font-bold text-sm outline-none focus:bg-white transition-colors text-slate-900 placeholder-slate-400"
                  placeholder="e.g., Code Verification Buffer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Day Index</label>
                  <select 
                    value={newTaskDay}
                    onChange={(e) => setNewTaskDay(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#161513] bg-[#f7f5ee]/50 font-black text-sm outline-none focus:bg-white transition-colors text-slate-900"
                  >
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Month Window Context</label>
                  <input 
                    type="text" 
                    disabled 
                    value={`${months[currentMonth]} ${currentYear}`}
                    className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 font-bold text-sm text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">System Track Color Node</label>
                <div className="flex gap-3">
                  {colorTracks.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewTaskColor(color.value)}
                      className={`w-10 h-10 rounded-xl border-2 border-[#161513] transition-all duration-100 relative ${color.value} ${
                        newTaskColor === color.value
                          ? 'translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]'
                          : 'shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]'
                      }`}
                      title={color.label}
                    >
                      {newTaskColor === color.value && (
                        <span className="absolute inset-0 flex items-center justify-center font-black text-s">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-4 rounded-xl bg-white text-[#161513] border-2 border-[#161513] font-black text-xs uppercase tracking-widest transition-all duration-100 shadow-[4px_4px_0px_0px_rgba(22,21,19,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]"
                >
                  Commit Realtime Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
