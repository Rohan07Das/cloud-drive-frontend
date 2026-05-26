"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Imported for internal redirection
import DotGrid from '@/components/DotGrid';
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
  const [messageColor, setMessageColor] = useState<'text-emerald-500' | 'text-red-500' | 'text-amber-500'>('text-emerald-500');

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
        setBotMessage("Beep! Please enter both your ID and password.");
        setMessageColor('text-amber-500');
        messageTimeoutRef.current = setTimeout(() => setBotMessage(null), 4000);
      }, 50);
      return; 
    }

    // 2. SHOW LOADING STATE
    setTimeout(() => {
      setBotMessage("Connecting to secure server...");
      setMessageColor('text-emerald-500');
    }, 50);

    try {
      // 3. SEND REAL CREDENTIALS TO FLASK/FASTAPI (LIVE RENDER URL)
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 4. SUCCESS: STORE TOKEN AND TRANSITION INTERNALLY
        setBotMessage("Access Granted! Teleporting to dashboard...");
        setMessageColor('text-emerald-500');

        // Save the received token securely to localStorage for your dashboard to grab
        localStorage.setItem('cloud_token', data.token);

        setTimeout(() => {
          // Push the route internally to your new Next.js dashboard route (/app/dashboard/page.tsx)
          router.push('/dashboard');
        }, 1500);

      } else {
        // 5. REJECTED LOGIN (Wrong password, etc.)
        setBotMessage(data.error || "Oops! Invalid ID or password.");
        setMessageColor('text-red-500');
        messageTimeoutRef.current = setTimeout(() => setBotMessage(null), 4000);
      }

    } catch (error) {
      // 6. SERVER IS OFFLINE
      setBotMessage("Error: Could not reach the server.");
      setMessageColor('text-red-500');
      messageTimeoutRef.current = setTimeout(() => setBotMessage(null), 4000);
    }
  };

  return (
    <main className={`relative flex min-h-screen items-center justify-center bg-[#ffffff] overflow-hidden antialiased ${spaceGrotesk.className}`}>
      
      <style>{`
        @keyframes slidePop {
          0% { opacity: 0; transform: translateY(15px) scale(0.9); }
          70% { transform: translateY(-2px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-pop {
          animation: slidePop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: bottom left;
        }
      `}</style>

      {/* --- THE BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={2.5}
          gap={18}
          baseColor="#0de4b9"
          activeColor="#000000"
          proximity={70}
          shockRadius={200}
          shockStrength={7}
          resistance={650}
          returnDuration={1.7}
        />
      </div>

      {/* --- THE LOGIN OVERLAY --- */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4">
        
        <form 
          onSubmit={handleLogin}
          noValidate 
          className="w-full max-w-[420px] p-10 rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] pointer-events-auto flex flex-col relative"
        >
          
          {/* --- THE CHARACTER & SPEECH BUBBLE --- */}
          <div className="relative flex justify-center mb-6 mt-4">
            
            {botMessage && (
              <div className="absolute -top-9 -right-2 sm:-right-0 bg-white border-2 border-slate-100 shadow-xl rounded-2xl px-4 py-2.5 z-20 w-max max-w-[160px] text-center animate-slide-pop">
                <p className={`text-xs font-bold leading-tight ${messageColor}`}>
                  {botMessage}
                </p>
                <div className="absolute bottom-[-6px] left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-slate-100 transform rotate-45"></div>
              </div>
            )}

            <div className="relative w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 shadow-inner overflow-hidden group">
              <div className="absolute bottom-[-10px] w-14 h-12 bg-[#0de4b9] rounded-t-2xl transition-transform duration-300 group-hover:translate-y-[-5px]"></div>
              
              <div className="absolute top-8 flex space-x-3">
                <div className="w-2.5 h-3 bg-slate-800 rounded-full animate-bounce" style={{ animationDuration: '2s' }}></div>
                <div className="w-2.5 h-3 bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '2s' }}></div>
              </div>
              
              <div className="absolute top-2 w-2.5 h-2.5 bg-[#0de4b9] rounded-full shadow-[0_0_8px_#0de4b9] animate-pulse"></div>
              <div className="absolute top-4 w-0.5 h-3 bg-slate-300"></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 text-center tracking-tighter mb-8 uppercase">
            Welcome Back
          </h1>

          <div className="space-y-5">
            <div className="relative">
              <label className="sr-only" htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                suppressHydrationWarning
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0de4b9] focus:bg-white transition-all font-medium text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div className="relative">
              <label className="sr-only" htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                suppressHydrationWarning
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0de4b9] focus:bg-white transition-all font-medium text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-6 font-medium tracking-wide">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-800 transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded bg-white border-slate-300 text-[#0de4b9] focus:ring-0 focus:ring-offset-0 cursor-pointer" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-slate-500 hover:text-[#0de4b9] transition-colors">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="w-full mt-8 py-4 bg-[#0de4b9] hover:bg-[#0bc29d] text-white font-bold text-base tracking-[0.15em] uppercase rounded-xl transition-all duration-300 shadow-[0_8px_20px_rgba(13,228,185,0.25)] hover:shadow-[0_12px_25px_rgba(13,228,185,0.4)] hover:-translate-y-1"
          >
            Sign In
          </button>
          
          <p className="text-center text-xs text-slate-500 mt-8 font-medium">
            Don't have an account?{' '}
            <a href="#" className="text-[#0de4b9] hover:text-[#0bc29d] transition-colors font-bold tracking-wider uppercase">Register</a>
          </p>
          
        </form>
      </div>

    </main>
  );
}