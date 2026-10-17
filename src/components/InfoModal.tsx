import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  FileText,
  Printer,
  Headphones,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  Layers,
  ShoppingBag,
} from 'lucide-react';

export type InfoModalTab = 'services' | 'privacy' | 'terms' | 'support';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: InfoModalTab;
  onTabChange?: (tab: InfoModalTab) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'services',
  onTabChange,
}) => {
  const [tab, setTab] = React.useState<InfoModalTab>(activeTab);

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  const handleTabSwitch = (newTab: InfoModalTab) => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#080B12]/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-[#111827] border border-[#273244] rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="p-4 sm:px-6 sm:py-5 bg-[#0D111B] border-b border-[#273244] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-[#080B12] shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                  <Sparkles className="w-5 h-5 text-[#080B12]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#F9FAFB] tracking-tight flex items-center gap-2">
                    SkipQ Campus Portal
                    <span className="px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25 text-[9px] font-black uppercase tracking-wider font-mono">
                      Institutional
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Digital Xerox, Stationery Catalog & Campus Terms
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-2 rounded-xl bg-[#1A2232] border border-[#273244] text-[#9CA3AF] hover:text-white hover:border-[#00D4FF]/40 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-4 sm:px-6 pt-3 bg-[#0D111B]/60 border-b border-[#273244] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => handleTabSwitch('services')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  tab === 'services'
                    ? 'border-[#00D4FF] text-[#00D4FF] bg-[#111827]'
                    : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1A2232]/50'
                }`}
              >
                <Printer className="w-4 h-4" />
                Services & Pricing
              </button>

              <button
                onClick={() => handleTabSwitch('privacy')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  tab === 'privacy'
                    ? 'border-[#00D4FF] text-[#00D4FF] bg-[#111827]'
                    : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1A2232]/50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Privacy Policy
              </button>

              <button
                onClick={() => handleTabSwitch('terms')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  tab === 'terms'
                    ? 'border-[#00D4FF] text-[#00D4FF] bg-[#111827]'
                    : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1A2232]/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Terms of Service
              </button>

              <button
                onClick={() => handleTabSwitch('support')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  tab === 'support'
                    ? 'border-[#00D4FF] text-[#00D4FF] bg-[#111827]'
                    : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1A2232]/50'
                }`}
              >
                <Headphones className="w-4 h-4" />
                Support & Desks
              </button>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="p-5 sm:p-6 md:p-8 overflow-y-auto space-y-6 text-[#F9FAFB] leading-relaxed text-sm">
              {/* TAB 1: SERVICES & PRICING */}
              {tab === 'services' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <Printer className="w-5 h-5 text-[#00D4FF]" />
                      Campus Printing & Xerox Rates
                    </h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Authoritative pricing configured for MLRIT institutional Xerox & Stationery centers.
                    </p>
                  </div>

                  {/* Pricing Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* B&W Xerox */}
                    <div className="p-4 rounded-2xl bg-[#1A2232]/70 border border-[#273244] hover:border-[#00D4FF]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#9CA3AF]">Black & White Xerox</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] font-black text-xs">Standard</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">₹1.50</span>
                        <span className="text-xs text-[#9CA3AF]">/ page (A4)</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        Duplex discount applied automatically: <strong>₹2.40 per sheet</strong> (20% off double-sided prints).
                      </p>
                    </div>

                    {/* Color Laser Print */}
                    <div className="p-4 rounded-2xl bg-[#1A2232]/70 border border-[#273244] hover:border-[#8B5CF6]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#9CA3AF]">Color Laser Print</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] font-black text-xs">High-Res</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">₹8.00</span>
                        <span className="text-xs text-[#9CA3AF]">/ page (A4)</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        2400 DPI laser printing for lab project reports, circuit diagrams, and presentation charts.
                      </p>
                    </div>

                    {/* A3 Engineering Graphics */}
                    <div className="p-4 rounded-2xl bg-[#1A2232]/70 border border-[#273244] hover:border-[#00D4FF]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#9CA3AF]">A3 Engineering CAD</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] font-black text-xs">Technical</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">₹15.00</span>
                        <span className="text-xs text-[#9CA3AF]">/ page (A3)</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        Full-scale isometric projections, machine blueprints, and civil engineering building plans.
                      </p>
                    </div>

                    {/* Finishing & Binding */}
                    <div className="p-4 rounded-2xl bg-[#1A2232]/70 border border-[#273244] hover:border-[#FBBF24]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#9CA3AF]">Binding & Finishing</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FBBF24]/15 text-[#FBBF24] font-black text-xs">Submission</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">₹35.00</span>
                        <span className="text-xs text-[#9CA3AF]">/ spiral</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        Staple binding: ₹2 • Soft cover spiral: ₹35 • Thermal waterproof lamination: ₹25.
                      </p>
                    </div>
                  </div>

                  {/* Campus Stationery Catalog Summary */}
                  <div className="p-4 rounded-2xl bg-[#0D111B] border border-[#273244] space-y-2">
                    <h5 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm">
                      <ShoppingBag className="w-4 h-4 text-[#00D4FF]" />
                      Stationery Store Essentials
                    </h5>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      All semester essentials (Lab manual records, Engineering drawing charts, Classmate notebooks, Pilot pens, Scientific calculators, and White lab aprons) can be ordered online for zero-wait pickup at Counter #1 and Counter #2.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: PRIVACY POLICY */}
              {tab === 'privacy' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#34D399]" />
                      Student Data & Document Privacy Policy
                    </h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Last Updated: October 2026 • SkipQ Campus Privacy Standard
                    </p>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-[#9CA3AF]">
                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                        1. Strict Document Confidentiality
                      </h5>
                      <p>
                        All files uploaded through SkipQ (PDFs, PPT presentations, DOCX reports, and images) are stored in encrypted, private cloud buckets. Files are accessible solely by your authenticated student account and the assigned desk operator executing your queue job.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                        2. Automatic Document Retention & Purging
                      </h5>
                      <p>
                        Uploaded files are kept in the system only for order fulfillment. Completed and collected print documents can be automatically purged after pickup to safeguard student project confidentiality.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                        3. Zero Commercial Monetization
                      </h5>
                      <p>
                        We never sell, rent, license, or share student emails, roll numbers, or academic documents with external advertising networks. All data is processed strictly for campus printing and stationery orders.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                        4. Institutional OAuth Authentication
                      </h5>
                      <p>
                        Google Sign-In uses cryptographic session verification via Supabase. Passwords are never stored in plaintext and are salted using industry-standard bcrypt.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TERMS OF SERVICE */}
              {tab === 'terms' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#8B5CF6]" />
                      SkipQ Terms of Service
                    </h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Terms governing campus xerox, print requests, payments, and order collection.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-[#9CA3AF]">
                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide mb-1 text-white">
                        1. Academic Acceptable Use
                      </h5>
                      <p>
                        SkipQ is an educational service for students and faculty. Users may not upload prohibited, defamatory, copyright-infringing commercial materials, or malicious software files. Allowed formats are strictly PDF, DOC, DOCX, PPT, PPTX, JPG, and PNG (up to 50MB).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide mb-1 text-white">
                        2. Order Tokens & Collection Policy
                      </h5>
                      <p>
                        Every confirmed order generates an instant 4-digit token (e.g. <code className="text-[#00D4FF]">XR-1024</code>). Orders are prepared and held at the designated counter for up to 48 hours. Orders not collected within 48 hours may be archived.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide mb-1 text-white">
                        3. Cancellation & Refund Policy
                      </h5>
                      <p>
                        Orders in <strong>PENDING</strong> status can be canceled immediately by the student. Once printing has commenced or reached <strong>ACCEPTED / PRINTING</strong>, cancellation is no longer possible as physical paper and ink resources have been committed.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1A2232]/60 border border-[#273244]">
                      <h5 className="font-bold text-white text-xs uppercase tracking-wide mb-1 text-white">
                        4. Payment Methods & Verification
                      </h5>
                      <p>
                        Digital payments (UPI, QR Scan) and Cash-on-Counter verification are supported. Desk operators verify payment before handing over completed print jobs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SUPPORT & COUNTERS */}
              {tab === 'support' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-[#00D4FF]" />
                      Campus Desk Locations & Support
                    </h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Need help with a print job, collection token, or custom binding? Contact our desk team.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Counter 1 */}
                    <div className="p-4 rounded-2xl bg-[#1A2232]/70 border border-[#273244]">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <MapPin className="w-4 h-4 text-[#00D4FF]" />
                        Counter #1 (Main Academic Block)
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        Ground Floor, Near Central Library & Administrative Wing.
                      </p>
                      <div className="mt-3 text-[11px] text-[#9CA3AF] flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#34D399]" />
                        8:30 AM – 5:30 PM (Mon – Sat)
                      </div>
                    </div>

                    {/* Counter 2 */}
                    <div className="p-4 rounded-2xl bg-[#1A2232]/70 border border-[#273244]">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                        Counter #2 (Workshop Complex)
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        First Floor, Mechanical Engineering & Graphics Wing.
                      </p>
                      <div className="mt-3 text-[11px] text-[#9CA3AF] flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#34D399]" />
                        9:00 AM – 4:30 PM (Mon – Fri)
                      </div>
                    </div>
                  </div>

                  {/* Helpline Contacts */}
                  <div className="p-4 rounded-2xl bg-[#0D111B] border border-[#273244] space-y-3">
                    <h5 className="font-bold text-white text-xs sm:text-sm">Direct Contact Channels</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2.5 text-[#9CA3AF]">
                        <Mail className="w-4 h-4 text-[#00D4FF]" />
                        <span>support@skipq.campus.edu</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[#9CA3AF]">
                        <Phone className="w-4 h-4 text-[#34D399]" />
                        <span>+91 (040) 2988-SKIP (Ext. 402)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 sm:py-4 bg-[#0D111B] border-t border-[#273244] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#9CA3AF]">
                MLRIT Campus Digital Infrastructure • 2026
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#00D4FF] text-[#080B12] text-xs font-black hover:bg-[#00D4FF]/90 transition-all cursor-pointer shadow-lg shadow-[#00D4FF]/20"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
