import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Archive,
  Clock,
  FileCheck2,
  QrCode,
  Cloud,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { BackgroundAnimations } from '@/components/BackgroundAnimations';

interface FeaturesPageProps {
  onNavigate: (page: string) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const [selectedFeatureTab, setSelectedFeatureTab] = useState<string>('split-pay');

  const architectureFeatures = [
    {
      id: 'split-pay',
      badge: 'Team Collaboration',
      title: 'Group Project Split-Pay Engine',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      summary: 'Equal or custom balance distribution among lab group members with automated 100% payment gating.',
      details: [
        'Zero manual cash collection or awkward UPI reminders between project teammates',
        'Generates individual payment links with custom or equal share splits',
        'Strict invariant: Job is released to print queue only upon 100% full balance realization',
        'Automatic email/SMS receipts sent to each contributing student'
      ],
      previewStats: [
        { label: 'Payment Invariant', value: '100% Gated' },
        { label: 'Split Modes', value: 'Equal / Custom' },
        { label: 'Avg Settle Time', value: '< 45 Secs' }
      ]
    },
    {
      id: 'dorm-vault',
      badge: 'Asynchronous Staging',
      title: '"Print Later" Dorm Cloud Vault',
      icon: Archive,
      color: 'from-blue-600 to-indigo-600',
      summary: 'Stage assignments and documents securely from your hostel room at 2 AM without triggering immediate printing.',
      details: [
        'Persistent document staging with per-file custom print configurations pre-saved',
        'Geo-fenced or schedule-based release (e.g. print 10 mins before 9:00 AM class)',
        'One-tap release button when walking from dorm toward the academic block',
        'Prevents paper waste and documents sitting unattended in public shop bins'
      ],
      previewStats: [
        { label: 'Staging Duration', value: 'Up to 7 Days' },
        { label: 'Encryption', value: 'AES-256' },
        { label: 'Release Trigger', value: '1-Tap / Scheduled' }
      ]
    },
    {
      id: 'realtime-pipeline',
      badge: 'Live Status Feed',
      title: 'WebSocket Live Order Pipeline',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      summary: 'End-to-end telemetry tracking orders across Ordered, Printing, Ready for Pickup, and Collected states.',
      details: [
        'Instant push notifications and animated UI status ring upon transition to "Ready for Pickup"',
        'Eliminates physical shop crowding by distributing pickups asynchronously',
        'Live estimated wait times calculated from current shop queue depth and sheet volume',
        'Integrated order progress history and PDF invoice downloads'
      ],
      previewStats: [
        { label: 'WebSocket Latency', value: '< 20ms' },
        { label: 'Queue Stages', value: '4 States' },
        { label: 'Notification', value: 'Web & SMS' }
      ]
    },
    {
      id: 'universal-upload',
      badge: 'Multi-Format Ingestion',
      title: 'Universal Document & Vector Engine',
      icon: FileCheck2,
      color: 'from-purple-600 to-pink-600',
      summary: 'Client-side ingestion for PDF, DOCX, PPTX, and high-resolution CAD images with per-page customization.',
      details: [
        'Per-document page selection (e.g. print pages 1-4 in Color, pages 5-30 in B&W Duplex)',
        'Automatic page count extraction and instantaneous rate calculation',
        'Batch bundle packaging into single pickup orders with unique barcode labels',
        'Zero malware risk: completely sandbox-processed without executable execution'
      ],
      previewStats: [
        { label: 'Supported Types', value: 'PDF, DOCX, PPTX, IMG' },
        { label: 'Page Granularity', value: 'Per-Page Ranges' },
        { label: 'Max File Size', value: '100 MB / File' }
      ]
    },
    {
      id: 'dual-verification',
      badge: 'Fast Counter Clearance',
      title: 'Dual-Pass Staff Verification Engine',
      icon: QrCode,
      color: 'from-cyan-600 to-blue-600',
      summary: 'Sub-second counter pickup clearance using high-speed optical QR gun scanning or 4-digit numeric fallback.',
      details: [
        'Works offline and in low-network conditions using signed encrypted JWT QR tokens',
        'Shopkeeper can scan student phone screen directly through express pickup window',
        'Fallback 4-digit human-readable token for quick typing when phone screen is cracked/dim',
        'Instant order state change to "Collected" with tamper-proof audit trail'
      ],
      previewStats: [
        { label: 'QR Scan Speed', value: '0.4 Seconds' },
        { label: 'Token Length', value: '4 Digits' },
        { label: 'Pickup Friction', value: 'Zero Queues' }
      ]
    },
    {
      id: 'aws-cloud',
      badge: 'Cloud Trek 2026',
      title: 'AWS Serverless Scalability',
      icon: Cloud,
      color: 'from-slate-700 to-slate-900',
      summary: 'Engineered for MLRIT submission spikes with AWS Lambda, DynamoDB Single-Table Design, and S3 Presigned URLs.',
      details: [
        'Zero-server infrastructure scaling seamlessly during end-semester exam submission peaks',
        'S3 Presigned Direct Uploads avoid server memory bottlenecks on large 100MB design files',
        'DynamoDB sub-millisecond document metadata indexing and transactional lock consistency',
        'Multi-tenant architecture ready for multi-campus deployment across institutions'
      ],
      previewStats: [
        { label: 'Cloud Provider', value: 'AWS Trek 2026' },
        { label: 'Architecture', value: 'Serverless' },
        { label: 'Availability SLA', value: '99.99%' }
      ]
    }
  ];

  const currentFeat = architectureFeatures.find((f) => f.id === selectedFeatureTab) || architectureFeatures[0];
  const FeatIcon = currentFeat.icon;

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
            <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#CCFF00]">SYSTEM CAPABILITIES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-sans">
            Engineered For <span className="text-[#CCFF00]">Speed</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed">
            Every feature in SkipQ is purpose-built to eliminate bottlenecks, automate financial settlements, and turn 45-minute xerox queues into 10-second pickups.
          </p>
        </motion.div>

        {/* Feature Navigation Tabs with Scroll Motion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-10 max-w-6xl mx-auto"
        >
          {architectureFeatures.map((feat) => {
            const isSelected = selectedFeatureTab === feat.id;
            const Icon = feat.icon;
            return (
              <button
                key={feat.id}
                onClick={() => setSelectedFeatureTab(feat.id)}
                className={`p-3.5 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-xl scale-[1.03]'
                    : 'bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00] text-black'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-[9px] uppercase tracking-wider opacity-75 truncate">{feat.badge}</p>
                  <p className="font-black text-xs leading-tight truncate">{feat.title}</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Selected Feature Showcase Card - 70% Transparent Glassmorphic with Scroll Motion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/30 backdrop-blur-2xl text-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-2xl max-w-6xl mx-auto mb-16 border border-white/40"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Description & Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wide shadow-sm">
                {currentFeat.badge}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-sm">
                {currentFeat.title}
              </h2>

              <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed">
                {currentFeat.summary}
              </p>

              <div className="space-y-3 pt-2">
                {currentFeat.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-white/90 font-medium">{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('student-login')}
                  className="px-6 py-3 rounded-full bg-[#CCFF00] text-black font-black text-xs sm:text-sm hover:bg-white transition-all flex items-center gap-2 shadow-xl"
                >
                  <span>Experience SkipQ Live</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="px-6 py-3 rounded-full border border-white/40 bg-white/20 text-white font-bold text-xs sm:text-sm hover:bg-white/30 transition-colors backdrop-blur-md"
                >
                  View Workflow Steps
                </button>
              </div>
            </div>

            {/* Right Interactive Stats / Architecture Box */}
            <div className="lg:col-span-5 bg-white/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/30 flex flex-col justify-between space-y-6 text-white">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentFeat.color} text-white flex items-center justify-center shadow-lg border border-white/30`}>
                  <FeatIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Architecture Spec</p>
                  <h4 className="text-base font-black text-white">{currentFeat.title}</h4>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-3">
                {currentFeat.previewStats.map((stat, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/30 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xs sm:text-sm font-black text-[#CCFF00] mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Interactive Visual Element */}
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                  <span>System Reliability Score</span>
                  <span className="text-[#CCFF00]">99.98% Healthy</span>
                </div>
                <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#CCFF00] h-full w-[99%]"></div>
                </div>
                <p className="text-[10px] text-white/70 mt-2">
                  Synchronized with MLRIT Cloud Node • Active Queue Idle
                </p>
              </div>

            </div>

          </div>
        </motion.div>

        {/* 3 Secondary Callout Cards with Scroll Motion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl space-y-3 hover:bg-white/35 transition-all text-white"
          >
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-black shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white drop-shadow-sm">Zero Document Leakage</h3>
            <p className="text-xs text-white/90 leading-relaxed">
              Files are automatically purged from shop memory caches once status updates to "Collected". End-to-end tokenized protection.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl space-y-3 hover:bg-white/35 transition-all text-white"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-[#0038FF] flex items-center justify-center font-black shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white drop-shadow-sm">Smart Batch Aggregation</h3>
            <p className="text-xs text-white/90 leading-relaxed">
              Shopkeeper can download multi-student queues as a single organized ZIP archive sorted by submission urgency and paper profile.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl space-y-3 hover:bg-white/35 transition-all text-white"
          >
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center font-black shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white drop-shadow-sm">Multi-Device Responsive</h3>
            <p className="text-xs text-white/90 leading-relaxed">
              Designed for Android, iOS, tablets, and desktop workstations with zero app installation needed. Instant Progressive Web App.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
