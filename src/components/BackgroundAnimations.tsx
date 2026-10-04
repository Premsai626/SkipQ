import React from 'react';
import { motion } from 'motion/react';

// --- Vector Components for Ambient Background Animations ---

export const TechRadarRings = ({ className = "w-full h-full" }: { className?: string }) => (
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

export const FloatingBlueprintCAD = ({ className = "w-full h-full" }: { className?: string }) => (
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

export const FloatingPrintSheet = ({ className = "w-full h-full" }: { className?: string }) => (
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

export const OrigamiPaperPlane = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <polygon points="10,50 90,15 60,85 45,55" stroke="#CCFF00" strokeWidth="2" fill="#CCFF00" fillOpacity="0.15" strokeLinejoin="round" />
    <polygon points="45,55 90,15 45,75" stroke="#FFFFFF" strokeWidth="1.5" fill="#FFFFFF" fillOpacity="0.2" strokeLinejoin="round" />
    <line x1="45" y1="75" x2="52" y2="62" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 68 Q 22 62 38 72" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" strokeLinecap="round" />
  </svg>
);

export const SparkleStar = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path d="M16 0 C16 9 23 16 32 16 C23 16 16 23 16 32 C16 23 9 16 0 16 C9 16 16 9 16 0 Z" fill="#CCFF00" opacity="0.7" />
  </svg>
);

export const BackgroundAnimations: React.FC = () => {
  return (
    <>
      {/* Background Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      {/* Dynamic Animated Visual Background Layer (Refracts through 70% & 90% Glassmorphic Panels) */}
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

        {/* Animated Tech Radar */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-16 right-[-5%] md:right-[5%] w-72 h-72 md:w-[420px] md:h-[420px] opacity-60"
        >
          <TechRadarRings />
        </motion.div>

        {/* Floating Blueprint CAD Wireframe */}
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

        {/* Floating Animated Print Sheet */}
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

        {/* Secondary Blueprint CAD in lower right */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [6, -6, 6],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[15%] right-[8%] w-32 h-32 md:w-44 md:h-44 opacity-50 hidden sm:block"
        >
          <FloatingBlueprintCAD />
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
            y: [-100, 1000],
            opacity: [0, 0.35, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent shadow-[0_0_15px_#CCFF00]"
        />

      </div>
    </>
  );
};
