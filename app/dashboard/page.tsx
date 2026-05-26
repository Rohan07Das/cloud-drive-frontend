"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';
import StaggeredMenu from '@/components/StaggeredMenu'; // Ensure the path correctly points to the file above

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
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

const SUPABASE_URL = "https://kfjhespnobypmizhpszd.supabase.co";
const API_URL = "http://127.0.0.1:5000"; // Local target link

export default function Dashboard() {
  const router = useRouter();
  
  // App Core States
  const [files, setFiles] = useState<any[]>([]);
  const [recycleFiles, setRecycleFiles] = useState<any[]>([]);
  const [view, setView] = useState<'grid' | 'row'>('grid');
  const [cardSize, setCardSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeFilter, setActiveFilter] = useState<'all' | 'essentials' | 'articles' | 'new'>('all');
  
  // ─── FOLDERS SYSTEM ───
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showFolders, setShowFolders] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Processing Tracks
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadText, setUploadText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  
  // Modals & Feedback
  const [toastMsg, setToastMsg] = useState('');
  const [preview, setPreview] = useState<{ url: string, name: string, type: string } | null>(null);
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [username, setUsername] = useState('Guest');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('cloud_token');
    if (!token) {
      router.push('/'); 
      return;
    }
    loadFiles();
    loadFolders();
    updateBinBadge();
    document.documentElement.setAttribute('data-theme', 'light');
    const savedUsername = localStorage.getItem('cloud_username');
    if (savedUsername) {
    setUsername(savedUsername);
    }
  }, [router, currentFolder]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('cloud_token')}`
  });

  const logout = () => {
    localStorage.removeItem('cloud_token');
    router.push('/');
  };

  const loadFiles = async () => {
  try {

    let url = `${API_URL}/files`;

    // IF INSIDE FOLDER
    if (currentFolder) {
      url = `${API_URL}/folder-files/${currentFolder}`;
    }

    const r = await fetch(url, {
      headers: getAuthHeaders()
    });

    if (r.status === 401) {
      return logout();
    }

    const data = await r.json();

    setFiles(Array.isArray(data) ? data : []);

  } catch (err) {
    console.log(err);
    setFiles([]);
  }
};

  const loadFolders = async () => {
    try {
      const r = await fetch(`${API_URL}/folders`, { headers: getAuthHeaders() });
      if (r.status === 401) return logout();
      const data = await r.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch {
      setFolders([]);
    }
  };

  const updateBinBadge = async () => {
    try {
      const r = await fetch(`${API_URL}/recycle`, { headers: getAuthHeaders() });
      if (r.status === 401) return;
      const data = await r.json();
      setRecycleFiles(data);
    } catch {}
  };

  const uploadFile = async () => {
    if (!fileInputRef.current?.files?.length) {
      showToast("Choose an object to deploy first.");
      return;
    }
    const file = fileInputRef.current.files[0];
    const fd = new FormData();
    fd.append('file', file);

if (currentFolder) {
  fd.append('folder', currentFolder);
}
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadText('Uploading Assets...');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/upload`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('cloud_token')}`);
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    
    xhr.onload = function() {
      if (xhr.status === 401) return logout();
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadText('Success!');
        setTimeout(() => {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setSelectedFileName('');
          showToast('Object appended securely');
          loadFiles();
        }, 1000);
      } else {
        setIsUploading(false);
        showToast('Upload fault error');
      }
    };
    xhr.send(fd);
  };

  const deleteFile = async (name: string) => {

  try {

    let url = `${API_URL}/delete/${name}`;

    // IF INSIDE FOLDER
    if (currentFolder) {
      url = `${API_URL}/delete-folder-file/${currentFolder}/${name}`;
    }

    const r = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (r.status === 401) {
      return logout();
    }

    showToast('Archived smoothly');

    loadFiles();

    updateBinBadge();

  } catch {

    showToast('Action failed');

  }
};

  const downloadFile = async (
  name: string,
  totalBytes: number
) => {

  try {

    setIsUploading(true);

    setUploadProgress(0);

    setUploadText('Fetching download array...');

    let url = `${API_URL}/download/${name}`;

    // IF INSIDE FOLDER
    if (currentFolder) {
      url = `${API_URL}/download-folder-file/${currentFolder}/${name}`;
    }

    const r = await fetch(url, {
      headers: getAuthHeaders()
    });

    if (r.status === 401) {
      return logout();
    }

    const d = await r.json();

    const response = await fetch(d.download_url);

    if (!response.ok || !response.body) {
      throw new Error('Data drop fail');
    }

    const reader = response.body.getReader();

    let receivedLength = 0;

    const chunks = [];

    while (true) {

      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);

      receivedLength += value.length;

      if (totalBytes > 0) {
        setUploadProgress(
          Math.min(
            Math.round((receivedLength / totalBytes) * 100),
            100
          )
        );
      }
    }

    const blob = new Blob(chunks);

    setUploadText('Completed!');

    setTimeout(() => setIsUploading(false), 1000);

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.style.display = 'none';

    a.href = blobUrl;

    a.download = name;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    window.URL.revokeObjectURL(blobUrl);

  } catch {

    setIsUploading(false);

    showToast('Download failure');

  }
};

  const openPreview = (
  name: string,
  folder?: string
) => {

  const url = folder
    ? `${SUPABASE_URL}/storage/v1/object/public/files/folders/${folder}/${name}`
    : `${SUPABASE_URL}/storage/v1/object/public/files/files/${name}`;

  const ext = name.split('.').pop()?.toLowerCase() || '';

  const type =
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)
      ? 'image'
      : ['mp4', 'webm', 'ogg', 'mov'].includes(ext)
      ? 'video'
      : ext === 'pdf'
      ? 'pdf'
      : 'unsupported';

  setPreview({
    url,
    name,
    type
  });
};
  
  // ─── CREATE FOLDER ───
const createFolder = () => {
  if (!newFolderName.trim()) {
    showToast('Folder name required');
    return;
  }

  const folderObj = {
    id: Date.now(),
    name: newFolderName,
  };

  setFolders((prev) => [...prev, folderObj]);

  setNewFolderName('');
  showToast('Folder created');
};

// ─── OPEN FOLDER ───
const openFolder = (folderName: string) => {
  setCurrentFolder(folderName);
  setShowFolders(false);
};

// ─── BACK TO ROOT ───
const goBackHome = () => {
  setCurrentFolder(null);
};

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
      scratchWallN: [[0, 0], [-1, 0]], scratchWallS: [[-7, -1], [-6, -2]],
      scratchWallE: [[-2, -2], [-2, -3]], scratchWallW: [[-4, 0], [-4, -1]],
      tired: [[-3, -2]], sleeping: [[-2, 0], [-2, -1]],
      N: [[-1, -2], [-1, -3]], NE: [[0, -2], [0, -3]], E: [[-3, 0], [-3, -1]], SE: [[-5, -1], [-5, -2]],
      S: [[-6, -3], [-7, -2]], SW: [[-5, -3], [-6, -1]], W: [[-4, -2], [-4, -3]], NW: [[-1, -1], [-1, 0]],
    };

    const handleMove = (e: MouseEvent) => { mX = e.clientX; mY = e.clientY; };
    document.addEventListener("mousemove", handleMove);

    let lastTime = 0;
    const loop = (ts: number) => {
      if (ts - lastTime > 100) {
        lastTime = ts;
        fCount++;
        const dX = nX - mX + 16, dY = nY - mY + 16, dist = Math.sqrt(dX * dX + dY * dY);

        if (dist < speed || dist < 48) {
          iTime++;
          if (iTime > 10 && Math.floor(Math.random() * 200) === 0 && !iAnim) {
            iAnim = ["sleeping", "scratchSelf"][Math.floor(Math.random() * 2)];
          }
          if (iAnim === "sleeping") {
            const animName = iFrame < 8 ? "tired" : "sleeping";
            const sp = sprites[animName][Math.floor(iFrame / 4) % sprites[animName].length];
            el.style.backgroundPosition = `${sp[0] * 32}px ${sp[1] * 32}px`;
            if (iFrame > 192) { iAnim = null; iFrame = 0; }
          } else if (iAnim) {
            const sp = sprites[iAnim][iFrame % sprites[iAnim].length];
            el.style.backgroundPosition = `${sp[0] * 32}px ${sp[1] * 32}px`;
            if (iFrame > 9) { iAnim = null; iFrame = 0; }
          } else {
            el.style.backgroundPosition = `${sprites.idle[0][0] * 32}px ${sprites.idle[0][1] * 32}px`;
          }
          iFrame++;
        } else {
          iAnim = null; iFrame = 0;
          if (iTime > 1) {
            el.style.backgroundPosition = `${sprites.alert[0][0] * 32}px ${sprites.alert[0][1] * 32}px`;
            iTime = Math.max(iTime - 1, 0);
          } else {
            let dir = dY / dist > 0.5 ? "N" : dY / dist < -0.5 ? "S" : "";
            dir += dX / dist > 0.5 ? "W" : dX / dist < -0.5 ? "E" : "";
            const sp = sprites[dir || "idle"][fCount % 2];
            el.style.backgroundPosition = `${sp[0] * 32}px ${sp[1] * 32}px`;
            nX -= (dX / dist) * speed; nY -= (dY / dist) * speed;
            el.style.left = `${nX - 16}px`; el.style.top = `${nY - 16}px`;
          }
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      if (document.body.contains(el)) document.body.removeChild(el);
    };
  }, []);

  // Modern Editorial Bento Color Tones
  const blockBackgrounds = [
    'bg-[#f6f2e8] text-[#111111]',
    'bg-[#cae2db] text-[#111111]',
    'bg-[#ebd2cc] text-[#111111]',
    'bg-[#d2daeb] text-[#111111]',
    'bg-[#f7ebd4] text-[#111111]',
  ];

  const getGridColumns = () => {
    if (cardSize === 'sm') return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6';
    if (cardSize === 'md') return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3';
  };
  const getItemsPerPage = () => {
  // 4 ROWS MAX

  if (view === 'row') {
    return 8;
  }

  // SMALL
  if (cardSize === 'sm') {
    // lg=6 cols → 6 x 4 rows
    return 24;
  }

  // MEDIUM
  if (cardSize === 'md') {
    // lg=4 cols → 4 x 4 rows
    return 16;
  }

  // LARGE
  // lg=3 cols → 3 x 4 rows
  return 12;
};

const itemsPerPage = getItemsPerPage();

const totalPages = Math.ceil(files.length / itemsPerPage);

const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

const paginatedFiles = files.slice(startIndex, endIndex);

  return (
    <div className={`min-h-screen bg-[#f7f5ee] text-[#111111] antialiased flex overflow-hidden ${spaceGrotesk.className}`}>

      {/* ─── ACCOUNT PROFILE DROPDOWN ─── */}
      {/*FLOATING BLUR HEADER LAYER*/}
<div className="fixed top-0 left-0 w-full z-[110]">
  
  {/* BACKDROP BLUR STRIP */}
  <div className="
    absolute inset-0
    h-[40px]
    bg-[#f7f5ee]/55
    backdrop-blur-md
    border-b border-black/5
    shadow-[0_10px_30px_rgba(0,0,0,0.03)]
  " />
<div className="fixed top-1 right-30 z-[120]">
  <div className="relative">
    
    {/* ACCOUNT ICON BUTTON */}
    <button
      onClick={() => setIsAccountOpen(!isAccountOpen)}
      className="w-12 h-7.5 rounded-2xl border-2 border-[#161513] bg-white shadow-[4px_4px_0px_0px_rgba(22,21,19,1)] flex items-center justify-center hover:translate-y-0.5 transition-all"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 stroke-[#161513] fill-none"
        strokeWidth="2.2"
      >
        <path d="M20 21C20 17.134 16.866 14 13 14H11C7.134 14 4 17.134 4 21" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>

    {/* DROPDOWN PANEL */}
    {isAccountOpen && (
      <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-[#161513] rounded-[1.7rem] p-4 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)] animate-fadeIn">
        
        {/* USER INFO */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          
          <div className="w-12 h-12 rounded-2xl bg-[#161513] text-white flex items-center justify-center text-sm font-black uppercase">
            {username.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Account
            </p>

            <h4 className="text-sm font-black text-[#161513] truncate">
              {username}
            </h4>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={logout}
          className="mt-4 w-full py-3 rounded-2xl bg-[#161513] hover:bg-black text-white text-xs font-black uppercase tracking-[0.18em] transition-all shadow-md"
        >
          Logout
        </button>
      </div>
    )}
  </div>
</div>
      {/* ─── STAGGERED MENU COMPONENT ─── */}
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

      {/* ─── STYLES INJECTION BLOCK (ONEKO + HAMSTER RUNNING ENGINE OVERLAYS) ─── */}
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

        /* ─── HAMSTER WHEEL CORE MECHANICAL RENDER FRAMES ─── */
        .wheel-and-hamster {
          --dur: 1s;
          position: relative;
          width: 12em;
          height: 12em;
          font-size: 14px;
        }
        .wheel, .hamster, .hamster div, .spoke {
          position: absolute;
        }
        .wheel, .spoke {
          border-radius: 50%;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .wheel {
          background: radial-gradient(100% 100% at center, hsla(0,0%,60%,0) 47.8%, hsl(0,0%,60%) 48%);
          z-index: 2;
        }
        .hamster {
          animation: hamster var(--dur) ease-in-out infinite;
          top: 50%;
          left: calc(50% - 3.5em);
          width: 7em;
          height: 3.75em;
          transform: rotate(4deg) translate(-0.8em,1.85em);
          transform-origin: 50% 0;
          z-index: 1;
        }
        .hamster__head {
          animation: hamsterHead var(--dur) ease-in-out infinite;
          background: hsl(30,90%,55%);
          border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
          box-shadow: 0 -0.25em 0 hsl(30,90%,80%) inset, 0.75em -1.55em 0 hsl(30,90%,90%) inset;
          top: 0;
          left: -2em;
          width: 2.75em;
          height: 2.5em;
          transform-origin: 100% 50%;
        }
        .hamster__ear {
          animation: hamsterEar var(--dur) ease-in-out infinite;
          background: hsl(0,90%,85%);
          border-radius: 50%;
          box-shadow: -0.25em 0 hsl(30,90%,55%) inset;
          top: -0.25em;
          right: -0.25em;
          width: 0.75em;
          height: 0.75em;
          transform-origin: 50% 75%;
        }
        .hamster__eye {
          animation: hamsterEye var(--dur) linear infinite;
          background-color: hsl(0,0%,0%);
          border-radius: 50%;
          top: 0.375em;
          left: 1.25em;
          width: 0.5em;
          height: 0.5em;
        }
        .hamster__nose {
          background: hsl(0,90%,75%);
          border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
          top: 0.75em;
          left: 0;
          width: 0.2em;
          height: 0.25em;
        }
        .hamster__body {
          animation: hamsterBody var(--dur) ease-in-out infinite;
          background: hsl(30,90%,90%);
          border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
          box-shadow: 0.1em 0.75em 0 hsl(30,90%,55%) inset, 0.15em -0.5em 0 hsl(30,90%,80%) inset;
          top: 0.25em;
          left: 2em;
          width: 4.5em;
          height: 3em;
          transform-origin: 17% 50%;
          transform-style: preserve-3d;
        }
        .hamster__limb--fr, .hamster__limb--fl {
          clip-path: polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);
          top: 2em;
          left: 0.5em;
          width: 1em;
          height: 1.5em;
          transform-origin: 50% 0;
        }
        .hamster__limb--fr {
          animation: hamsterFRLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);
          transform: rotate(15deg) translateZ(-1px);
        }
        .hamster__limb--fl {
          animation: hamsterFLLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);
          transform: rotate(15deg);
        }
        .hamster__limb--br, .hamster__limb--bl {
          border-radius: 0.75em 0.75em 0 0;
          clip-path: polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);
          top: 1em;
          left: 2.8em;
          width: 1.5em;
          height: 2.5em;
          transform-origin: 50% 30%;
        }
        .hamster__limb--br {
          animation: hamsterBRLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);
          transform: rotate(-25deg) translateZ(-1px);
        }
        .hamster__limb--bl {
          animation: hamsterBLLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);
          transform: rotate(-25deg);
        }
        .hamster__tail {
          animation: hamsterTail var(--dur) linear infinite;
          background: hsl(0,90%,85%);
          border-radius: 0.25em 50% 50% 0.25em;
          box-shadow: 0 -0.2em 0 hsl(0,90%,75%) inset;
          top: 1.5em;
          right: -0.5em;
          width: 1em;
          height: 0.5em;
          transform: rotate(30deg) translateZ(-1px);
          transform-origin: 0.25em 0.25em;
        }
        .spoke {
          animation: spoke var(--dur) linear infinite;
          background: radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),
            linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50% / 99% 99% no-repeat;
        }

        /* ─── LOOPER KEYFRAME KEY DATA METRICS ─── */
        @keyframes hamster { from, to { transform: rotate(4deg) translate(-0.8em,1.85em); } 50% { transform: rotate(0) translate(-0.8em,1.85em); } }
        @keyframes hamsterHead { from, 25%, 50%, 75%, to { transform: rotate(0); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(8deg); } }
        @keyframes hamsterEye { from, 90%, to { transform: scaleY(1); } 95% { transform: scaleY(0); } }
        @keyframes hamsterEar { from, 25%, 50%, 75%, to { transform: rotate(0); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(12deg); } }
        @keyframes hamsterBody { from, 25%, 50%, 75%, to { transform: rotate(0); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(-2deg); } }
        @keyframes hamsterFRLimb { from, 25%, 50%, 75%, to { transform: rotate(50deg) translateZ(-1px); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(-30deg) translateZ(-1px); } }
        @keyframes hamsterFLLimb { from, 25%, 50%, 75%, to { transform: rotate(-30deg); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(50deg); } }
        @keyframes hamsterBRLimb { from, 25%, 50%, 75%, to { transform: rotate(-60deg) translateZ(-1px); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(20deg) translateZ(-1px); } }
        @keyframes hamsterBLLimb { from, 25%, 50%, 75%, to { transform: rotate(20deg); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(-60deg); } }
        @keyframes hamsterTail { from, 25%, 50%, 75%, to { transform: rotate(30deg) translateZ(-1px); } 12.5%, 37.5%, 62.5%, 87.5% { transform: rotate(10deg) translateZ(-1px); } }
        @keyframes spoke { from { transform: rotate(0); } to { transform: rotate(-1turn); } }
      `}} />


      {/* ─── DASHBOARD INTERFACE CONTAINER ─── */}
      <main className={`flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] p-6 sm:p-10 md:p-12 pl-6 sm:pl-[40px]`}>
      
        {/* TOP COMPONENT NAVIGATION HEADER BAR */}
        <header className="flex items-center justify-between gap-4 mb-8 bg-[#161513] text-[#f7f5ee] px-8 py-3.5 rounded-2xl border-2 border-[#161513] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            
            <h1 className="text-xl font-black uppercase tracking-tight">Cloud Drive</h1>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-300">
            <span className="hidden sm:inline opacity-60">Secure Vault</span>
            <button onClick={() => setIsRecycleOpen(true)} className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition font-black">
              Archive ({recycleFiles.length})
            </button>
          </div>
        </header>

        {/* CONTROLLER FILTERS RULER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-5xl font-black tracking-tighter mr-4 leading-none text-slate-900">おかえりなさい</h2>
            <button onClick={() => setActiveFilter('all')} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-black bg-black text-white shadow-sm">
              Filter ({files.length})
            </button>
            <button
  onClick={() => {
    setShowFolders(true);
    setCurrentFolder(null);
  }}
  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-slate-200 hover:border-black text-slate-800 transition"
>
  Folders
</button>
            <button className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-slate-200 hover:border-black text-slate-800 transition">Favorites</button>
          </div>

          {/* COMBINED TOGGLE CONTROL GROUP */}
          <div className="flex items-center gap-4">
            
            {/* ─── FIXED UNIFORM SELECTOR CAPSULES FOR S, M, L SIZES ─── */}
            {view === 'grid' && (
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-[10px] font-black tracking-wider uppercase">
                <button 
                  onClick={() => setCardSize('sm')} 
                  className={`w-8 h-8 rounded-lg transition-all font-black text-xs ${cardSize === 'sm' ? 'bg-[#161513] text-white shadow-md' : 'text-slate-500 hover:text-black'}`}
                >
                  S
                </button>
                <button 
                  onClick={() => setCardSize('md')} 
                  className={`w-8 h-8 rounded-lg transition-all font-black text-xs ${cardSize === 'md' ? 'bg-[#161513] text-white shadow-md' : 'text-slate-500 hover:text-black'}`}
                >
                  M
                </button>
                <button 
                  onClick={() => setCardSize('lg')} 
                  className={`w-8 h-8 rounded-lg transition-all font-black text-xs ${cardSize === 'lg' ? 'bg-[#161513] text-white shadow-md' : 'text-slate-500 hover:text-black'}`}
                >
                  L
                </button>
              </div>
            )}

            {/* ─── INTEGRATED VIEW TOGGLES FEATURING ICON GRAPHICS SYMBOLS INSIDE ─── */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setView('grid')} 
                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-[#161513] text-white shadow-md' : 'text-slate-700 hover:bg-neutral-100'}`}
                title="Grid Layout View"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button 
                onClick={() => setView('row')} 
                className={`p-2 rounded-lg transition-all ${view === 'row' ? 'bg-[#161513] text-white shadow-md' : 'text-slate-700 hover:bg-neutral-100'}`}
                title="Row List View"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-currentColor" strokeWidth="2.5">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="4" cy="6" r="1.25" fill="currentColor" />
                  <circle cx="4" cy="12" r="1.25" fill="currentColor" />
                  <circle cx="4" cy="18" r="1.25" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* COMBINED INTERFACES LAYOUT SIDEBAR + GALLERY */}
        {currentFolder && (
  <div className="mb-6 flex items-center gap-3">
    
    <button
      onClick={goBackHome}
      className="px-4 py-2 rounded-xl bg-black text-white text-xs font-black uppercase"
    >
      ← Back
    </button>

    <h3 className="text-2xl font-black tracking-tight">
      📁 {currentFolder}
    </h3>
  </div>
)}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ASSET UPLOAD CONTROL BOX BENTO */}
          <div className="w-full lg:w-[320px] shrink-0 bg-white border-2 border-[#161513] rounded-[2rem] p-6 shadow-[5px_5px_0px_0px_rgba(22,21,19,1)]">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-1.5">Add Assets</h3>
            <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed">Add body text to help your document and onyx black.</p>
            
            <div className="space-y-4">
              <label className="w-full block">
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || '')} />
                <div className="w-full text-center p-4 rounded-xl bg-[#f7f5ee] border border-slate-200 hover:border-black transition text-xs font-black text-slate-800 cursor-pointer truncate">
                  {selectedFileName ? selectedFileName : 'Choose Document'}
                </div>
              </label>

              <button 
                onClick={uploadFile}
                className="w-full py-4 rounded-xl bg-[#161513] hover:bg-black text-white font-black text-xs uppercase tracking-widest transition shadow-md active:translate-y-0.5"
              >
                Upload File
              </button>
            </div>

            {/* ─── DYNAMIC SWITCH: PROGRESS FEEDBACK VS RUNNING HAMSTER LOADER WHEEL ─── */}
            {isUploading && (
              <div className="mt-8 flex flex-col items-center justify-center p-4 bg-[#f7f5ee] border border-slate-200 rounded-2xl tracking-tight text-center animate-fadeIn">
                <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster mx-auto mb-4 scale-75">
                  <div className="wheel" />
                  <div className="hamster">
                    <div className="hamster__body">
                      <div className="hamster__head">
                        <div className="hamster__ear" />
                        <div className="hamster__eye" />
                        <div className="hamster__nose" />
                      </div>
                      <div className="hamster__limb hamster__limb--fr" />
                      <div className="hamster__limb hamster__limb--fl" />
                      <div className="hamster__limb hamster__limb--br" />
                      <div className="hamster__limb hamster__limb--bl" />
                      <div className="hamster__tail" />
                    </div>
                  </div>
                  <div className="spoke" />
                </div>

                <div className="w-full">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1 text-slate-600">
                    <span>{uploadText}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-300">
                    <div className="h-full bg-black transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC ASSETS GALLERY PANEL GRID */}
          <div className="flex-1 w-full">
            {files.length === 0 ? (
              <div className="w-full py-28 bg-white border border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center text-center p-6 shadow-sm">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Objects Found</p>
              </div>
            ) : (
              <div className={view === 'grid' ? `grid ${getGridColumns()} gap-5` : 'flex flex-col gap-4'}>
                {paginatedFiles.map((file, i) => {
                  const currentTheme = blockBackgrounds[i % blockBackgrounds.length];
                  const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.name.split('.').pop()?.toLowerCase());
                 const fileUrl = currentFolder
  ? `${SUPABASE_URL}/storage/v1/object/public/files/folders/${currentFolder}/${file.name}`
  : `${SUPABASE_URL}/storage/v1/object/public/files/files/${file.name}`;

                  return (
                    <div 
                      key={file.name}
                      className={`rounded-[1.8rem] border-2 border-[#161513] overflow-hidden shadow-[4px_4px_0px_0px_rgba(22,21,19,1)] transition-transform hover:-translate-y-0.5 ${currentTheme} ${
                        view === 'row' ? 'flex items-center justify-between p-4 gap-4 w-full' : 'flex flex-col w-full'
                      }`}
                    >
                      {/* FILE PREVIEW ASPECT RATIO BOX */}
                      <div 
                        onClick={() => openPreview(file.name, currentFolder || undefined)}
                        className={`relative cursor-pointer overflow-hidden bg-white/70 ${
                          view === 'row' ? 'w-24 h-16 rounded-2xl border border-slate-300 shrink-0' : 'w-full aspect-[14/10] border-b-2 border-[#161513]'
                        }`}
                      >
                        {isImg ? (
                          <img src={fileUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-white">
                            <span className="text-[20px] font-black text-slate-400/80 leading-none">...</span>
                          </div>
                        )}
                      </div>

                      {/* INFO CARD LAYOUT TEXT */}
                      <div className={`p-4 flex flex-col flex-1 truncate ${view === 'row' ? '!p-0' : ''}`}>
                        <h4 className="text-xs sm:text-sm font-black truncate text-slate-900 mb-0.5 tracking-tight" title={file.name}>
                          {file.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{formatSize(file.size || file.metadata?.size || 0)}</span>
                      </div>

                      {/* CARD CONTROLS ACTION OVERLAY */}
                      <div className={`flex items-center justify-between gap-3 px-4 pb-4 ${view === 'row' ? '!p-0 shrink-0' : ''}`}>
                        <button 
                          onClick={() => downloadFile(file.name, file.size || file.metadata?.size || 0)}
                          className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => deleteFile(file.name)}
                          className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /></svg>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
            {/* PAGINATION */}
{totalPages > 1 && (
  <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
    
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className={`px-4 py-2 rounded-xl border-2 border-[#161513] text-xs font-black uppercase tracking-wider transition ${
        currentPage === 1
          ? 'opacity-40 cursor-not-allowed bg-slate-200'
          : 'bg-white hover:bg-black hover:text-white'
      }`}
    >
      Prev
    </button>

    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`w-10 h-10 rounded-xl border-2 border-[#161513] text-xs font-black transition ${
          currentPage === i + 1
            ? 'bg-[#161513] text-white'
            : 'bg-white hover:bg-black hover:text-white'
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      onClick={() =>
        setCurrentPage((p) => Math.min(p + 1, totalPages))
      }
      disabled={currentPage === totalPages}
      className={`px-4 py-2 rounded-xl border-2 border-[#161513] text-xs font-black uppercase tracking-wider transition ${
        currentPage === totalPages
          ? 'opacity-40 cursor-not-allowed bg-slate-200'
          : 'bg-white hover:bg-black hover:text-white'
      }`}
    >
      Next
    </button>

  </div>
)}
          </div>

        </div>

        {/* BOTTOM PLACEHOLDER SPACE */}
        <div className="mt-16 h-1 w-1 bg-transparent" />

        {/* LIGHTBOX LAYOUT OVERLAY */}
        {preview && (
          <div className="fixed inset-0 bg-[#161513]/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreview(null)}>
            <div className="bg-white p-3 rounded-[2.5rem] border border-black shadow-2xl overflow-hidden max-w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              {preview.type === 'image' && <img src={preview.url} className="max-w-full max-h-[70vh] object-contain rounded-2xl" alt="" />}
              {preview.type === 'video' && <video src={preview.url} controls autoPlay className="max-w-full max-h-[70vh] rounded-2xl" />}
              {preview.type === 'pdf' && <iframe src={preview.url} className="w-[75vw] h-[65vh] rounded-xl" />}
              {preview.type === 'unsupported' && (
                <div className="text-center p-8 bg-[#f7f5ee] rounded-2xl max-w-xs">
                  <h4 className="font-black text-sm mb-1">Preview Unavailable</h4>
                  <p className="text-xs text-slate-500 font-bold">Extensions of this system node type cannot stream inside standard layouts.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECYCLE ARCHIVE DIALOG SHEET BAR */}
        {isRecycleOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setIsRecycleOpen(false)}>
            <div className="w-full max-w-md bg-white border border-black rounded-[2rem] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-4">
                <span className="text-sm font-black uppercase tracking-widest text-slate-800">Archive Log Registry</span>
                <button onClick={() => setIsRecycleOpen(false)} className="text-black font-black text-sm hover:scale-105 transition">✕</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {recycleFiles.length === 0 ? (
                  <div className="text-center py-10 text-xs font-black uppercase tracking-widest text-slate-400">Archive log is empty</div>
                ) : (
                  recycleFiles.map((file) => (
                    <div key={`${file.folder || 'root'}-${file.name}`}className="flex items-center justify-between p-4 rounded-2xl bg-[#f7f5ee] border border-slate-200 shadow-sm">
                      <span className="text-xs font-black text-black truncate pr-4 max-w-[180px]">{file.name}</span>
                      <div className="flex gap-2">
                        <button 
  onClick={async () => {

    const url = file.folder
      ? `${API_URL}/restore-folder-file/${file.folder}/${file.name}`
      : `${API_URL}/restore/${file.name}`;

    await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    showToast('Object restored');

    loadFiles();
    updateBinBadge();

  }}
  className="px-3 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm"
>
  Restore
</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── FOLDERS MODAL ─── */}
{showFolders && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setShowFolders(false)}
  >
    <div
      className="w-full max-w-3xl bg-white border-2 border-[#161513] rounded-[2rem] p-6 shadow-[6px_6px_0px_0px_rgba(22,21,19,1)]"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black tracking-tight">
          Folders
        </h2>

        <button
          onClick={() => setShowFolders(false)}
          className="text-xl font-black"
        >
          ✕
        </button>
      </div>

      {/* CREATE FOLDER */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          className="flex-1 px-4 py-3 rounded-2xl border-2 border-black outline-none font-bold"
        />

        <button
          onClick={createFolder}
          className="px-6 py-3 rounded-2xl bg-black text-white font-black uppercase text-xs"
        >
          Create
        </button>
      </div>

      {/* FOLDERS GRID */}
      {folders.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-black uppercase text-sm tracking-widest">
          No folders created
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {folders.map((folder) => (
            <div
              key={folder.name}
              onClick={() => openFolder(folder.name)}
              className="cursor-pointer bg-[#f7f5ee] border-2 border-[#161513] rounded-[1.7rem] p-5 flex flex-col items-center justify-center hover:-translate-y-1 transition shadow-[4px_4px_0px_0px_rgba(22,21,19,1)]"
            >
              
              {/* FOLDER ICON */}
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 mb-3 fill-[#f4c542] stroke-black"
                strokeWidth="1.8"
              >
                <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              </svg>

              {/* FOLDER NAME */}
              <span className="text-sm font-black text-center break-all">
                {folder.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

        {/* PREMIUM TOAST NOTIFICATION DECK */}
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-[1.5rem] bg-[#f6f2e8] text-[#111111] border-2 border-[#161513] text-sm font-black tracking-tight shadow-[4px_4px_0px_0px_rgba(22,21,19,1)] transition-all duration-300 transform z-50 flex items-center gap-2 ${
          toastMsg ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>
          <span className="w-4 h-4 bg-[#cae2db] border border-black rounded-full flex items-center justify-center text-[10px]">✓</span>
          <span>{toastMsg}</span>
        </div>

      </main>
    </div>
  );
}