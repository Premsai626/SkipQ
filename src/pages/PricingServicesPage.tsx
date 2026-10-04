import React from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  ShoppingBag,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  ShieldCheck,
  Tag,
  Printer
} from 'lucide-react';
import { BackgroundAnimations } from '@/components/BackgroundAnimations';

interface PricingServicesPageProps {
  onNavigate: (page: string) => void;
}

export const PricingServicesPage: React.FC<PricingServicesPageProps> = ({ onNavigate }) => {
  const printTariffs = [
    {
      category: 'Black & White Printing (Monochrome)',
      rate: '₹2.00 / page',
      duplexRate: '₹3.00 / sheet (Duplex)',
      specs: '75 GSM Standard Executive White Paper',
      bestFor: 'Lab manuals, assignment submissions, lecture notes, documentation'
    },
    {
      category: 'Full Color HD Laser Printing',
      rate: '₹10.00 / page',
      duplexRate: '₹16.00 / sheet (Duplex)',
      specs: '100 GSM Bright White Laser Paper',
      bestFor: 'Project cover pages, architectural diagrams, seminar slides, presentations'
    },
    {
      category: 'A3 Heavy Engineering Drafting Sheets',
      rate: '₹15.00 / sheet (B&W) • ₹35.00 (Color)',
      duplexRate: 'Single-Sided Recommended',
      specs: '140 GSM Heavyweight Cartridge Stock',
      bestFor: 'AutoCAD blueprints, mechanical drafts, circuit board schematics'
    },
    {
      category: 'Glossy Poster & Certificate Media',
      rate: '₹25.00 / sheet',
      duplexRate: 'Single-Sided Photo Grade',
      specs: '180 GSM High-Gloss Resin Coated Media',
      bestFor: 'Tech-fest certificates, scientific research posters, club event collaterals'
    }
  ];

  const stationeryInventory = [
    {
      name: 'Campus Lab Apron (White Cotton)',
      category: 'Lab Apparel',
      price: '₹280.00',
      description: 'Standard MLRIT laboratory dress code with dual chest pen slots and reinforced side vents.',
      badge: 'Mandatory Lab Gear'
    },
    {
      name: 'Assignment Stick Files (Pack of 5)',
      category: 'Filing & Submission',
      price: '₹45.00',
      description: 'Transparent high-clarity front cover with non-slip fluorescent spine locking clips.',
      badge: 'Popular for Submissions'
    },
    {
      name: 'Engineering Graph Book (60 Pgs)',
      category: 'Notebooks & Records',
      price: '₹35.00',
      description: 'High-precision millimeter grid pages for Physics, Chemistry, and CAD laboratory readings.',
      badge: 'Academic Standard'
    },
    {
      name: 'A3 Drawing Sheets (Pack of 10)',
      category: 'Engineering Graphics',
      price: '₹60.00',
      description: 'Heavyweight 140 GSM drafting paper tailored for Engineering Drawing drawing boards.',
      badge: 'Department Approved'
    },
    {
      name: 'Executive Spiral Notebook (200 Pgs)',
      category: 'Notebooks & Records',
      price: '₹110.00',
      description: '80 GSM smooth bond paper with perforated tear-out sheets and spill-resistant poly cover.',
      badge: 'Class Notes'
    },
    {
      name: 'Pilot V5 Hi-Tecpoint Pen (Black/Blue)',
      category: 'Writing Instruments',
      price: '₹55.00',
      description: '0.5mm stainless steel precision tip with liquid ink feed for examination writing.',
      badge: 'Exam Ready'
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
            <Calculator className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#CCFF00]">TRANSPARENT CAMPUS TARIFF</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase font-sans">
            Services & <span className="text-[#CCFF00]">Pricing</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed">
            Standardized xerox tariffs, high-definition laser printing options, and official campus lab & stationery catalog.
          </p>
        </motion.div>

        {/* Print Services Tariff Rate Card - 70% Transparent Glassmorphic with Scroll Motion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/30 backdrop-blur-2xl text-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-2xl max-w-5xl mx-auto mb-16 border border-white/40"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/20">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wide mb-2">
                Official Campus Rates
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                Print & Xerox Rate Sheet
              </h2>
            </div>
            <div className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold">
              <Info className="w-4 h-4 text-[#CCFF00]" />
              <span>Standardized MLRIT Stationery Shop Pricing</span>
            </div>
          </div>

          {/* Tariffs List with Staggered Motion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            {printTariffs.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 border border-white/30 flex flex-col justify-between hover:border-[#CCFF00] hover:bg-white/25 transition-all text-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-white/70">Service {idx + 1}</span>
                    <span className="text-sm font-black text-black bg-[#CCFF00] px-3 py-1 rounded-xl shadow-sm">
                      {t.rate}
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                    {t.category}
                  </h3>
                  <p className="text-xs font-bold text-white/90 mb-3">
                    Duplex Rate: <span className="text-[#CCFF00]">{t.duplexRate}</span>
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed mb-4">
                    {t.bestFor}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/20 text-[11px] font-semibold text-white/70 flex items-center gap-2">
                  <Printer className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Media: {t.specs}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Banner Note */}
          <div className="mt-8 p-5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#CCFF00] flex-shrink-0" />
              <p className="text-xs text-white/90 font-medium">
                Live automated price estimation, custom page-range selection, and digital checkout are accessible inside the student dashboard after sign-in.
              </p>
            </div>
            <button
              onClick={() => onNavigate('student-login')}
              className="px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black font-black text-xs hover:bg-white transition-colors whitespace-nowrap shadow-md"
            >
              Sign In to Print
            </button>
          </div>
        </motion.div>

        {/* Section 2: Stationery Catalog Overview with Scroll Motion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-6xl mx-auto mb-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wide mb-2">
              Stationery & Lab Essentials
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              Campus Store Inventory
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/80">
              Students can bundle required stationery with print orders for 1-stop express pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stationeryInventory.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                className="bg-white/30 backdrop-blur-xl text-white rounded-3xl p-6 shadow-2xl border border-white/40 flex flex-col justify-between hover:bg-white/35 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-white/20 px-2.5 py-1 rounded-lg border border-white/20">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg bg-[#CCFF00] text-black shadow-sm">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-white/85 leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/70 font-bold block uppercase">Fixed Rate</span>
                    <span className="text-lg font-black text-[#CCFF00]">{item.price}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('student-login')}
                    className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-[#CCFF00] hover:text-black text-white text-xs font-bold transition-all border border-white/30"
                  >
                    Add via Portal
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA Banner with Scroll Motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/30 backdrop-blur-2xl text-white rounded-[2.5rem] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl border border-white/40"
        >
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3 text-white drop-shadow-sm">
            Ready to Configure Your Print Job?
          </h3>
          <p className="text-sm text-white/90 max-w-xl mx-auto mb-6">
            Sign in with your student Roll Number to configure print options, preview estimated totals, and generate your 4-digit pickup token.
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
