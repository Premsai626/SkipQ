import React, { useState } from 'react';
import { Component as HeroPage } from '../components/ui/hero';
import { CinematicFooter } from '../components/ui/motion-footer';
import { AuthModal, UserRole, AuthMode } from '../components/AuthModal';
import { InfoModal, InfoModalTab } from '../components/InfoModal';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  initialAuthOpen?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, initialAuthOpen = false }) => {
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(initialAuthOpen);
  const [authRole, setAuthRole] = useState<UserRole>('student');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Info Modal State (Services, Privacy, Terms, Support)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab>('services');

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

  const handleNavigateTarget = (target: string) => {
    if (target.startsWith('/')) {
      onNavigate(target);
      return;
    }
    if (target === 'get-started' || target === 'student-login' || target === 'signin') {
      handleOpenAuthModal('student', 'signin');
      return;
    }
    if (target === 'shop-portal' || target === 'staff-login') {
      handleOpenAuthModal('staff', 'signin');
      return;
    }
    if (target === 'privacy' || target === 'terms' || target === 'services' || target === 'pricing' || target === 'support') {
      setInfoModalTab(target === 'pricing' ? 'services' : (target as InfoModalTab));
      setIsInfoModalOpen(true);
      return;
    }
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F9FAFB] selection:bg-[#00D4FF]/25 selection:text-[#00D4FF] relative overflow-hidden">
      <HeroPage
        onNavigate={handleNavigateTarget}
        onOpenAuthModal={handleOpenAuthModal}
      />
      <CinematicFooter
        onGetStarted={() => handleOpenAuthModal('student', 'signin')}
        onExplore={() => {
          const el = document.getElementById('how-it-works');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onNavigate={handleNavigateTarget}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        defaultRole={authRole}
        defaultMode={authMode}
        onStudentSuccess={handleStudentAuthSuccess}
        onStaffSuccess={handleStaffAuthSuccess}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        activeTab={infoModalTab}
        onTabChange={setInfoModalTab}
      />
    </div>
  );
};

export default LandingPage;
