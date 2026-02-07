import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const authToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    
    if (!authToken) {
      // No token, redirect to sign in
      console.log('🔐 ProtectedRoute: No auth token found');
      setIsVerifying(false);
      navigate('/signin');
      return;
    }

    try {
      console.log('🔐 ProtectedRoute: Verifying auth with token...');
      console.log('🔐 Token preview:', authToken.substring(0, 20) + '...');
      
      // Verify token with backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('🔐 ProtectedRoute: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ProtectedRoute: Auth verified:', data);
        
        // Update localStorage with latest user info
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_name', data.name || '');
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('access_token', authToken); // Ensure both tokens are set
        localStorage.setItem('auth_token', authToken);
        
        setIsAuthenticated(true);
        setIsVerifying(false);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ ProtectedRoute: Auth verification failed:', {
          status: response.status,
          code: errorData.code || response.status,
          message: errorData.error || errorData.message || 'Authentication failed'
        });
        
        // Token invalid or expired - clear everything
        console.log('🧹 Clearing auth data and redirecting to sign in...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_id');
        
        setIsVerifying(false);
        navigate('/signin');
      }
    } catch (error) {
      console.error('❌ ProtectedRoute: Network error verifying auth:', error);
      
      // Don't redirect immediately on network error - allow user to try again
      // Instead, check if we have recent auth data
      const hasRecentAuth = localStorage.getItem('user_id') && localStorage.getItem('user_email');
      
      if (hasRecentAuth) {
        console.log('⚠️ ProtectedRoute: Network error but have cached auth, allowing access');
        setIsAuthenticated(true);
        setIsVerifying(false);
      } else {
        console.log('❌ ProtectedRoute: No cached auth, redirecting to sign in');
        setIsVerifying(false);
        navigate('/signin');
      }
    }
  };

  if (isVerifying) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e1709]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}