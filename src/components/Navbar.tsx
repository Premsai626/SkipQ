import React, { useState } from 'react';
import { Menu, X, ArrowLeft } from 'lucide-react';

export type PageId = 'home' | 'how-it-works' | 'pricing' | 'features' | 'shop-portal' | 'student-login';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenAuthModal?: (role?: 'student' | 'staff', mode?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAuthModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Services & Pricing' },
    { id: 'features', label: 'Features' },
    { id: 'shop-portal', label: 'Shop Owner Portal' },
  ];

  const handleItemClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0038FF]/60 backdrop-blur-xl border-b border-white/20 text-white select-none shadow-lg">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-4 md:py-5 flex items-center justify-between">

        {/* Brand Logo & Back to Home Indicator */}
        <div className="flex items-center gap-3">
          {currentPage !== 'home' && (
            <button
              onClick={() => handleItemClick('home')}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center group"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          <div
            onClick={() => handleItemClick('home')}
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
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#0038FF] shadow-md scale-105'
                    : 'border border-white/30 text-white hover:bg-white/15 hover:border-white/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Primary CTA Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onOpenAuthModal) {
                onOpenAuthModal('student', 'signin');
              } else {
                handleItemClick('student-login');
              }
            }}
            className="px-4 sm:px-5 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-md transition-all duration-200 bg-white text-[#0038FF] hover:bg-[#CCFF00] hover:text-black"
          >
            Sign In / Sign Up
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#002bd4] border-t border-white/10 px-6 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleItemClick('home')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              currentPage === 'home' ? 'bg-white text-[#0038FF]' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            Home Overview
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentPage === item.id ? 'bg-white text-[#0038FF]' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenAuthModal) {
                onOpenAuthModal('student', 'signin');
              } else {
                handleItemClick('student-login');
              }
            }}
            className="w-full text-center mt-3 py-2.5 rounded-xl bg-[#CCFF00] text-black font-bold text-sm shadow-md"
          >
            Sign In / Sign Up
          </button>
        </div>
      )}
    </header>
  );
};
