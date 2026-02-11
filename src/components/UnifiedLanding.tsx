import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import HomePage from './HomePage';
import { AdminDashboard } from './AdminDashboard';

/**
 * UnifiedLanding - Smart landing page that routes based on auth and role
 * - No auth → SignIn
 * - Admin/Stylist → Admin Dashboard
 * - Customer → Customer Home (Featured Stylists)
 */
export function UnifiedLanding() {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  useEffect(() => {
    console.log('🏠 UnifiedLanding - Auth check:', { hasToken: !!accessToken, role: userRole });

    // Not authenticated → SignIn
    if (!accessToken) {
      console.log('🏠 No auth → /signin');
      navigate('/signin', { replace: true });
      return;
    }

    // Authenticated admin/stylist → Admin Dashboard
    if (userRole === 'admin' || userRole === 'stylist') {
      console.log('🏠 Admin/Stylist → /admin-dashboard');
      navigate('/admin-dashboard', { replace: true });
      return;
    }

    // Customer stays on this page (will show HomePage below)
    console.log('🏠 Customer → showing customer home');
  }, [accessToken, userRole, navigate]);

  // While checking auth, show nothing (will redirect immediately)
  if (!accessToken || userRole === 'admin' || userRole === 'stylist') {
    return null;
  }

  // Customer role → show customer home
  return <HomePage />;
}
