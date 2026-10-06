import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

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

    // 1. If currently on home or auth pages, redirect directly to respective dashboard
    if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
      const pendingRedirect = localStorage.getItem('xeroxflow_post_auth_redirect');
      if (pendingRedirect) {
        localStorage.removeItem('xeroxflow_post_auth_redirect');
        if (role === 'staff' && pendingRedirect.startsWith('/staff')) {
          handleNavigate(pendingRedirect);
          return;
        }
        if (role === 'student' && !pendingRedirect.startsWith('/staff')) {
          handleNavigate(pendingRedirect);
          return;
        }
      }
      handleNavigate(role === 'staff' ? '/staff' : '/student');
      return;
    }

    // 2. Strict dashboard segregation: do not link or allow crossing between portals
    if (role === 'student' && currentPath.startsWith('/staff')) {
      handleNavigate('/student');
    } else if (role === 'staff' && (currentPath.startsWith('/student') || currentPath.startsWith('/orders/'))) {
      handleNavigate('/staff');
    }
  }, [isAuthenticated, role, currentPath]);

  // Determine if this is an app shell route (authenticated and not on public landing/auth)
  const isLandingOrAuth = currentPath === '/' || currentPath === '/login' || currentPath === '/register';
  const showAppShell = isAuthenticated && !isLandingOrAuth;

  // Helper to extract Order ID from tracking URL like /student/orders/ord_1042/tracking or /orders/ord_1042/tracking
  const trackingMatch = currentPath.match(/\/orders\/([^/]+)\/tracking/);
  const trackingOrderId = trackingMatch ? trackingMatch[1] : undefined;

  // Render active page
  const renderPage = () => {
    // Unauthenticated landing / auth entry
    if (currentPath === '/' || currentPath === '/login' || currentPath === '/register' || !isAuthenticated) {
      return (
        <LandingPage
          onNavigate={handleNavigate}
          initialAuthOpen={currentPath === '/login' || currentPath === '/register'}
        />
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
      className={`min-h-screen flex flex-col ${
        !showAppShell
          ? 'bg-[#0038FF]'
          : 'bg-[#09090b] text-white selection:bg-[#CCFF00] selection:text-black pb-20 md:pb-0'
      }`}
    >
      {/* Top Navbar: Only render for authenticated app shell */}
      {showAppShell && <Navbar currentPath={currentPath} onNavigate={handleNavigate} />}

      {/* Main Layout Body */}
      {!showAppShell ? (
        <main className="flex-1 w-full">{renderPage()}</main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
          {/* Background Ambient Glow */}
          <div className="dashboard-aurora absolute left-1/2 top-20 h-[500px] w-[700px] -translate-x-1/2 blur-[100px] pointer-events-none z-0 opacity-60" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none opacity-40" />

          {/* Desktop Sidebar */}
          <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

          {/* Page Content Container */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 relative z-10">{renderPage()}</main>
        </div>
      )}

      {/* Mobile Bottom Navigation: Only render for authenticated app shell */}
      {showAppShell && (
        <MobileNav currentPath={currentPath} onNavigate={handleNavigate} />
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
