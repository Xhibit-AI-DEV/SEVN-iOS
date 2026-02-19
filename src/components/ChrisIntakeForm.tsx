import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import svgPaths from "../imports/svg-ixy1f48tju";
import { createClient } from '@supabase/supabase-js';

interface ChrisIntakeFormProps {
  uploadedImage: File | null;
  onComplete: () => void;
  stylistId?: string; // Make it optional for backwards compatibility
}

const getIntakeQuestions = (stylistName: string) => [
  {
    id: 1,
    question: "What's your style goal?",
    placeholder: "e.g., Bold street style, High fashion editorial...",
  },
  {
    id: 2,
    question: "What occasions are you styling for?",
    placeholder: "e.g., Night out, Fashion events, Daily wear...",
  },
  {
    id: 3,
    question: "Preferred brands or aesthetic?",
    placeholder: "e.g., Avant-garde, Streetwear luxury...",
  },
  {
    id: 4,
    question: "Budget range?",
    placeholder: "e.g., $500-1000, Flexible...",
  },
  {
    id: 5,
    question: `Anything else ${stylistName} should know?`,
    placeholder: "Style preferences, sizing, colors...",
  },
];

export function ChrisIntakeForm({ uploadedImage, onComplete, stylistId = 'chris' }: ChrisIntakeFormProps) {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(uploadedImage);

  // Get stylist name from stylistId
  const stylistName = stylistId === 'lewis' ? 'Lewis' : 
                      stylistId === 'lissy' ? 'Lissy' : 'Chris';
  
  // Map stylistId to actual backend stylist IDs
  const backendStylistId = stylistId === 'lewis' ? 'lewis_bloyce' :
                           stylistId === 'lissy' ? 'lissy_roddy' : 'chris_whly';
  
  // Get questions with dynamic stylist name
  const intakeQuestions = getIntakeQuestions(stylistName);

  // Restore image from sessionStorage if not provided
  useEffect(() => {
    if (!mainImage && !uploadedImage) {
      // Check for stylist-specific sessionStorage keys
      const storagePrefix = stylistId === 'lewis' ? 'lewis' : 
                           stylistId === 'lissy' ? 'lissy' : 'chris';
      
      const base64 = sessionStorage.getItem(`${storagePrefix}_uploaded_image`);
      const name = sessionStorage.getItem(`${storagePrefix}_uploaded_image_name`);
      const type = sessionStorage.getItem(`${storagePrefix}_uploaded_image_type`);
      
      if (base64 && name && type) {
        console.log(`📦 Retrieving ${stylistName}'s image from sessionStorage:`, name);
        // Convert base64 back to File
        fetch(base64)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], name, { type });
            setMainImage(file);
            console.log('✅ Image restored from sessionStorage:', file.name, file.size, 'bytes');
          })
          .catch(err => {
            console.error('Failed to restore image from sessionStorage:', err);
          });
      }
    } else if (uploadedImage) {
      setMainImage(uploadedImage);
    }
  }, [uploadedImage, mainImage, stylistId, stylistName]);

  // Safety check: ensure currentQuestion is within bounds
  useEffect(() => {
    if (currentQuestion >= intakeQuestions.length) {
      console.error('⚠️ currentQuestion index out of bounds, resetting to 0');
      setCurrentQuestion(0);
    }
  }, [currentQuestion]);

  // Guard: Don't render if currentQuestion is out of bounds
  if (currentQuestion >= intakeQuestions.length || currentQuestion < 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e1709]" />
      </div>
    );
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [intakeQuestions[currentQuestion].id]: value,
    });
  };

  const handleNext = async () => {
    // Dynamically check if we're on the last question
    const isOnLastQuestion = currentQuestion === intakeQuestions.length - 1;
    
    if (!isOnLastQuestion) {
      // Not on last question - just move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Last question - save to backend immediately with status "intake_submitted"
      setIsSubmitting(true);
      
      try {
        // Get access token from localStorage (set by SignIn.tsx)
        const accessToken = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
        
        if (!accessToken) {
          console.error('❌ No access token in localStorage');
          toast.error('Session expired. Please sign in again.');
          navigate('/signin');
          return;
        }
        
        console.log('✅ Using access token from localStorage');
        console.log('🔐 Token preview:', accessToken.substring(0, 20) + '...');
        
        // Validate main image exists
        if (!mainImage) {
          toast.error('Please upload a photo to continue');
          setIsSubmitting(false);
          return;
        }

        console.log('💾 Saving intake form to backend...');
        console.log('📸 Main image:', mainImage.name, mainImage.type);

        // Upload main image
        const mainImageFormData = new FormData();
        mainImageFormData.append('file', mainImage);

        console.log('📤 Uploading main image...');

        const mainImageResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: mainImageFormData,
          }
        );

        if (!mainImageResponse.ok) {
          const errorText = await mainImageResponse.text();
          console.error('❌ Upload failed:', errorText);
          throw new Error('Failed to upload main image');
        }

        const { url: mainImageUrl } = await mainImageResponse.json();
        console.log('✅ Main image uploaded:', mainImageUrl);

        // Upload reference images
        const referenceImageUrls: string[] = [];
        for (const image of referenceImages) {
          const formData = new FormData();
          formData.append('file', image);

          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/upload`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: formData,
            }
          );

          if (response.ok) {
            const { url } = await response.json();
            referenceImageUrls.push(url);
          }
        }

        console.log('✅ Reference images uploaded:', referenceImageUrls.length);

        // Create intake answers object
        const intakeAnswers: Record<string, string> = {};
        intakeQuestions.forEach((question) => {
          intakeAnswers[`q${question.id}`] = answers[question.id] || '';
        });

        console.log('📝 Creating order...');

        // Save to backend with status "intake_submitted"
        const orderResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/create`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              stylistId: backendStylistId,
              mainImageUrl,
              referenceImages: referenceImageUrls,
              intakeAnswers,
              status: 'intake_submitted', // Initial status
            }),
          }
        );

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          console.error('❌ Order creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create order');
        }

        const order = await orderResponse.json();
        console.log('✅ Order created successfully:', order);
        
        // Validate that we received an order_id
        if (!order || !order.order_id) {
          console.error('❌ Order response missing order_id:', order);
          throw new Error('Order created but no order ID returned');
        }

        const navigationState = {
          orderId: order.order_id,
          uploadedImageUrl: mainImageUrl,
          stylistId: backendStylistId,
        };

        console.log('🚀 Navigating to waitlist with state:', navigationState);

        // Persist to localStorage as backup in case of page refresh
        localStorage.setItem('pendingIntakeData', JSON.stringify(navigationState));

        // Navigate to waitlist page with order ID and image URL
        // Use the correct waitlist route based on stylist
        const waitlistRoute = stylistId === 'lewis' ? '/lewis/waitlist' :
                             stylistId === 'lissy' ? '/lissy/waitlist' : '/chris/waitlist';
        
        console.log('🚀 Navigating to:', waitlistRoute);
        toast.success(`Request submitted! ${stylistName} will review your style request.`);
        
        navigate(waitlistRoute, { 
          state: navigationState
        });
      } catch (error: any) {
        console.error('❌ Error saving intake:', error);
        toast.error(error.message || 'Failed to save. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReferenceImages([...referenceImages, ...files]);
  };

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (currentQuestion < intakeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit all answers
      setIsSubmitting(true);
      
      try {
        console.log('🚀 ========== SUBMITTING INTAKE FORM ==========');
        console.log('📋 Stylist:', stylistName, '(', backendStylistId, ')');
        console.log('📸 Main image:', mainImage?.name, mainImage?.type, mainImage?.size, 'bytes');
        console.log('📸 Reference images:', referenceImages.length);
        console.log('📝 Answers:', answers);
        
        // Get access token
        let accessToken: string | null = null;
        
        try {
          const supabase = createClient(projectId, publicAnonKey);
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session?.access_token) {
            accessToken = session.access_token;
            console.log('✅ Using access token from Supabase session');
          } else {
            console.log('⚠️ No Supabase session found');
          }
          
          if (sessionError) {
            console.log('⚠️ Session error, falling back to localStorage:', sessionError);
          }
        } catch (err) {
          console.error('❌ Error getting Supabase session:', err);
        }
        
        // Fall back to localStorage if no Supabase session
        if (!accessToken) {
          accessToken = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
          if (accessToken) {
            console.log('✅ Using access token from localStorage');
          }
        }
        
        if (!accessToken) {
          console.error('❌ No access token available');
          toast.error('Please sign in to continue');
          navigate('/signin');
          return;
        }

        // Validate main image exists
        if (!mainImage) {
          toast.error('Please upload a photo to continue');
          setIsSubmitting(false);
          return;
        }

        console.log('💾 Saving intake form to backend...');
        console.log('📸 Main image:', mainImage.name, mainImage.type);

        // Upload main image
        const mainImageFormData = new FormData();
        mainImageFormData.append('file', mainImage);

        console.log('📤 Uploading main image to /upload...');

        const mainImageResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: mainImageFormData,
          }
        );

        console.log('📥 Upload response status:', mainImageResponse.status, mainImageResponse.statusText);

        if (!mainImageResponse.ok) {
          const errorText = await mainImageResponse.text();
          console.error('❌ Upload failed:', errorText);
          throw new Error('Failed to upload main image: ' + errorText);
        }

        const uploadResult = await mainImageResponse.json();
        const mainImageUrl = uploadResult.url;
        console.log('✅ Main image uploaded:', mainImageUrl);

        // Upload reference images
        const referenceImageUrls: string[] = [];
        for (const image of referenceImages) {
          console.log('📤 Uploading reference image:', image.name);
          const formData = new FormData();
          formData.append('file', image);

          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/upload`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: formData,
            }
          );

          if (response.ok) {
            const { url } = await response.json();
            referenceImageUrls.push(url);
            console.log('✅ Reference image uploaded:', url);
          } else {
            const errorText = await response.text();
            console.error('❌ Reference image upload failed:', errorText);
          }
        }

        console.log('✅ All reference images uploaded:', referenceImageUrls.length);

        // Create intake answers object
        const intakeAnswers: Record<string, string> = {};
        intakeQuestions.forEach((question) => {
          intakeAnswers[`q${question.id}`] = answers[question.id] || '';
        });

        console.log('📝 Creating order...');
        console.log('📝 Order payload:', {
          stylistId: backendStylistId,
          mainImageUrl,
          referenceImagesCount: referenceImageUrls.length,
          intakeAnswersCount: Object.keys(intakeAnswers).length,
          status: 'intake_submitted',
        });

        // Save to backend with status "intake_submitted"
        const orderResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/create`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              stylistId: backendStylistId,
              mainImageUrl,
              referenceImages: referenceImageUrls,
              intakeAnswers,
              status: 'intake_submitted', // Initial status
            }),
          }
        );

        console.log('📥 Order response status:', orderResponse.status, orderResponse.statusText);

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Order creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create order');
        }

        const order = await orderResponse.json();
        console.log('✅ Order created successfully:', order);
        
        // Validate that we received an order_id
        if (!order || !order.order_id) {
          console.error('❌ Order response missing order_id:', order);
          throw new Error('Order created but no order ID returned. Response: ' + JSON.stringify(order));
        }

        const navigationState = {
          orderId: order.order_id,
          uploadedImageUrl: mainImageUrl,
          stylistId: backendStylistId,
        };

        console.log('🚀 Navigating to waitlist with state:', navigationState);

        // Persist to localStorage as backup in case of page refresh
        localStorage.setItem('pendingIntakeData', JSON.stringify(navigationState));
        console.log('💾 Saved to localStorage:', navigationState);

        // Navigate to waitlist page with order ID and image URL
        // Use the correct waitlist route based on stylist
        const waitlistRoute = stylistId === 'lewis' ? '/lewis/waitlist' :
                             stylistId === 'lissy' ? '/lissy/waitlist' : '/chris/waitlist';
        
        console.log('🚀 Navigating to:', waitlistRoute);
        toast.success(`Request submitted! ${stylistName} will review your style request.`);
        
        navigate(waitlistRoute, { 
          state: navigationState
        });
        console.log('🚀 ========== INTAKE FORM SUBMISSION COMPLETE ==========');
      } catch (error: any) {
        console.error('❌ ========== ERROR SUBMITTING INTAKE ==========');
        console.error('❌ Error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ ==========================================');
        toast.error(error.message || 'Failed to save. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentAnswer = answers[intakeQuestions[currentQuestion].id] || '';
  const isLastQuestion = currentQuestion === intakeQuestions.length - 1;
  const canProceed = currentAnswer.trim().length > 0;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-white">
      {/* Top Navigation Bar - matches other pages */}
      <div className="bg-white h-[48px] w-full relative z-50 border-b border-gray-100">
        <div className="h-full flex items-center justify-between px-4 max-w-[393px] mx-auto">
          {/* Back button aligned left */}
          <button
            onClick={() => navigate('/chris')}
            className="flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Center title */}
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
            INTAKE FORM
          </h1>
          
          {/* Empty right side for balance */}
          <div className="w-8" />
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-[393px] mx-auto px-4 py-8 pb-32">
        {/* Progress indicator */}
        <div className="mb-8">
          {/* Progress Text - Above bar with percentage */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] tracking-[1.5px] uppercase text-gray-400">
              STYLE INTAKE · {currentQuestion + 1} OF {intakeQuestions.length}
            </p>
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] tracking-[1.5px] uppercase text-gray-400">
              {Math.round(((currentQuestion + 1) / intakeQuestions.length) * 100)}%
            </p>
          </div>
          <div className="w-full h-[4px] bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#15120A] transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestion + 1) / intakeQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[16px] leading-[24px] tracking-[0.3px] text-[#1E1709] mb-4">
            {intakeQuestions[currentQuestion].question}
          </h2>
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={intakeQuestions[currentQuestion].placeholder}
            className="w-full min-h-[98px] p-4 border border-gray-200 rounded-[12px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709] placeholder:text-gray-400 placeholder:opacity-50 focus:outline-none focus:border-gray-300 resize-none bg-white/60 backdrop-blur-sm transition-colors"
          />
        </div>

        {/* Reference Images - only on last question */}
        {isLastQuestion && (
          <div className="mb-8">
            <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 uppercase">
              Additional Reference Images (Optional)
            </h3>
            <p className="font-['Helvetica_Neue:Light',sans-serif] text-[12px] text-[#1e1709]/60 mb-3">
              Upload additional images to help {stylistName} understand your style better.
            </p>
            
            <div className="flex gap-3 flex-wrap">
              {referenceImages.map((image, index) => (
                <div key={index} className="relative w-[100px] h-[100px] rounded-lg overflow-hidden border border-[#1e1709]/20">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Reference ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <label className="w-[100px] h-[100px] border border-[#1e1709]/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1e1709] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="#1e1709" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709]/60 mt-1">
                  Add Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Single Continue Button */}
        <button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="w-full h-[52px] bg-[#1E1709] rounded-[12px] font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[2px] text-white uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2A2315] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              LOADING...
            </>
          ) : (
            'NEXT'
          )}
        </button>
      </div>
    </div>
  );
}