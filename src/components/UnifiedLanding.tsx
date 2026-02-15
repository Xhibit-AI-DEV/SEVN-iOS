import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import { AdminDashboard } from './AdminDashboard';

/**
 * UnifiedLanding - Smart landing page that routes based on auth and role
 * - No auth → SignIn
 * - Everyone else → Customer Home (Featured Stylists)
 * 
 * Note: Admins/stylists access their dashboard through /admin-dashboard directly
 * When they click "Home" they should see the customer home view
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

    // Everyone else (including admin/stylist) stays on customer home
    console.log('🏠 Showing customer home view');
  }, [accessToken, userRole, navigate]);

  // While checking auth, show nothing (will redirect immediately if needed)
  if (!accessToken) {
    return null;
  }

  // Show customer home for everyone (including admins when they click Home)
  return <HomePage />;
}