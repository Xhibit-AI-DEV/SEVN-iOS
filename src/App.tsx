import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router';
import { Toaster } from 'sonner@2.0.3';
import { SplashScreen } from '@capacitor/splash-screen';
import { HomePage } from './components/HomePage';
import { StylistsPage } from './components/StylistsPage';
import { MessagesPage } from './components/MessagesPage';
import { MessageDetailPage } from './components/MessageDetailPage';
import { CustomerOrderView } from './components/CustomerOrderView';
import { ProfilePage } from './components/ProfilePage';
import { LissyLanding } from './components/LissyLanding';
import { IntakeForm } from './components/IntakeForm';
import { WaitlistPage } from './components/WaitlistPage';
import { ChrisLanding } from './components/ChrisLanding';
import { ChrisIntakeForm } from './components/ChrisIntakeForm';
import { ChrisWaitlistPage } from './components/ChrisWaitlistPage';
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
import { ProtectedRoute } from './components/ProtectedRoute';
import { DebugApiTest } from './components/DebugApiTest';
import { DebugAuth } from './components/DebugAuth';
import { PasswordReset } from './components/PasswordReset';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import { ChangeEmailPage } from './components/ChangeEmailPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { BlockedAccountsPage } from './components/BlockedAccountsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { HelpContactPage } from './components/HelpContactPage';
import { DebugOrders } from './components/DebugOrders';
import { SimpleDebug } from './components/SimpleDebug';
import { projectId, publicAnonKey } from './utils/supabase/info';

/**
 * ADMIN APP - For stylist workspace
 * Deploy this to admin.sevn.app or your admin domain
 * 
 * For customer-facing app (sevn.app/lissy), use CustomerApp.tsx instead
 */

function AppContent() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [chrisUploadedImage, setChrisUploadedImage] = useState<File | null>(null);

  const handleImageUpload = (file: File) => {
    console.log('📸 [App.tsx] handleImageUpload called');
    console.log('📸 [App.tsx] File received:', file);
    console.log('📸 [App.tsx] File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    setUploadedImage(file);
    
    // Save to sessionStorage for persistence
    console.log('📸 [App.tsx] Creating FileReader...');
    const reader = new FileReader();
    
    reader.onloadend = () => {
      console.log('📸 [App.tsx] FileReader completed');
      const base64 = reader.result as string;
      console.log('📸 [App.tsx] Base64 length:', base64.length);
      
      sessionStorage.setItem('lissy_uploaded_image', base64);
      sessionStorage.setItem('lissy_uploaded_image_name', file.name);
      sessionStorage.setItem('lissy_uploaded_image_type', file.type);
      
      console.log('✅ [App.tsx] Image saved to sessionStorage:', file.name);
      console.log('✅ [App.tsx] Verification - sessionStorage has:', {
        hasBase64: !!sessionStorage.getItem('lissy_uploaded_image'),
        name: sessionStorage.getItem('lissy_uploaded_image_name'),
        type: sessionStorage.getItem('lissy_uploaded_image_type')
      });
      
      // Navigate AFTER sessionStorage is written
      console.log(' [App.tsx] Navigating to /lissy/intake...');
      navigate('/lissy/intake');
    };
    
    reader.onerror = (error) => {
      console.error('❌ [App.tsx] FileReader error:', error);
      console.error('❌ [App.tsx] Reader state:', reader.readyState);
      // Still navigate even if sessionStorage fails
      navigate('/lissy/intake');
    };
    
    console.log('📸 [App.tsx] Starting FileReader.readAsDataURL...');
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

  const handleIntakeComplete = () => {
    // IntakeForm handles its own navigation with state - no need to navigate here
    console.log('✅ Intake complete - form will handle navigation');
  };

  const handleChrisIntakeComplete = () => {
    // ChrisIntakeForm handles its own navigation with state - no need to navigate here
    console.log('✅ Chris intake complete - form will handle navigation');
  };

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/debug" element={<DebugApiTest />} />
        <Route path="/debug-auth" element={<DebugAuth />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/simple-debug" element={<SimpleDebug />} />
        
        {/* Protected routes - require sign in */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/stylists" element={<ProtectedRoute><StylistsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/message-detail/:orderId" element={<ProtectedRoute><MessageDetailPage /></ProtectedRoute>} />
        <Route path="/order/:orderId" element={<ProtectedRoute><CustomerOrderView /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/change-email" element={<ProtectedRoute><ChangeEmailPage /></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<ProtectedRoute><PrivacyPolicyPage /></ProtectedRoute>} />
        <Route path="/terms-of-service" element={<ProtectedRoute><TermsOfServicePage /></ProtectedRoute>} />
        <Route path="/blocked-accounts" element={<ProtectedRoute><BlockedAccountsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/help-contact" element={<ProtectedRoute><HelpContactPage /></ProtectedRoute>} />
        <Route path="/lissy" element={<ProtectedRoute><LissyLanding onImageUpload={handleImageUpload} /></ProtectedRoute>} />
        <Route path="/lissy/intake" element={<ProtectedRoute><IntakeForm uploadedImage={null} onComplete={handleIntakeComplete} /></ProtectedRoute>} />
        <Route path="/lissy/waitlist" element={<ProtectedRoute><WaitlistPage /></ProtectedRoute>} />
        <Route path="/lissy/intake/edit/:orderId" element={<ProtectedRoute><EditIntakeForm /></ProtectedRoute>} />
        <Route path="/chris" element={<ProtectedRoute><ChrisLanding onImageUpload={handleChrisImageUpload} /></ProtectedRoute>} />
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
        
        {/* Universal intake form by username */}
        <Route path="/intake/:username" element={<ProtectedRoute><IntakeFormPage /></ProtectedRoute>} />
        
        {/* Universal waitlist by username */}
        <Route path="/u/:username/waitlist" element={<ProtectedRoute><GenericWaitlistPage /></ProtectedRoute>} />
        
        <Route path="/edit/:editId" element={<ProtectedRoute><EditDetailPage /></ProtectedRoute>} />
        <Route path="/create-edit" element={<ProtectedRoute><CreateEditPage /></ProtectedRoute>} />
        <Route path="/create-edit/:editId" element={<ProtectedRoute><CreateEditPage /></ProtectedRoute>} />
        <Route path="/customer-inbox" element={<ProtectedRoute><CustomerInboxPage /></ProtectedRoute>} />
        <Route path="/debug-orders" element={<ProtectedRoute><DebugOrders /></ProtectedRoute>} />
        <Route path="/rory-selects/:editId" element={<ProtectedRoute><RorySelectsDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-profile-fix" element={<ProtectedRoute><AdminProfileFix /></ProtectedRoute>} />
        
        {/* Catch all - redirect to home (which will redirect to signin if not authenticated) */}
        <Route path="*" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default function App() {
  // Hide splash screen when app loads
  SplashScreen.hide().catch(err => console.log('Splash screen already hidden'));
  
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}