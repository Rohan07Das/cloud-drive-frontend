"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';
import StaggeredMenu from '@/components/StaggeredMenu';

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

export default function ContactPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader state
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cloud_username') || 'Guest';
    }
    return 'Guest';
  });

  const logout = () => {
    localStorage.removeItem('cloud_token');
    localStorage.removeItem('cloud_username');
    router.push('/');
  };

  // ─── CONNECTED API PIPELINE ACTION ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

// 1. Resolve the base domain name securely and strip any accidental trailing slashes
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
    
    // 2. Explicitly append the routing path so it targets the correct endpoint
    const BACKEND_ENDPOINT = `${baseUrl}/api/contact`;

    try {
      const response = await fetch(BACKEND_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // Removed standard Authorization headers since the contact endpoint is public
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✨ Message encryption dispatched successfully into transmission buffers! Check your email.");
        setFormState({ name: '', email: '', message: '' });
      } else {
        alert(`❌ Gateway Error: ${data.details || data.error || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("Transmission interruption:", error);
      alert("💥 System network error. Verify that your backend server is up and routing properly.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className={`min-h-screen bg-[#f7f5ee] text-[#111111] antialiased flex flex-col overflow-hidden ${spaceGrotesk.className}`}>
      
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

      <div className="fixed top-0 left-0 w-full z-[110]">
        <div className="absolute inset-0 h-[40px] bg-[#f7f5ee]/55 backdrop-blur-md border-b border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]" />
        
        <div className="fixed top-1 right-30 z-[120]">
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="w-12 h-7.5 rounded-2xl border-2 border-[#161513] bg-white shadow-[4px_4px_0px_0px_rgba(22,21,19,1)] flex items-center justify-center hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#161513] fill-none" strokeWidth="2.2">
                <path d="M20 21C20 17.134 16.866 14 13 14H11C7.134 14 4 17.134 4 21" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-[#161513] rounded-[1.7rem] p-4 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)]">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-[#161513] text-white flex items-center justify-center text-sm font-black uppercase">
                    {username.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account</p>
                    <h4 className="text-sm font-black text-[#161513] truncate">{username}</h4>
                  </div>
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
          <StaggeredMenu
            position="left"
            items={menuItems}
            socialItems={socialItems}
            displaySocials
            displayItemNumbering={true}
            menuButtonColor="#161513"
            openMenuButtonColor="#161513"
            changeMenuColorOnOpen={true}
            colors={['#161513', '#F97B0C']}
            accentColor="#161513"
          />
        </div>
      </div>

      <main className="flex-1 min-w-0 p-6 sm:p-10 md:p-12 pl-6 sm:pl-[40px] pt-20">
        <header className="flex items-center justify-between gap-4 mb-8 bg-[#161513] text-[#f7f5ee] px-8 py-3.5 rounded-2xl border-2 border-[#161513] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase tracking-tight">Cloud Drive</h1>
          </div>
          <div className="flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-300">
            <span className="hidden sm:inline opacity-60">Secure Vault</span>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition font-black">
              Back to Drive
            </button>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900">お問い合わせ</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#cae2db] text-[#111111] border-2 border-[#161513] rounded-[2rem] p-6 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)]">
              <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Core Node</h3>
              <p className="text-xs font-medium leading-relaxed opacity-80">Direct secure array endpoint connection processing requests.</p>
              <p className="text-sm font-black mt-4 select-all tracking-tight">support@clouddrive.co</p>
            </div>

            <div className="bg-[#ebd2cc] text-[#111111] border-2 border-[#161513] rounded-[2rem] p-6 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)]">
              <h3 className="text-xl font-black tracking-tight mb-2 uppercase">External Socials</h3>
              <div className="flex flex-col gap-2 mt-2">
                <a href="https://github.com/Rohan07Das" target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-wider hover:underline">→ GitHub Repository</a>
                <a href="https://www.linkedin.com/in/rohan-lal-das-87b1332a5" target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-wider hover:underline">→ LinkedIn Networking</a>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative overflow-hidden md:col-span-2 bg-[#000000] border-2 border-[#161513] rounded-[2rem] p-8 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)] space-y-6">
            <div 
              className="absolute inset-0 z-0 pointer-events-none select-none"
              style={{
                backgroundImage: "url('/moonknight.jpg')",
                backgroundSize: 'auto 100%',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat'
              }}
            />

            <h3 className="relative z-10 text-2xl font-black tracking-tight text-white mix-blend-difference">
              Dispatch Transmission
            </h3>
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Name</label>
                <input 
                  type="text" required value={formState.name} disabled={isSubmitting}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#161513] bg-white/95 font-bold text-sm outline-none focus:bg-white transition-colors text-slate-900 placeholder-slate-400 disabled:opacity-50"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Routing Email</label>
                <input 
                  type="email" required value={formState.email} disabled={isSubmitting}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#161513] bg-white/95 font-bold text-sm outline-none focus:bg-white transition-colors text-slate-900 placeholder-slate-400 disabled:opacity-50"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="relative z-10 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payload Message Content</label>
              <textarea 
                rows={5} required value={formState.message} disabled={isSubmitting}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#161513] bg-white/95 font-bold text-sm outline-none focus:bg-white transition-colors resize-none text-slate-900 placeholder-slate-400 disabled:opacity-50"
                placeholder="Write your message here..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="relative z-10 w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-[#161513] border-2 border-[#161513] font-black text-xs uppercase tracking-widest transition-all duration-100 shadow-[4px_4px_0px_0px_rgba(244,197,66,1)] hover:bg-slate-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(244,197,66,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(244,197,66,0)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Transmitting..." : "Submit Message Node"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
