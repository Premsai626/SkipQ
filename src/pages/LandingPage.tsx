import React, { useState } from 'react';
import { Navbar, PageId } from '../components/Navbar';
import { Component as HeroPage } from '../components/ui/hero';
import { HowItWorksPage } from './HowItWorksPage';
import { PricingServicesPage } from './PricingServicesPage';
import { FeaturesPage } from './FeaturesPage';
import { ShopPortalPage } from './ShopPortalPage';
import { StudentPortalPage } from './StudentPortalPage';
import { AuthModal, UserRole, AuthMode } from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  initialAuthOpen?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, initialAuthOpen = false }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const { login } = useAuth();

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(initialAuthOpen);
  const [authRole, setAuthRole] = useState<UserRole>('student');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  const handleSubNavigate = (page: string) => {
    // If navigating to an internal route
    if (page.startsWith('/')) {
      onNavigate(page);
      return;
    }
    setCurrentPage(page as PageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthModal = (role: UserRole = 'student', mode: AuthMode = 'signin') => {
    setAuthRole(role);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
      window.history.pushState({}, '', '/');
    }
  };

  // Student Authentication Callback
  const handleStudentAuthSuccess = () => {
    setIsAuthModalOpen(false);
    onNavigate('/student');
  };

  // Staff Authentication Callback
  const handleStaffAuthSuccess = () => {
    setIsAuthModalOpen(false);
    onNavigate('/staff');
  };

  return (
    <div className="min-h-screen bg-[#0038FF] text-white selection:bg-[#CCFF00] selection:text-black">
      {/* Sticky Navigation Bar for Subpages */}
      {currentPage !== 'home' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={(p) => handleSubNavigate(p)}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}

      {/* Main View Router */}
      {currentPage === 'home' && (
        <HeroPage
          onNavigate={handleSubNavigate}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}
      {currentPage === 'how-it-works' && <HowItWorksPage onNavigate={handleSubNavigate} />}
      {currentPage === 'pricing' && <PricingServicesPage onNavigate={handleSubNavigate} />}
      {currentPage === 'features' && <FeaturesPage onNavigate={handleSubNavigate} />}
      {currentPage === 'shop-portal' && (
        <ShopPortalPage
          onNavigate={handleSubNavigate}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}
      {currentPage === 'student-login' && (
        <StudentPortalPage
          onNavigate={handleSubNavigate}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}

      {/* Global High-End Glassmorphic Slide-Over / Popup Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        defaultRole={authRole}
        defaultMode={authMode}
        onStudentSuccess={handleStudentAuthSuccess}
        onStaffSuccess={handleStaffAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
