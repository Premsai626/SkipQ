import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ChatAssistant } from './components/chat/ChatAssistant';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { NewOrderPage } from './pages/student/NewOrderPage';
import { OrderTrackingPage } from './pages/student/OrderTrackingPage';
import { OrderHistoryPage } from './pages/student/OrderHistoryPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentStorePage } from './pages/student/StudentStorePage';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffOrdersPage } from './pages/staff/StaffOrdersPage';
import { StaffQueuePage } from './pages/staff/StaffQueuePage';
import { StaffAnalyticsPage } from './pages/staff/StaffAnalyticsPage';
import { StaffStorePage } from './pages/staff/StaffStorePage';
import { StaffProfilePage } from './pages/staff/StaffProfilePage';

const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const { role, isAuthenticated } = useAuth();

  const handleNavigate = (path: string, replace = false) => {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Strict route protection: Unauthenticated users visiting protected routes MUST be redirected to '/'
  useEffect(() => {
    if (!isAuthenticated) {
      const isProtected =
        currentPath.startsWith('/student') ||
        currentPath.startsWith('/staff') ||
        currentPath.startsWith('/orders') ||
        currentPath.startsWith('/store') ||
        currentPath.startsWith('/profile') ||
        currentPath.startsWith('/notifications') ||
        currentPath.startsWith('/queue') ||
        currentPath.startsWith('/history') ||
        currentPath.startsWith('/dashboard');

      if (isProtected) {
        window.history.replaceState(null, '', '/');
        setCurrentPath('/');
      }
      return;
    }

    // 1. Authenticated users on landing or auth entry routes (/, /landing, /login, /register) get redirected to their dashboard
    if (currentPath === '/' || currentPath === '/landing' || currentPath === '/login' || currentPath === '/register') {
      const pendingRedirect = localStorage.getItem('xeroxflow_post_auth_redirect');
      if (pendingRedirect) {
        localStorage.removeItem('xeroxflow_post_auth_redirect');
        if (role === 'staff' && pendingRedirect.startsWith('/staff')) {
          handleNavigate(pendingRedirect, true);
          return;
        }
        if (role === 'student' && !pendingRedirect.startsWith('/staff')) {
          handleNavigate(pendingRedirect, true);
          return;
        }
      }
      handleNavigate(role === 'staff' ? '/staff' : '/student', true);
      return;
    }

    // 2. Strict dashboard segregation: do not link or allow crossing between portals
    if (role === 'student' && currentPath.startsWith('/staff')) {
      handleNavigate('/student', true);
    } else if (role === 'staff' && (currentPath.startsWith('/student') || currentPath.startsWith('/orders/'))) {
      handleNavigate('/staff', true);
    }
  }, [isAuthenticated, role, currentPath]);

  // Determine if this is an app shell route (authenticated user on dashboard routes)
  const showAppShell = isAuthenticated;

  // Helper to extract Order ID from tracking URL like /student/orders/ord_1042/tracking or /orders/ord_1042/tracking
  const trackingMatch = currentPath.match(/\/orders\/([^/]+)\/tracking/);
  const trackingOrderId = trackingMatch ? trackingMatch[1] : undefined;

  // Render active page
  const renderPage = () => {
    // 1. Unauthenticated users: Render Landing Page
    if (!isAuthenticated) {
      return (
        <LandingPage
          onNavigate={handleNavigate}
          initialAuthOpen={currentPath === '/login' || currentPath === '/register'}
        />
      );
    }

    // 2. Authenticated users on root or auth URLs: Render the corresponding dashboard directly
    if (currentPath === '/' || currentPath === '/landing' || currentPath === '/login' || currentPath === '/register') {
      return role === 'staff' ? (
        <StaffDashboard onNavigate={handleNavigate} />
      ) : (
        <StudentDashboard onNavigate={handleNavigate} />
      );
    }

    // Strict Role Separation: Student Portal
    if (role === 'student') {
      if (currentPath === '/student' || currentPath === '/dashboard') {
        return <StudentDashboard onNavigate={handleNavigate} />;
      }
      if (currentPath === '/student/orders/new' || currentPath === '/orders/new') {
        return <NewOrderPage onNavigate={handleNavigate} />;
      }
      if (currentPath.includes('/orders/') && currentPath.includes('/tracking')) {
        return <OrderTrackingPage orderId={trackingOrderId} onNavigate={handleNavigate} />;
      }
      if (currentPath === '/student/history' || currentPath === '/orders/history') {
        return <OrderHistoryPage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/student/store' || currentPath === '/store') {
        return <StudentStorePage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/student/notifications' || currentPath === '/notifications') {
        return <NotificationsPage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/student/profile' || currentPath === '/profile') {
        return <StudentProfilePage onNavigate={handleNavigate} />;
      }
      // Student fallback
      return <StudentDashboard onNavigate={handleNavigate} />;
    }

    // Strict Role Separation: Staff Portal
    if (role === 'staff') {
      if (currentPath === '/staff') {
        return <StaffDashboard onNavigate={handleNavigate} />;
      }
      if (currentPath === '/staff/orders') {
        return <StaffOrdersPage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/staff/queue') {
        return <StaffQueuePage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/staff/store') {
        return <StaffStorePage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/staff/notifications') {
        return <NotificationsPage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/staff/profile') {
        return <StaffProfilePage onNavigate={handleNavigate} />;
      }
      if (currentPath === '/staff/analytics') {
        return <StaffAnalyticsPage />;
      }
      // Staff fallback
      return <StaffDashboard onNavigate={handleNavigate} />;
    }

    // Fallback: Default to landing page
    return <LandingPage onNavigate={handleNavigate} />;
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#0B0F14] text-[#F1F5F9] selection:bg-[#06D6F0]/25 selection:text-[#06D6F0] overflow-x-hidden ${
        showAppShell ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8' : ''
      }`}
    >
      {/* Top Navbar: Only render for authenticated app shell */}
      {showAppShell && <Navbar currentPath={currentPath} onNavigate={handleNavigate} />}

      {/* Main Layout Body */}
      {!showAppShell ? (
        <main className="flex-1 w-full bg-[#0B0F14]">{renderPage()}</main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto relative min-w-0">
          {/* Background Ambient Glow */}
          <div className="dashboard-aurora absolute left-1/2 top-20 h-[500px] w-[700px] -translate-x-1/2 blur-[120px] pointer-events-none z-0 opacity-40" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none opacity-20" />

          {/* Desktop Sidebar */}
          <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

          {/* Page Content Container */}
          <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 relative z-10 max-w-full">{renderPage()}</main>
        </div>
      )}

      {/* Mobile Bottom Navigation: Only render for authenticated app shell */}
      {showAppShell && (
        <MobileNav currentPath={currentPath} onNavigate={handleNavigate} />
      )}

      {/* SkipQ AI Floating Assistant: Strictly Authenticated Shell Only */}
      {showAppShell && (
        <ChatAssistant onNavigate={handleNavigate} currentPath={currentPath} />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
