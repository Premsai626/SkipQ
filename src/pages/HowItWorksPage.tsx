import React from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  CreditCard,
  QrCode,
  CheckCircle2,
  Archive,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { BackgroundAnimations } from '@/components/BackgroundAnimations';

interface HowItWorksPageProps {
  onNavigate: (page: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: "01",
      title: "Upload & Customize",
      subtitle: "Universal file support & custom print configurations",
      badge: "Step 1 • Document Ingestion",
      icon: Upload,
      description: "Students upload lab manuals, project reports, or assignment files directly from their phone or laptop. Configure page ranges, color profiles (B&W or Full Color), and duplex options before submitting.",
      keyPoints: [
        "Direct PDF, DOCX, PPTX, and image file upload",
        "Granular per-document page range & color selection",
        "Instant upfront cost estimation based on campus shop rates"
      ]
    },
    {
      step: "02",
      title: "Pay & Get Token",
      subtitle: "Instant digital payment & 4-digit pickup token",
      badge: "Step 2 • Payment Gating",
      icon: CreditCard,
      description: "Pay individually via UPI or divide group project costs among teammates. Once payment is confirmed, SkipQ instantly issues a unique 4-digit Token ID and scannable QR Pass.",
      keyPoints: [
        "Instant individual UPI or card checkout",
        "Collaborative Split-Pay for group lab assignments",
        "Automated digital invoice & token generation"
      ]
    },
    {
      step: "03",
      title: "Skip Queue & Collect",
      subtitle: "Contactless express counter pickup",
      badge: "Step 3 • Express Pickup",
      icon: QrCode,
      description: "Track the print job in real time. Once marked ready, walk to the dedicated SkipQ express window at the campus stationery shop, show your token or QR code, and collect without waiting in line.",
      keyPoints: [
        "Live status tracking: Ordered → Printing → Ready",
        "Sub-second verification via optical QR scan or 4-digit token",
        "Zero physical lines or USB flash drive handovers"
      ]
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
            <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#CCFF00]">SYSTEM OVERVIEW</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-sans">
            How <span className="text-[#CCFF00]">SkipQ</span> Works
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed">
            A high-level overview of how SkipQ transforms campus printing into an asynchronous, queue-free digital workflow.
          </p>
        </motion.div>

        {/* 3 Step Overview Grid - 70% Transparent Glassmorphic with Staggered Scroll Motion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                className="bg-white/30 backdrop-blur-xl text-white rounded-[2.5rem] p-8 shadow-2xl border border-white/40 flex flex-col justify-between hover:bg-white/35 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-12 h-12 rounded-2xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center font-black text-lg shadow-md border border-white/30">
                      {s.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#CCFF00] px-3 py-1 rounded-full shadow-sm">
                      {s.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white drop-shadow-sm">
                    {s.title}
                  </h2>
                  <p className="text-xs font-bold text-[#CCFF00] mb-4">
                    {s.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="border-t border-white/20 pt-5 space-y-2.5">
                  {s.keyPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#CCFF00] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-white/90 font-medium">{pt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Key Architecture Concept Highlights with Scroll Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">

          {/* Dorm Vault Overview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white/30 backdrop-blur-xl text-white rounded-3xl p-8 border border-white/40 shadow-2xl space-y-4 hover:bg-white/35 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-black shadow-md">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-sm">"Print Later" Dorm Vault Staging</h3>
            <p className="text-sm text-white/90 leading-relaxed">
              Stage documents late at night from your hostel room with print settings saved in advance. Release the print job whenever you are walking toward the shop or schedule morning batch runs before lab lectures.
            </p>
            <div className="text-xs text-[#CCFF00] font-bold flex items-center gap-1.5">
              <span>Feature available inside student dashboard after login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Group Split-Pay Overview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="bg-white/30 backdrop-blur-xl text-white rounded-3xl p-8 border border-white/40 shadow-2xl space-y-4 hover:bg-white/35 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white text-[#0038FF] flex items-center justify-center font-black shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-sm">Collaborative Group Project Split-Pay</h3>
            <p className="text-sm text-white/90 leading-relaxed">
              Eliminate chasing teammates for cash. Lab teams can automatically divide order totals equally or custom across group members with individual payment links before the print job is sent to the printer.
            </p>
            <div className="text-xs text-[#CCFF00] font-bold flex items-center gap-1.5">
              <span>Feature available inside student dashboard after login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

        </div>

        {/* Bottom CTA Banner with Scroll Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/30 backdrop-blur-2xl text-white rounded-[2.5rem] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl border border-white/40"
        >
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3 text-white drop-shadow-sm">
            Ready to Skip the Campus Xerox Queue?
          </h3>
          <p className="text-sm text-white/90 max-w-xl mx-auto mb-6">
            Sign in with your student credentials to upload assignments, view your Dorm Vault, and track real-time print orders.
          </p>
          <button
            onClick={() => onNavigate('student-login')}
            className="px-8 py-3.5 rounded-full bg-[#CCFF00] text-black font-black text-sm uppercase tracking-wide hover:bg-white transition-all shadow-xl"
          >
            Access Student Portal
          </button>
        </motion.div>

      </div>
    </div>
  );
};
