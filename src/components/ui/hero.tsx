import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

// --- Custom SVG Components for Hand-Drawn Accents & Stationery Items ---

const BooksIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className}>
    {/* Bottom Book */}
    <rect x="10" y="44" width="44" height="10" rx="3" fill="#FF5E62" stroke="#FFFFFF" strokeWidth="2.5" />
    <path d="M10 44H16V54H10z" fill="#D9383C" />
    <line x1="20" y1="49" x2="48" y2="49" stroke="#FFEAEA" strokeWidth="2" strokeLinecap="round" />
    {/* Middle Book */}
    <rect x="14" y="32" width="38" height="10" rx="3" fill="#FFD166" stroke="#FFFFFF" strokeWidth="2.5" />
    <path d="M14 32H19V42H14z" fill="#E5B834" />
    <line x1="23" y1="37" x2="46" y2="37" stroke="#FFF7D6" strokeWidth="2" strokeLinecap="round" />
    {/* Top Book */}
    <rect x="12" y="20" width="40" height="10" rx="3" fill="#06D6A0" stroke="#FFFFFF" strokeWidth="2.5" />
    <path d="M12 20H17V30H12z" fill="#059E75" />
    <line x1="22" y1="25" x2="46" y2="25" stroke="#E0FFF7" strokeWidth="2" strokeLinecap="round" />
    {/* Bookmark Ribbon */}
    <path d="M38 14V26L41 23L44 26V14" fill="#118AB2" stroke="#FFFFFF" strokeWidth="1.5" />
  </svg>
);

const PapersIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className}>
    {/* Back Sheet */}
    <rect x="18" y="8" width="32" height="42" rx="3" fill="#E2E8F0" stroke="#FFFFFF" strokeWidth="2" transform="rotate(8 34 29)" />
    {/* Front Sheet */}
    <rect x="14" y="12" width="34" height="44" rx="3" fill="#FFFFFF" stroke="#0038FF" strokeWidth="2.5" />
    {/* Lines on front sheet */}
    <line x1="20" y1="22" x2="34" y2="22" stroke="#0038FF" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="28" x2="42" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="34" x2="42" y2="34" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="40" x2="38" y2="40" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="46" x2="30" y2="46" stroke="#CCFF00" strokeWidth="3" strokeLinecap="round" />
    {/* Paperclip */}
    <path d="M36 8V20C36 22 39 22 39 20V11C39 9.5 37 9.5 37 11V18" stroke="#FF5E62" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pencil Accent */}
    <g transform="translate(38, 30) rotate(35)">
      <rect x="0" y="0" width="7" height="22" rx="1.5" fill="#FFD166" stroke="#000" strokeWidth="1.5" />
      <polygon points="0,22 7,22 3.5,28" fill="#F4A261" stroke="#000" strokeWidth="1.5" />
      <polygon points="2,25 5,25 3.5,28" fill="#264653" />
      <rect x="0" y="0" width="7" height="5" fill="#FF6B6B" stroke="#000" strokeWidth="1.5" />
    </g>
  </svg>
);

const ApronIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className}>
    {/* Neck strap */}
    <path d="M24 16C24 10 40 10 40 16" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
    {/* Apron body */}
    <path d="M23 16H41L45 28C45 30 48 31 50 31H51V52C51 55 48 57 45 57H19C16 57 13 55 13 52V31H14C16 31 19 30 19 28L23 16Z" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Waist straps */}
    <path d="M13 33H8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M51 33H56" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    {/* Big front pocket */}
    <rect x="22" y="37" width="20" height="15" rx="3" fill="#334155" stroke="#CCFF00" strokeWidth="2" />
    <line x1="32" y1="37" x2="32" y2="52" stroke="#CCFF00" strokeWidth="1.5" strokeDasharray="2 2" />
    {/* Pens sticking out of chest pocket */}
    <rect x="26" y="24" width="12" height="8" rx="1.5" fill="#334155" stroke="#FFFFFF" strokeWidth="1.5" />
    <line x1="29" y1="18" x2="29" y2="24" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="34" y1="16" x2="34" y2="24" stroke="#FF5E62" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const NotebookMiniIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <rect x="6" y="4" width="20" height="24" rx="3" fill="#0038FF" stroke="#FFFFFF" strokeWidth="2" />
    <rect x="6" y="4" width="4" height="24" fill="#CCFF00" />
    <line x1="14" y1="10" x2="22" y2="10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="15" x2="22" y2="15" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="20" x2="19" y2="20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowGreenLeft = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#CCFF00] stroke-current overflow-visible" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

const ArrowGreenRight = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#CCFF00] stroke-current overflow-visible" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

const ArrowBlack1 = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-black stroke-current overflow-visible" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

const ArrowBlack2 = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-black stroke-current overflow-visible" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

const CircularBadge = () => (
  <div className="relative w-20 h-20 sm:w-26 sm:h-26 md:w-32 md:h-32 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer border-[2px] sm:border-[2.5px] border-black/10">
    <div className="absolute inset-0.5 animate-[spin_12s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path id="circlePath" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="none" />
        <text className="text-[9px] sm:text-[9.5px] font-black tracking-[0.16em] uppercase" fill="black">
          <textPath href="#circlePath" startOffset="0%">
            .ORDER • .PAY • .COLLECT • .ORDER • .PAY • .COLLECT •
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-black stroke-current overflow-visible" fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);

// --- Background Vector Illustrations & Animations Behind Glassmorphic Plates ---

const TechRadarRings = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 400 400" fill="none" className={className}>
    <circle cx="200" cy="200" r="190" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="6 8" opacity="0.18" />
    <circle cx="200" cy="200" r="140" stroke="#CCFF00" strokeWidth="1.5" strokeDasharray="5 7" opacity="0.3" />
    <circle cx="200" cy="200" r="90" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.25" />
    <circle cx="200" cy="200" r="40" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.35" />
    <line x1="10" y1="200" x2="390" y2="200" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" />
    <line x1="200" y1="10" x2="200" y2="390" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" />
    <rect x="194" y="194" width="12" height="12" fill="#CCFF00" opacity="0.5" />
    <circle cx="200" cy="60" r="4" fill="#00F0FF" opacity="0.6" />
    <circle cx="340" cy="200" r="5" fill="#CCFF00" opacity="0.7" />
    <circle cx="200" cy="340" r="4" fill="#FF5E62" opacity="0.6" />
    <circle cx="60" cy="200" r="4" fill="#CCFF00" opacity="0.6" />
  </svg>
);

const FloatingBlueprintCAD = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className}>
    <path d="M30 45 L90 15 L150 45 L90 75 Z" stroke="#CCFF00" strokeWidth="2" opacity="0.4" fill="none" />
    <path d="M30 45 L30 120 L90 150 L90 75 Z" stroke="#00F0FF" strokeWidth="1.5" opacity="0.3" fill="none" />
    <path d="M150 45 L150 120 L90 150 L90 75 Z" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.25" fill="none" />
    <line x1="60" y1="30" x2="60" y2="105" stroke="#CCFF00" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
    <line x1="120" y1="30" x2="120" y2="105" stroke="#00F0FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
    <path d="M90 35 L90 90 M90 90 L65 140 M90 90 L115 140" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
    <circle cx="90" cy="35" r="6" stroke="#CCFF00" strokeWidth="2" opacity="0.6" fill="#0038FF" />
  </svg>
);

const FloatingPrintSheet = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 120 140" fill="none" className={className}>
    <rect x="15" y="15" width="90" height="110" rx="6" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.25" />
    <line x1="28" y1="35" x2="92" y2="35" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    <line x1="28" y1="50" x2="80" y2="50" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <line x1="28" y1="65" x2="92" y2="65" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <line x1="28" y1="80" x2="70" y2="80" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <circle cx="78" cy="100" r="8" stroke="#CCFF00" strokeWidth="1.5" opacity="0.5" />
    <polyline points="75 100 78 103 83 97" stroke="#CCFF00" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const OrigamiPaperPlane = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <polygon points="10,50 90,15 60,85 45,55" stroke="#CCFF00" strokeWidth="2" fill="#CCFF00" fillOpacity="0.15" strokeLinejoin="round" />
    <polygon points="45,55 90,15 45,75" stroke="#FFFFFF" strokeWidth="1.5" fill="#FFFFFF" fillOpacity="0.2" strokeLinejoin="round" />
    <line x1="45" y1="75" x2="52" y2="62" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 68 Q 22 62 38 72" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" strokeLinecap="round" />
  </svg>
);

const SparkleStar = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path d="M16 0 C16 9 23 16 32 16 C23 16 16 23 16 32 C16 23 9 16 0 16 C9 16 16 9 16 0 Z" fill="#CCFF00" opacity="0.7" />
  </svg>
);

interface HeroComponentProps {
  onNavigate?: (page: string) => void;
  onOpenAuthModal?: (role?: 'student' | 'staff', mode?: 'signin' | 'signup') => void;
}

export const Component: React.FC<HeroComponentProps> = ({ onNavigate, onOpenAuthModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthClick = (role: 'student' | 'staff' = 'student', mode: 'signin' | 'signup' = 'signin') => {
    setMobileMenuOpen(false);
    if (onOpenAuthModal) {
      onOpenAuthModal(role, mode);
    } else {
      handleNav('student-login');
    }
  };

  const navItems = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Services & Pricing' },
    { id: 'features', label: 'Features' },
    { id: 'shop-portal', label: 'Shop Owner Portal' },
  ];

  return (
    <div className="min-h-screen bg-[#0038FF] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-hidden w-full">

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      {/* Dynamic Animated Visual Background Layer (Refracts through 70% Glassmorphic Plates) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

        {/* Ambient Glowing Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.25, 0.95, 1],
            opacity: [0.35, 0.55, 0.35]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#CCFF00]/40 to-[#00F0FF]/30 blur-[90px]"
        />

        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -40, 0],
            scale: [1, 1.3, 0.9, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-[25%] right-[5%] w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-[#7B61FF]/50 via-[#00F0FF]/30 to-[#CCFF00]/30 blur-[100px]"
        />

        <motion.div
          animate={{
            x: [0, 40, -50, 0],
            y: [0, -30, 50, 0],
            scale: [0.9, 1.2, 1, 0.9],
            opacity: [0.25, 0.45, 0.25]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00F0FF]/40 via-[#CCFF00]/25 to-[#001A99]/40 blur-[110px]"
        />

        {/* Animated Tech Radar Behind Upper-Right Header & Cards */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-16 right-[-5%] md:right-[5%] w-72 h-72 md:w-[420px] md:h-[420px] opacity-60"
        >
          <TechRadarRings />
        </motion.div>

        {/* Floating Blueprint CAD Wireframe behind left hero & #CAMPUS */}
        <motion.div
          animate={{
            y: [0, -22, 0],
            rotate: [-6, 6, -6],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] left-[2%] md:left-[8%] w-36 h-36 md:w-52 md:h-52 opacity-75"
        >
          <FloatingBlueprintCAD />
        </motion.div>

        {/* Floating Animated Print Sheet behind SkipQ typography */}
        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            rotate: [8, -8, 8]
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[38%] left-[28%] md:left-[35%] w-28 h-36 md:w-40 md:h-48 opacity-65"
        >
          <FloatingPrintSheet />
        </motion.div>

        {/* Origami Paper Plane Gliding Path */}
        <motion.div
          animate={{
            x: [-80, 400, 900],
            y: [120, 60, -40],
            rotate: [15, 8, -5],
            opacity: [0, 0.85, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[12%] left-[10%] w-20 h-20 md:w-28 md:h-28"
        >
          <OrigamiPaperPlane />
        </motion.div>

        {/* Sparkle Stars Twinkling */}
        <motion.div
          animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.3, 1, 0.3], rotate: [0, 90, 180] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[22%] right-[28%] w-6 h-6 md:w-8 md:h-8"
        >
          <SparkleStar />
        </motion.div>

        <motion.div
          animate={{ scale: [1.3, 0.5, 1.3], opacity: [0.9, 0.2, 0.9], rotate: [45, 135, 225] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[40%] left-[18%] w-5 h-5 md:w-7 md:h-7"
        >
          <SparkleStar />
        </motion.div>

        <motion.div
          animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute top-[60%] right-[15%] w-4 h-4 md:w-6 md:h-6"
        >
          <SparkleStar />
        </motion.div>

        {/* Laser / Grid Horizontal Scan Beam */}
        <motion.div
          animate={{
            y: [-100, 800],
            opacity: [0, 0.35, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent shadow-[0_0_15px_#CCFF00]"
        />

      </div>

      {/* Navbar */}
      <nav className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 md:px-10 md:py-8 max-w-[1440px] mx-auto w-full">
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('home')}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3 py-1.5 rounded-2xl rounded-bl-sm relative shadow-md flex items-center gap-0.5 group-hover:scale-105 transition-transform">
            <span>Skip</span>
            <span className="text-[#0038FF]">Q</span>
            <div className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
          </div>
          <div className="bg-[#CCFF00] text-black font-black text-[10px] md:text-xs px-2.5 py-1 rounded-full border-[1.5px] border-white shadow-sm tracking-wide">
            CAMPUS
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold hover:bg-white/15 hover:border-white/60 transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Primary CTA Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAuthClick('student', 'signin')}
            className="px-4 sm:px-5 md:px-6 py-1.5 md:py-2 rounded-full bg-white text-[#0038FF] text-xs md:text-sm font-bold shadow-md hover:bg-[#CCFF00] hover:text-black transition-all duration-200"
          >
            Sign In / Sign Up
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-30 bg-[#002bd4]/95 backdrop-blur-xl border-b border-white/20 px-6 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleAuthClick('student', 'signin')}
            className="w-full text-center mt-2 py-2.5 rounded-xl bg-[#CCFF00] text-black font-bold text-sm shadow-md hover:bg-white transition-colors"
          >
            Sign In / Sign Up
          </button>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-1 relative z-10 pt-4 sm:pt-8 pb-24 sm:pb-32 md:pt-12 md:pb-48 px-3 sm:px-6 md:px-10 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto overflow-x-clip">

        {/* Massive Typography & Elements Container */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-2 sm:mt-4 mb-12 sm:mb-16">

          {/* Text Stack */}
          <div className="relative inline-flex flex-col items-start mx-auto z-10 space-y-0.5 sm:space-y-1 md:space-y-2">

            {/* #CAMPUS & Arrow */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-6 relative z-30 -ml-[0.35em] sm:-ml-[0.5em] md:-ml-[0.62em]">
              <h1
                className="text-[clamp(1.75rem,7vw,110px)] font-black leading-[0.9] tracking-tight text-[#CCFF00] m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99'
                }}
              >
                <span>#</span><span>CAMPUS</span>
              </h1>
              <div className="w-8 h-8 sm:w-16 sm:h-16 md:w-28 md:h-28 -mt-1 md:-mt-2">
                <ArrowGreenRight />
              </div>
            </div>

            {/* SkipQ */}
            <div className="relative z-20 transform -rotate-2 origin-left transition-transform duration-300 hover:-rotate-1">
              {/* Arrow Left of 'S' in SkipQ */}
              <div className="absolute -left-6 sm:-left-12 md:-left-24 -bottom-1 sm:-bottom-2 md:-bottom-2 w-8 h-8 sm:w-18 sm:h-18 md:w-32 md:h-32 pointer-events-none z-30">
                <ArrowGreenLeft />
              </div>

              {/* Floating Glass Frame Below 'IP' in SkipQ - 90% Transparency & Compact Size */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [-4, -1, -4] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[54%] sm:top-[60%] md:top-[65%] left-[44%] sm:left-[47%] md:left-[49%] z-0 pointer-events-auto"
              >
                <div className="w-20 sm:w-28 md:w-36 aspect-[3/3.2] bg-white/10 hover:bg-white/15 backdrop-blur-[3px] border border-white/40 border-t-white/60 border-l-white/50 rounded-[1.1rem] sm:rounded-[1.4rem] md:rounded-[1.75rem] p-2 sm:p-3 md:p-3.5 flex flex-col items-center justify-center shadow-[0_8px_24px_0_rgba(0,0,0,0.2),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:rotate-0 transition-all duration-500">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-[1px] rounded-full flex items-center justify-center mb-1 sm:mb-2 shadow-inner border-[1.5px] border-white/40 p-1 sm:p-1.5">
                    <BooksIcon className="w-full h-full drop-shadow opacity-90" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-[9px] sm:text-[11px] md:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">books.eth</p>
                    <p className="text-[7px] sm:text-[8px] md:text-[10px] text-white/95 font-bold mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">142 890 notes</p>
                  </div>
                </div>
              </motion.div>

              <h1
                className="relative z-10 text-[clamp(3.8rem,16vw,290px)] font-black leading-[0.82] tracking-tighter text-white m-0 p-0 uppercase"
                style={{
                  fontFamily: '"Arial Black", Impact, sans-serif',
                  textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99, 15px 15px 0 #001A99, 16px 16px 0 #001A99'
                }}
              >
                SkipQ
              </h1>
            </div>

          </div>

          {/* Absolute Overlays (Cards, Arrows, Badge) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">

            {/* Floating Glass Card 1 (Bottom Left) - 90% Transparency & Compact Size Framing 'S' */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-[4%] left-[-2%] sm:left-[0%] md:left-[2%] z-30 pointer-events-auto"
            >
              <div className="w-20 sm:w-28 md:w-36 aspect-[3/3.5] bg-white/10 hover:bg-white/15 backdrop-blur-[3px] border border-white/40 border-t-white/60 border-l-white/50 rounded-[1.1rem] sm:rounded-[1.4rem] md:rounded-[1.75rem] p-2 sm:p-3 md:p-3.5 flex flex-col items-center justify-center rotate-[-12deg] shadow-[0_8px_24px_0_rgba(0,0,0,0.2),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:rotate-0 transition-all duration-500">
                <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-[1px] rounded-full flex items-center justify-center mb-1 sm:mb-2 shadow-inner border-[1.5px] border-white/40 p-1 sm:p-1.5">
                  <ApronIcon className="w-full h-full drop-shadow opacity-90" />
                </div>
                <div className="text-center mt-0.5">
                  <p className="font-black text-[9px] sm:text-[11px] md:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">apron.eth</p>
                  <p className="text-[7px] sm:text-[8px] md:text-[10px] text-white/95 font-bold mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">23 422 points</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Glass Card 2 (Top Right) - 90% Transparency & Compact Size Framing 'Q' */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[4%] sm:top-[6%] md:top-[8%] right-[-2%] sm:right-[0%] md:right-[3%] z-30 pointer-events-auto"
            >
              <div className="w-20 sm:w-28 md:w-36 aspect-[3/3.5] bg-white/10 hover:bg-white/15 backdrop-blur-[3px] border border-white/40 border-t-white/60 border-l-white/50 rounded-[1.1rem] sm:rounded-[1.4rem] md:rounded-[1.75rem] p-2 sm:p-3 md:p-3.5 flex flex-col items-center justify-center rotate-[12deg] shadow-[0_8px_24px_0_rgba(0,0,0,0.2),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:rotate-0 transition-all duration-500">
                <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-[1px] rounded-full flex items-center justify-center mb-1 sm:mb-2 shadow-inner border-[1.5px] border-white/40 p-1 sm:p-1.5">
                  <PapersIcon className="w-full h-full drop-shadow opacity-90" />
                </div>
                <div className="text-center mt-0.5">
                  <p className="font-black text-[9px] sm:text-[11px] md:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">papers.eth</p>
                  <p className="text-[7px] sm:text-[8px] md:text-[10px] text-white/95 font-bold mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">293 582 points</p>
                </div>
              </div>
            </motion.div>

            {/* Circular Badge */}
            <div className="absolute bottom-[-8%] sm:bottom-[-9%] md:bottom-[-10%] right-[0%] sm:right-[3%] md:right-[12%] z-40 pointer-events-auto">
              <CircularBadge />
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Features Section - Solid White Background (Not Glassmorphism) with Scroll Transitions */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white text-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] px-6 py-12 md:px-10 md:py-16 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-auto w-full scroll-mt-6"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            onClick={() => handleAuthClick('student', 'signin')}
            className="bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-[2rem] p-8 flex flex-col items-center text-center relative min-h-[17rem] border border-gray-100 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1"
          >
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black text-black">
              UPLOAD &<br/>CUSTOMIZE
            </h3>
            <p className="text-[10px] md:text-xs text-gray-600 font-bold mb-auto max-w-[240px]">
              Select print settings, add documents, or pick stationery items.
            </p>

            {/* Pill Graphic */}
            <div className="relative w-full flex justify-center mt-6">
              <div className="flex items-center bg-[#0038FF] rounded-2xl p-2 pr-16 text-white shadow-lg relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-full mr-3 border border-white/30 p-1 flex items-center justify-center flex-shrink-0">
                  <NotebookMiniIcon className="w-full h-full" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold leading-none">Document</p>
                  <p className="text-[8px] text-white/70 leading-none mt-1">Uploaded • Ready</p>
                </div>
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#CCFF00] text-black font-black text-[10px] px-3 py-2 rounded-xl z-20 shadow-md whitespace-nowrap">
                Cart Updated
              </div>
            </div>

            {/* Arrow pointing to next card */}
            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
              <ArrowBlack1 />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            onClick={() => handleNav('how-it-works')}
            className="bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-[2rem] p-8 flex flex-col items-center text-center relative min-h-[17rem] border border-gray-100 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1"
          >
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black text-black">
              PAY & GET<br/>TOKEN
            </h3>
            <p className="text-[10px] md:text-xs text-gray-600 font-bold mb-auto max-w-[240px]">
              Pay digitally or split costs with group members instantly.
            </p>

            {/* Pill Graphic */}
            <div className="relative w-full flex justify-center mt-6">
              <div className="flex items-center bg-[#0038FF] rounded-full p-1.5 text-white shadow-lg">
                <div className="bg-white text-[#0038FF] font-black text-sm px-4 py-2 rounded-full mr-2">
                  #1042
                </div>
                <div className="font-bold text-xs px-3">
                  Token
                </div>
              </div>

              {/* Floating green badge */}
              <div className="absolute -bottom-5 right-2 sm:right-6 bg-[#CCFF00] text-black font-black text-[9px] px-3 py-1.5 rounded-full shadow-lg transform rotate-6 z-20 flex items-center gap-1 border border-black/10">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-black stroke-current" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Payment Verified
              </div>
            </div>

            {/* Arrow pointing to next card */}
            <div className="hidden md:block absolute -right-12 bottom-8 w-16 h-16 z-30">
              <ArrowBlack2 />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            onClick={() => handleNav('shop-portal')}
            className="bg-[#F8F9FA] hover:bg-[#F0F2F5] rounded-[2rem] p-8 flex flex-col items-center text-center relative min-h-[17rem] border border-gray-100 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_35px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1"
          >
            <h3 className="text-xl md:text-2xl uppercase leading-tight mb-2 font-black text-black">
              SKIP QUEUE &<br/>PICKUP
            </h3>
            <p className="text-[10px] md:text-xs text-gray-600 font-bold mb-auto max-w-[240px]">
              Track order status in real-time and collect when ready.
            </p>

            {/* Pill Graphic */}
            <div className="flex flex-col items-center bg-[#CCFF00] rounded-[2rem] px-6 py-4 text-black shadow-lg mt-6 relative w-full max-w-[220px]">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-75">Status</p>
              <p className="text-base md:text-lg font-black leading-tight">Ready for Pickup</p>

              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 left-8 w-5 h-5 bg-[#CCFF00] transform rotate-45"></div>
            </div>
          </motion.div>

        </div>
      </motion.section>

    </div>
  );
};
