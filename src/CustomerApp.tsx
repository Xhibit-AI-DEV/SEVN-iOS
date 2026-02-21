import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner@2.0.3';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { Capacitor } from '@capacitor/core';

/* CRITICAL: Import Tailwind styles */
import './styles/globals.css';

import HomePage from './components/HomePage';
import { StylistsPage } from './components/StylistsPage';
import { MessagesPage } from './components/MessagesPage';
import { MessageDetailPage } from './components/MessageDetailPage';
import { CustomerOrderView } from './components/CustomerOrderView';
import { ProfilePage } from './components/ProfilePage';
import { LissyLanding } from './components/LissyLanding';
import { LewisLanding } from './components/LewisLanding';
import { DorianLanding } from './components/DorianLanding';
import { IntakeForm } from './components/IntakeForm';
import { WaitlistPage } from './components/WaitlistPage';
import { ChrisLanding } from './components/ChrisLanding';
import { ChrisIntakeForm } from './components/ChrisIntakeForm';
import { ChrisWaitlistPage } from './components/ChrisWaitlistPage';
import { LewisWaitlistPage } from './components/LewisWaitlistPage';
import { DorianWaitlistPage } from './components/DorianWaitlistPage';
import { GenericWaitlistPage } from './components/GenericWaitlistPage';
import { EditIntakeForm } from './components/EditIntakeForm';
import { EditDetailPage } from './components/EditDetailPage';
import { CreateEditPage } from './components/CreateEditPage';
import { CustomerInboxPage } from './components/CustomerInboxPage';
import { IntakeFormPage } from './components/IntakeFormPage';
import { RorySelectsDetail } from './components/RorySelectsDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminProfileFix } from './components/AdminProfileFix';
import { SignIn } from './components/SignIn';
import { DebugApiTest } from './components/DebugApiTest';
import { DebugAuth } from './components/DebugAuth';
import { PasswordReset } from './components/PasswordReset';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import { ChangeEmailPage } from './components/ChangeEmailPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { AboutPage } from './components/AboutPage';
import { BlockedAccountsPage } from './components/BlockedAccountsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { HelpContactPage } from './components/HelpContactPage';
import { DebugOrders } from './components/DebugOrders';
import { SimpleDebug } from './components/SimpleDebug';
import { UnifiedLanding } from './components/UnifiedLanding';
import { AdminCleanupPage } from './components/AdminCleanupPage';
import { IOSLayoutTest } from './components/IOSLayoutTest';
import { SimpleHeightTest } from './components/SimpleHeightTest';
import { DebugOrderCreation } from './components/DebugOrderCreation';
import CreateChrisAccount from './components/CreateChrisAccount';
import { projectId, publicAnonKey } from './utils/supabase/info';

/**
 * UNIFIED APP - Combines customer and admin/stylist features
 * Role-based routing:
 * - "customer" role: sees customer features (intake, waitlist, messages, profile)
 * - "admin" or "stylist" role: sees admin features (workspace, customer list, edits)
 * - Public routes: signin, password reset, etc.
 */

// Simple loading screen
function LoadingScreen() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-[24px] font-['Helvetica_Neue:Regular',sans-serif] tracking-[3px] mb-4">SEVN</h1>
        <p className="text-sm text-gray-600">Loading...</p>
        <p className="text-xs text-red-600 mt-4 font-bold">BUILD v2.11.2025.1 - CUSTOMER INBOX + 9Q INTAKE</p>
      </div>
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white px-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4 text-center">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const navigate = useNavigate();
  const [lissyUploadedImage, setLissyUploadedImage] = useState<File | null>(null);
  const [chrisUploadedImage, setChrisUploadedImage] = useState<File | null>(null);
  const [lewisUploadedImage, setLewisUploadedImage] = useState<File | null>(null);
  const [dorianUploadedImage, setDorianUploadedImage] = useState<File | null>(null);
  const [customerData, setCustomerData] = useState<{
    name: string;
    email: string;
    contentfulId?: string;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      const role = localStorage.getItem('user_role');
      
      console.log('🔐 Auth check:', { hasToken: !!authToken, role });
      console.log('🔐 Full localStorage:', {
        auth_token: !!localStorage.getItem('auth_token'),
        access_token: !!localStorage.getItem('access_token'),
        user_role: localStorage.getItem('user_role'),
        user_email: localStorage.getItem('user_email'),
        user_id: localStorage.getItem('user_id'),
      });
      
      // Set auth state immediately - don't wait
      setIsAuthenticated(!!authToken);
      setUserRole(role || 'customer');
    };

    // Check auth on mount
    checkAuth();

    // Listen for auth changes (triggered from SignIn component)
    const handleAuthChange = () => {
      console.log('🔄 Auth changed - re-checking authentication');
      checkAuth();
    };

    window.addEventListener('authChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  // Debug: Log current path
  useEffect(() => {
    console.log('📍 Current path:', window.location.pathname, window.location.hash);
    console.log('📍 Current href:', window.location.href);
  }, []);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  // Protected route wrapper - requires authentication only
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!isAuthenticated) {
      return <SignIn />;
    }
    return children;
  };

  // Admin-only route wrapper - requires admin or stylist role
  const AdminRoute = ({ children }: { children: React.ReactElement }) => {
    if (!isAuthenticated) {
      return <SignIn />;
    }
    if (userRole !== 'admin' && userRole !== 'stylist') {
      // Redirect non-admin users to home
      return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white px-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4 text-center">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Go to Home
          </button>
        </div>
      );
    }
    return children;
  };

  const handleImageUpload = async (file: File) => {
    setLissyUploadedImage(file);
    console.log('📸 [App] Lissy image uploaded:', file.name, file.type, file.size);
    
    // Save to sessionStorage for persistence
    console.log('📸 [App] Creating FileReader...');
    const reader = new FileReader();
    
    reader.onloadend = () => {
      console.log('📸 [App] FileReader completed');
      const base64 = reader.result as string;
      console.log('📸 [App] Base64 length:', base64.length);
      
      sessionStorage.setItem('lissy_uploaded_image', base64);
      sessionStorage.setItem('lissy_uploaded_image_name', file.name);
      sessionStorage.setItem('lissy_uploaded_image_type', file.type);
      
      console.log('✅ [App] Lissy image saved to sessionStorage:', file.name);
      
      // Navigate AFTER sessionStorage is written
      navigate('/lissy/intake');
    };
    
    reader.onerror = (error) => {
      console.error('❌ [App] FileReader error:', error);
      console.error('❌ [App] Reader state:', reader.readyState);
      toast.error('Failed to process image');
      // Still navigate even if sessionStorage fails
      navigate('/lissy/intake');
    };
    
    console.log('📸 [App] Starting FileReader.readAsDataURL...');
    reader.readAsDataURL(file);
  };

  const handleChrisImageUpload = (file: File) => {
    setChrisUploadedImage(file);
    console.log('📸 Chris image uploaded:', file.name, file.type, file.size);
    
    // Save to sessionStorage for persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      sessionStorage.setItem('chris_uploaded_image', base64);
      sessionStorage.setItem('chris_uploaded_image_name', file.name);
      sessionStorage.setItem('chris_uploaded_image_type', file.type);
      console.log('✅ Chris image saved to sessionStorage:', file.name);
      
      // Navigate AFTER sessionStorage is written
      navigate('/chris/intake');
    };
    reader.onerror = (error) => {
      console.error('❌ Failed to save Chris image to sessionStorage:', error);
      // Still navigate even if sessionStorage fails
      navigate('/chris/intake');
    };
    reader.readAsDataURL(file);
  };

  const handleLewisImageUpload = (file: File) => {
    setLewisUploadedImage(file);
    console.log('📸 Lewis image uploaded:', file.name, file.type, file.size);
    
    // Save to sessionStorage for persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      sessionStorage.setItem('lewis_uploaded_image', base64);
      sessionStorage.setItem('lewis_uploaded_image_name', file.name);
      sessionStorage.setItem('lewis_uploaded_image_type', file.type);
      console.log('✅ Lewis image saved to sessionStorage:', file.name);
      
      // Navigate AFTER sessionStorage is written
      navigate('/lewis/intake');
    };
    reader.onerror = (error) => {
      console.error('❌ Failed to save Lewis image to sessionStorage:', error);
      // Still navigate even if sessionStorage fails
      navigate('/lewis/intake');
    };
    reader.readAsDataURL(file);
  };

  const handleDorianImageUpload = (file: File) => {
    setDorianUploadedImage(file);
    console.log('📸 Dorian image uploaded:', file.name, file.type, file.size);
    
    // Save to sessionStorage for persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      sessionStorage.setItem('dorian_uploaded_image', base64);
      sessionStorage.setItem('dorian_uploaded_image_name', file.name);
      sessionStorage.setItem('dorian_uploaded_image_type', file.type);
      console.log('✅ Dorian image saved to sessionStorage:', file.name);
      
      // Navigate AFTER sessionStorage is written
      navigate('/dorian/intake');
    };
    reader.onerror = (error) => {
      console.error('❌ Failed to save Dorian image to sessionStorage:', error);
      // Still navigate even if sessionStorage fails
      navigate('/dorian/intake');
    };
    reader.readAsDataURL(file);
  };

  const handleIntakeComplete = () => {
    // IntakeForm handles its own navigation with state - no need to navigate here
    console.log('✅ Intake complete - form will handle navigation');
  };

  const handleChrisIntakeComplete = () => {
    // ChrisIntakeForm handles its own navigation with state - no need to navigate here
    console.log('✅ Chris intake complete - form will handle navigation');
  };

  const handleLewisIntakeComplete = () => {
    // LewisIntakeForm handles its own navigation with state - no need to navigate here
    console.log('✅ Lewis intake complete - form will handle navigation');
  };

  const handleDorianIntakeComplete = () => {
    // DorianIntakeForm handles its own navigation with state - no need to navigate here
    console.log('✅ Dorian intake complete - form will handle navigation');
  };

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES - No authentication required */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/debug" element={<DebugApiTest />} />
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path="/debug-orders" element={<AdminRoute><DebugOrders /></AdminRoute>} />
        <Route path="/debug-order-creation" element={<ProtectedRoute><DebugOrderCreation /></ProtectedRoute>} />
        <Route path="/simple-debug" element={<SimpleDebug />} />
        <Route path="/ios-test" element={<IOSLayoutTest />} />
        <Route path="/height-test" element={<SimpleHeightTest />} />
        
        {/* SHARED ROUTES - Accessible by all authenticated users */}
        <Route path="/" element={
          <ErrorBoundary>
            <UnifiedLanding />
          </ErrorBoundary>
        } />
        <Route path="/home" element={
          <ErrorBoundary>
            <UnifiedLanding />
          </ErrorBoundary>
        } />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/change-email" element={<ProtectedRoute><ChangeEmailPage /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Public legal pages - no authentication required */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/help-contact" element={<ProtectedRoute><HelpContactPage /></ProtectedRoute>} />
        
        {/* CUSTOMER ROUTES - Accessible by customers (and admins can see them too) */}
        <Route path="/stylists" element={<ProtectedRoute><StylistsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/message-detail/:orderId" element={<ProtectedRoute><MessageDetailPage /></ProtectedRoute>} />
        <Route path="/order/:orderId" element={<ProtectedRoute><CustomerOrderView /></ProtectedRoute>} />
        
        {/* INTAKE FLOWS - Public access to landing pages, protected for forms */}
        <Route path="/lissy" element={<ProtectedRoute><LissyLanding onImageUpload={handleImageUpload} /></ProtectedRoute>} />
        <Route path="/lissy/intake" element={
          <ProtectedRoute>
            {lissyUploadedImage ? (
              <ChrisIntakeForm uploadedImage={lissyUploadedImage} onComplete={handleIntakeComplete} stylistId="lissy" />
            ) : (
              <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">No image uploaded</p>
                  <button 
                    onClick={() => navigate('/lissy')}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </ProtectedRoute>
        } />
        <Route path="/lissy/waitlist" element={<ProtectedRoute><WaitlistPage /></ProtectedRoute>} />
        <Route path="/lissy/intake/edit/:orderId" element={<ProtectedRoute><EditIntakeForm /></ProtectedRoute>} />
        
        <Route path="/chris" element={<ChrisLanding onImageUpload={handleChrisImageUpload} />} />
        <Route path="/chris/intake" element={
          <ProtectedRoute>
            {chrisUploadedImage ? (
              <ChrisIntakeForm uploadedImage={chrisUploadedImage} onComplete={handleChrisIntakeComplete} />
            ) : (
              <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">No image uploaded</p>
                  <button 
                    onClick={() => navigate('/chris')}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </ProtectedRoute>
        } />
        <Route path="/chris/waitlist" element={<ProtectedRoute><ChrisWaitlistPage /></ProtectedRoute>} />
        <Route path="/chris/intake/edit/:orderId" element={<ProtectedRoute><EditIntakeForm /></ProtectedRoute>} />
        
        <Route path="/lewis" element={<LewisLanding onImageUpload={handleLewisImageUpload} />} />
        <Route path="/lewis/intake" element={
          <ProtectedRoute>
            {lewisUploadedImage ? (
              <ChrisIntakeForm uploadedImage={lewisUploadedImage} onComplete={handleLewisIntakeComplete} stylistId="lewis" />
            ) : (
              <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">No image uploaded</p>
                  <button 
                    onClick={() => navigate('/lewis')}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </ProtectedRoute>
        } />
        <Route path="/lewis/waitlist" element={<ProtectedRoute><LewisWaitlistPage /></ProtectedRoute>} />
        <Route path="/lewis/intake/edit/:orderId" element={<ProtectedRoute><EditIntakeForm /></ProtectedRoute>} />
        
        <Route path="/dorian" element={<DorianLanding onImageUpload={handleDorianImageUpload} />} />
        <Route path="/dorian/intake" element={
          <ProtectedRoute>
            {dorianUploadedImage ? (
              <ChrisIntakeForm uploadedImage={dorianUploadedImage} onComplete={handleDorianIntakeComplete} stylistId="dorian" />
            ) : (
              <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">No image uploaded</p>
                  <button 
                    onClick={() => navigate('/dorian')}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </ProtectedRoute>
        } />
        <Route path="/dorian/waitlist" element={<ProtectedRoute><DorianWaitlistPage /></ProtectedRoute>} />
        <Route path="/dorian/intake/edit/:orderId" element={<ProtectedRoute><EditIntakeForm /></ProtectedRoute>} />
        
        {/* UNIVERSAL INTAKE FORMS - By username */}
        <Route path="/intake/:username" element={<ProtectedRoute><IntakeFormPage /></ProtectedRoute>} />
        <Route path="/u/:username/waitlist" element={<ProtectedRoute><GenericWaitlistPage /></ProtectedRoute>} />
        
        {/* ADMIN/STYLIST ONLY ROUTES */}
        <Route path="/admin" element={<AdminRoute><MessagesPage /></AdminRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><MessagesPage /></AdminRoute>} />
        <Route path="/admin-profile-fix" element={<AdminRoute><AdminProfileFix /></AdminRoute>} />
        <Route path="/blocked-accounts" element={<AdminRoute><BlockedAccountsPage /></AdminRoute>} />
        <Route path="/admin-cleanup" element={<AdminRoute><AdminCleanupPage /></AdminRoute>} />
        
        {/* CUSTOMER INBOX - Available to ALL authenticated users */}
        <Route path="/customer-inbox" element={<ProtectedRoute><CustomerInboxPage /></ProtectedRoute>} />
        
        {/* EDITS/POSTS - All authenticated users can create and view */}
        <Route path="/edit/:editId" element={<EditDetailPage />} />
        <Route path="/create-edit" element={<ProtectedRoute><CreateEditPage /></ProtectedRoute>} />
        <Route path="/create-edit/:editId" element={<ProtectedRoute><CreateEditPage /></ProtectedRoute>} />
        <Route path="/rory-selects/:editId" element={<RorySelectsDetail />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '14px',
            fontFamily: "'Helvetica Neue', sans-serif",
            maxWidth: '90vw',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          className: '',
          duration: 3000,
        }}
      />
    </>
  );
}

export default function CustomerApp() {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const initializeNativeFeatures = async () => {
      // Only run on native platforms
      if (Capacitor.isNativePlatform()) {
        try {
          // Configure Status Bar
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
          await StatusBar.show();
          
          console.log('✅ Status Bar configured');
        } catch (error) {
          console.error('❌ Error configuring Status Bar:', error);
        }

        try {
          // Get Safe Area insets
          const insets = await SafeArea.getSafeAreaInsets();
          setSafeAreaInsets(insets.insets);
          
          console.log('✅ Safe Area insets:', insets.insets);
          
          // Apply safe area insets as CSS variables
          document.documentElement.style.setProperty('--safe-area-top', `${insets.insets.top}px`);
          document.documentElement.style.setProperty('--safe-area-bottom', `${insets.insets.bottom}px`);
          document.documentElement.style.setProperty('--safe-area-left', `${insets.insets.left}px`);
          document.documentElement.style.setProperty('--safe-area-right', `${insets.insets.right}px`);
        } catch (error) {
          console.error('❌ Error getting Safe Area insets:', error);
        }
      } else {
        console.log('ℹ️ Running in web browser - Safe Area and Status Bar plugins skipped');
      }
    };

    initializeNativeFeatures();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}