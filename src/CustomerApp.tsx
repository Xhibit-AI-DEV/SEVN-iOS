import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router';
import { Toaster, toast } from 'sonner@2.0.3';
import { HomePage } from './components/HomePage';
import { LissyLanding } from './components/LissyLanding';
import { IntakeForm } from './components/IntakeForm';
import { WaitlistPage } from './components/WaitlistPage';
import { ProfilePage } from './components/ProfilePage';
import { MessagesPage } from './components/MessagesPage';
import { StylistsPage } from './components/StylistsPage';
import { projectId, publicAnonKey } from './utils/supabase/info';

function CustomerAppContent() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [customerData, setCustomerData] = useState<{
    name: string;
    email: string;
    contentfulId?: string;
  } | null>(null);

  // Debug: Log current path
  useEffect(() => {
    console.log('Current path:', window.location.pathname, window.location.hash);
  }, []);

  const handleImageUpload = async (file: File) => {
    console.log('📸 [CustomerApp.tsx] handleImageUpload called');
    console.log('📸 [CustomerApp.tsx] File received:', file);
    console.log('📸 [CustomerApp.tsx] File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    setUploadedImage(file);
    
    // Save to sessionStorage for persistence
    console.log('📸 [CustomerApp.tsx] Creating FileReader...');
    const reader = new FileReader();
    
    reader.onloadend = () => {
      console.log('📸 [CustomerApp.tsx] FileReader completed');
      const base64 = reader.result as string;
      console.log('📸 [CustomerApp.tsx] Base64 length:', base64.length);
      
      sessionStorage.setItem('lissy_uploaded_image', base64);
      sessionStorage.setItem('lissy_uploaded_image_name', file.name);
      sessionStorage.setItem('lissy_uploaded_image_type', file.type);
      
      console.log('✅ [CustomerApp.tsx] Image saved to sessionStorage:', file.name);
      console.log('✅ [CustomerApp.tsx] Verification - sessionStorage has:', {
        hasBase64: !!sessionStorage.getItem('lissy_uploaded_image'),
        name: sessionStorage.getItem('lissy_uploaded_image_name'),
        type: sessionStorage.getItem('lissy_uploaded_image_type')
      });
      
      // Navigate AFTER sessionStorage is written
      console.log('🚀 [CustomerApp.tsx] Navigating to /lissy/intake...');
      navigate('/lissy/intake');
    };
    
    reader.onerror = (error) => {
      console.error('❌ [CustomerApp.tsx] FileReader error:', error);
      console.error('❌ [CustomerApp.tsx] Reader state:', reader.readyState);
      toast.error('Failed to process image');
      // Still navigate even if sessionStorage fails
      navigate('/lissy/intake');
    };
    
    console.log('📸 [CustomerApp.tsx] Starting FileReader.readAsDataURL...');
    reader.readAsDataURL(file);
  };

  const handleIntakeSubmit = async (formData: any) => {
    console.log('Intake form submitted:', formData);
    setCustomerData({
      name: formData.name,
      email: formData.email,
    });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/submit-intake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Intake submission failed:', errorText);
        toast.error('Failed to submit intake form');
        return;
      }

      const data = await response.json();
      console.log('Intake submission successful:', data);
      
      // Navigate to waitlist
      navigate('/lissy/waitlist');
    } catch (error) {
      console.error('Intake submission error:', error);
      toast.error('Failed to submit intake form');
    }
  };

  return (
    <>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/lissy" element={<LissyLanding onImageUpload={handleImageUpload} />} />
        <Route path="/lissy/intake" element={<IntakeForm uploadedImage={null} onComplete={() => navigate('/lissy/waitlist')} />} />
        <Route path="/lissy/waitlist" element={<WaitlistPage customerName={customerData?.name} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/stylists" element={<StylistsPage />} />
        <Route path="/" element={<HomePage />} />
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
  return (
    <HashRouter>
      <CustomerAppContent />
    </HashRouter>
  );
}