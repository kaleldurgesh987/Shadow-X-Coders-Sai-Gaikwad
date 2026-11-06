import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-[#0B5D43] animate-spin" />
        <p className="text-sm font-bold text-gray-600">Verifying HomeCrew access credentials...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to Auth with return path
  if (!currentUser && !userProfile) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const userRole = userProfile?.role || 'customer';

  // Role check
  if (!allowedRoles.includes(userRole)) {
    // If Admin, allow access or redirect gracefully
    if (userRole === 'admin') {
      return <>{children}</>;
    }

    // Role mismatch redirection
    const targetDashboard = userRole === 'worker' ? '/worker/dashboard' : '/customer/dashboard';
    
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-base font-heading font-black">Restricted Portal Access</h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            You are logged in as a <strong>{userRole.toUpperCase()}</strong>. You do not have permission to view this section.
          </p>
          <a
            href={targetDashboard}
            className="inline-block px-5 py-2.5 bg-[#0B5D43] hover:bg-[#084532] text-white rounded-xl text-xs font-bold transition-colors"
          >
            Go to Your {userRole === 'worker' ? 'Worker' : 'Customer'} Dashboard &rarr;
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
