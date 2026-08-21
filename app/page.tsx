"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Imported for internal redirection
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export default function Home() {
  const router = useRouter(); // Initialize the Next.js router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [botMessage, setBotMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<'bg-[#0DE4B9]' | 'bg-red-400' | 'bg-amber-400'>('bg-[#0DE4B9]');

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  // --- THE REAL BACKEND CONNECTION ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setBotMessage(null);

    // 1. EMPTY FIELD CHECK
    if (!email.trim() || !password.trim()) {
      setTimeout(() => {
        setBotMessage("SYSTEM ALERT: Enter both your ID and password keys.");
        setMessageColor('bg-amber-400');
        messageTimeoutRef.current = setTimeout(() => setBotMessage(null), 4000);
      }, 50);
      return; 
    }

    // 2. SHOW LOADING STATE
    setTimeout(() => {
      setBotMessage("Connecting to secure transmission cluster...");
      setMessageColor('bg-[#0DE4B9]');
    }, 50);

    try {
      // 3. SEND REAL CREDENTIALS TO FLASK/FASTAPI (LIVE RENDER URL)
      const response = await fetch(' https://cloud-drive-api-ag3g.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 4. SUCCESS: STORE TOKEN AND TRANSITION INTERNALLY
        setBotMessage("Access Granted! Triggering console teleportation...");
        setMessageColor('bg-[#0DE4B9]');

        // Save the received token securely to localStorage for your dashboard to grab
        localStorage.setItem('cloud_token', data.token);

        setTimeout(() => {
          // Push the route internally to your new Next.js dashboard route (/app/dashboard/page.tsx)
          router.push('/dashboard');
        }, 1500);

      } else {
        // 5. REJECTED LOGIN (Wrong password, etc.)
        setBotMessage(data.error || "Access Denied: Invalid ID or password.");
        setMessageColor('bg-red-400');
        messageTimeoutRef.current = setTimeout(() => setBotMessage(null), 4000);
      }

    } catch (error) {
      // 6. SERVER IS OFFLINE
      setBotMessage("Fatal Error: Could not establish server handshake.");
      setMessageColor('bg-red-400');
      messageTimeoutRef.current = setTimeout(() => setBotMessage(null), 4000);
    }
  };

  return (
    <main className={`relative flex min-h-screen items-center justify-start bg-[#FFFFFF] overflow-hidden antialiased p-6 md:p-20 ${spaceGrotesk.className}`}>
      
      <style>{`
        @keyframes slidePop {
          0% { opacity: 0; transform: translateY(-15px) scale(0.95); }
          70% { transform: translateY(2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-pop {
          animation: slidePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* --- STICKER BOMB IMAGE POSITIONED EXCLUSIVELY ON THE RIGHT SIDE --- */}
      <div 
        className="hidden md:block absolute right-16 top-0 bottom-0 w-[45%] bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('https://r4.wallpaperflare.com/wallpaper/798/118/422/sticker-bomb-sticks-bombs-wallpaper-00133d613f3f4a18ecaab94d0666fcb1.jpg')` }}
      />

      {/* --- FORM CONTAINER FIXED TO THE LEFT SIDE --- */}
      <div className="w-full max-w-[440px] flex flex-col items-center relative z-10 md:ml-10">
        
        {/* --- BRAND TITLE HEADER --- */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-200 border-4 border-black bg-white shadow-[5px_5px_0px_#000000] px-6 py-2.5 rounded-2xl">
          <h1 className="text-xl md:text-2xl font-bold text-black text-center tracking-tight uppercase select-none">
            USER SIGN IN
          </h1>
        </div>

        {/* --- SYSTEM NOTIFICATION HEADER FEED --- */}
        {botMessage && (
          <div className={`w-full mb-4 ${messageColor} border-4 border-black shadow-[4px_4px_0px_#000000] rounded-2xl px-5 py-3 animate-slide-pop text-center`}>
            <p className="text-xs font-bold font-mono uppercase tracking-wide text-black">
              {botMessage}
            </p>
          </div>
        )}

        {/* --- MAIN ACTION FORM CONTAINER --- */}
        <form 
          onSubmit={handleLogin}
          noValidate 
          className="w-full p-8 md:p-10 rounded-[2.5rem] bg-white border-4 border-black shadow-[8px_8px_0px_#000000] flex flex-col relative transition-all duration-300"
        >
          
          {/* --- DATA INPUT TARGET FIELDS --- */}
          <div className="space-y-6">
            
            {/* EMAIL INPUT BLOCK */}
            <div className="relative">
              <label className="block text-[11px] font-bold tracking-widest text-[#1a1a1a] uppercase font-mono mb-2" htmlFor="email">
                IDENTITY NAME DESCRIPTOR // EMAIL
              </label>
              
              <div className="relative w-full group">
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  suppressHydrationWarning
                  className="w-full bg-white border-4 border-black rounded-2xl pl-5 pr-14 py-3.5 text-black placeholder-slate-400 font-bold text-sm shadow-[4px_4px_0px_#000000] transition-all duration-200 focus:outline-none focus:bg-[#FAF6EE] focus:shadow-[6px_6px_0px_#000000] focus:-translate-x-0.5 focus:-translate-y-0.5 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000]"
                  placeholder="Enter registered email address"
                />
                
                {/* Clear Email Button */}
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="absolute top-1/2 right-4 -translate-y-1/2 w-6 h-6 rounded-lg border-2 border-[#161513] bg-white flex items-center justify-center font-black text-xs text-[#161513] pointer-events-auto z-20 transition-all duration-100 shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] group-hover:-translate-x-0.5 group-hover:translate-y-[-55%] group-hover:shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] group-focus-within:-translate-x-0.5 group-focus-within:translate-y-[-55%] group-focus-within:shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] hover:bg-red-500 hover:text-white hover:!translate-x-0 hover:!translate-y-[-40%] hover:shadow-[1px_1px_0px_0px_rgba(22,21,19,1)] active:!translate-x-[2px] active:!translate-y-[-30%] active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]"
                    title="Remove Task"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* PASSWORD INPUT BLOCK */}
            <div className="relative">
              <label className="block text-[11px] font-bold tracking-widest text-[#1a1a1a] uppercase font-mono mb-2" htmlFor="password">
                ACCESS CIPHER KEY // PASSWORD
              </label>
              
              <div className="relative w-full group">
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  suppressHydrationWarning
                  className="w-full bg-white border-4 border-black rounded-2xl pl-5 pr-14 py-3.5 text-black placeholder-slate-400 font-bold text-sm shadow-[4px_4px_0px_#000000] transition-all duration-200 focus:outline-none focus:bg-[#FAF6EE] focus:shadow-[6px_6px_0px_#000000] focus:-translate-x-0.5 focus:-translate-y-0.5 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000]"
                  placeholder="Enter authentication key"
                />

                {/* Clear Password Button */}
                {password && (
                  <button
                    type="button"
                    onClick={() => setPassword('')}
                    className="absolute top-1/2 right-4 -translate-y-1/2 w-6 h-6 rounded-lg border-2 border-[#161513] bg-white flex items-center justify-center font-black text-xs text-[#161513] pointer-events-auto z-20 transition-all duration-100 shadow-[2px_2px_0px_0px_rgba(22,21,19,1)] group-hover:-translate-x-0.5 group-hover:translate-y-[-55%] group-hover:shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] group-focus-within:-translate-x-0.5 group-focus-within:translate-y-[-55%] group-focus-within:shadow-[3px_3px_0px_0px_rgba(22,21,19,1)] hover:bg-red-500 hover:text-white hover:!translate-x-0 hover:!translate-y-[-40%] hover:shadow-[1px_1px_0px_0px_rgba(22,21,19,1)] active:!translate-x-[2px] active:!translate-y-[-30%] active:shadow-[0px_0px_0px_0px_rgba(22,21,19,1)]"
                    title="Remove Task"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
          </div>

          {/* --- PRIMARY ROUTING TRANSMISSION BUTTON --- */}
          <button 
            type="submit" 
            className="w-full mt-8 py-4 bg-[#4F62F9] text-white font-bold text-sm tracking-widest uppercase border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-150 ease-out"
          >
            SIGN IN
          </button>
          
        </form>
      </div>

    </main>
  );
}
