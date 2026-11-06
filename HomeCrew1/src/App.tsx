import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/LogoAnimation';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FindWorkersPage } from './pages/FindWorkersPage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { PostJobPage } from './pages/PostJobPage';
import { NegotiationPage } from './pages/NegotiationPage';
import { ActiveJobTrackingPage } from './pages/ActiveJobTrackingPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AIMapsAssistantPage } from './pages/AIMapsAssistantPage';
import { AuthPage } from './pages/AuthPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { AboutPage, PrivacyPage, TermsPage, NotFoundPage } from './pages/StaticPages';

// Scroll to top on route change helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        {/* Animated Initial Splash Screen (skippable) */}
        <SplashScreen onFinish={() => setSplashFinished(true)} />

        {/* Google Maps Quota Warning Banner per GMP skill directives */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-between">
            <span className="mx-auto">
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
            <button
              onClick={() => setQuotaExceeded(false)}
              className="text-amber-800 hover:text-amber-950 font-bold px-2"
            >
              &times;
            </button>
          </div>
        )}

        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-[#FAFBF8] text-gray-900 font-sans selection:bg-[#0B5D43] selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Common Public Homepage - Accessible to everyone without login */}
                <Route path="/" element={<LandingPage />} />

                {/* Public Discovery Pages */}
                <Route path="/workers" element={<FindWorkersPage />} />
                <Route path="/worker/:id" element={<WorkerProfilePage />} />
                <Route path="/ai-assistant" element={<AIMapsAssistantPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/profile-setup" element={<ProfileSetupPage />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-job"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <PostJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/negotiate"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}>
                      <NegotiationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tracking"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}>
                      <ActiveJobTrackingPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Worker Routes */}
                <Route
                  path="/worker/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['worker', 'admin']}>
                      <WorkerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
