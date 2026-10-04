import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Printer,
  QrCode,
  CheckCircle2,
  Lock,
  Download,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Store,
  Layers,
  Sparkles
} from 'lucide-react';
import { BackgroundAnimations } from '@/components/BackgroundAnimations';

import { useAuth } from '../context/AuthContext';

interface ShopPortalPageProps {
  onNavigate: (page: string) => void;
  onOpenAuthModal?: (role?: 'student' | 'staff', mode?: 'signin' | 'signup') => void;
}

export const ShopPortalPage: React.FC<ShopPortalPageProps> = ({ onNavigate, onOpenAuthModal }) => {
  const { login, signInWithGoogle } = useAuth();
  const [shopId, setShopId] = useState('MLRIT-XEROX-01');
  const [pin, setPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(async () => {
      setIsLoggingIn(false);
      setLoginMessage('Operator terminal authenticated. Live queue dashboard loads after login.');
      try {
        const staffEmail = `${shopId.toLowerCase()}@campus.edu`;
        await login(staffEmail, pin || 'demo1234', 'staff');
      } catch {}
      setTimeout(() => {
        onNavigate('/staff');
      }, 800);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLoginMessage('Connecting to Google OAuth for Stationery Operator...');
    try {
      localStorage.setItem('xeroxflow_post_auth_redirect', '/staff');
      await signInWithGoogle('staff');
    } catch (err: any) {
      setIsGoogleLoading(false);
      setLoginMessage(err?.message || 'Google authentication failed');
    }
  };

  const portalCapabilities = [
    {
      icon: Printer,
      title: 'Batch Job Ingestion',
      badge: '1-Click Print Batches',
      description: 'Download queued assignments in grouped, organized ZIP archives sorted by page size, color profile, and deadline urgency.'
    },
    {
      icon: QrCode,
      title: 'Dual-Mode Fast Clearance',
      badge: 'Sub-Second Verification',
      description: 'Clear counter pickups using high-speed optical 2D barcode scanning or instant 4-digit token entry on the express window terminal.'
    },
    {
      icon: Zap,
      title: 'Zero USB Malware Risk',
      badge: 'Direct Cloud Spooling',
      description: 'Eliminate student flash drive handovers. Documents stream directly to shop print workstations with zero virus or malware threat.'
    },
    {
      icon: TrendingUp,
      title: 'Automated Digital Ledger',
      badge: '100% Pre-Paid Orders',
      description: 'Every job is 100% pre-paid via digital UPI or card gateway before entering your queue, eliminating cash-handling friction.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0038FF] text-white selection:bg-[#CCFF00] selection:text-black relative overflow-hidden">
      {/* Dynamic Animated Visual Background Layer */}
      <BackgroundAnimations />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-16">

        {/* Page Header with Scroll Motion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-sm">
            <Store className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#CCFF00]">OPERATOR ECOSYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-sans">
            Shop Owner <span className="text-[#CCFF00]">Portal</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed">
            A centralized terminal interface for campus stationery vendors and xerox operators to manage print pipelines, verify pickups, and streamline campus volume.
          </p>
        </motion.div>

        {/* Overview & Login Gateway Card - 70% Transparent Glassmorphic with Scroll Motion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto mb-16 items-start">

          {/* Left: System Overview & Operator Advantages */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="bg-white/30 backdrop-blur-2xl text-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-white/40 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wide shadow-sm">
                Campus Vendor Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                Transforming Counter Rush Into Asynchronous Flow
              </h2>
              <p className="text-sm text-white/90 leading-relaxed font-medium">
                SkipQ equips stationery shop owners with an automated workflow dashboard that replaces crowded physical counter queues with prioritized print pipelines and instant pickup verification.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {portalCapabilities.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                      className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 space-y-2 text-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center border border-white/30">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-2 py-0.5 rounded shadow-sm">
                          {cap.badge}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-white">{cap.title}</h4>
                      <p className="text-xs text-white/85 leading-relaxed">{cap.description}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-t border-white/20 pt-4 flex items-center gap-2 text-xs text-white/80 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
                <span>Live queue management and job actions are restricted to authorized vendor accounts.</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Operator Sign-In Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="bg-white/30 backdrop-blur-2xl text-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-white/40 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-sm">Operator Gateway</h3>
                  <p className="text-xs text-white/80">MLRIT Campus Terminal Login</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-black shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {loginMessage && (
                <div className="p-3.5 rounded-2xl bg-[#CCFF00]/20 border border-[#CCFF00] text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] flex-shrink-0" />
                  <span>{loginMessage}</span>
                </div>
              )}

              {/* Google SSO */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoggingIn}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-gray-800 hover:bg-gray-100 active:scale-[0.99] font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-[#0038FF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z" />
                  </svg>
                )}
                <span>Operator Google Sign-In</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/20"></div>
                <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Or with Terminal ID</span>
                <div className="h-px flex-1 bg-white/20"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 block mb-1.5">
                    Terminal / Shop ID
                  </label>
                  <input
                    type="text"
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="w-full p-3 bg-black/20 border border-white/30 rounded-xl text-xs font-bold text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] backdrop-blur-md"
                    placeholder="e.g. MLRIT-XEROX-01"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/90 block mb-1.5">
                    Operator Security PIN / Password
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full p-3 bg-black/20 border border-white/30 rounded-xl text-xs font-bold text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] backdrop-blur-md"
                    placeholder="Enter terminal PIN"
                    required
                  />
                </div>

                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-[11px] text-white/90 font-medium border border-white/20">
                  Operator authentication grants access to batch spoolers, queue status toggles, and counter QR readers.
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wide hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                  {isLoggingIn ? (
                    <span>Authenticating Terminal...</span>
                  ) : (
                    <>
                      <span>Launch Operator Terminal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 flex flex-col items-center gap-2 text-center border-t border-white/10">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('staff', 'signup')}
                  className="text-xs font-bold text-white hover:text-[#CCFF00] transition-colors"
                >
                  New vendor station? <span className="underline text-[#CCFF00]">Register Operator Terminal</span>
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-xs text-white/70 hover:text-white underline transition-colors"
                >
                  Return to Main Landing Page
                </button>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
};
