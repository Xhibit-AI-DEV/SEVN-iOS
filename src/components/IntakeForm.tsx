import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface IntakeFormProps {
  uploadedImage: File | null;
  onComplete?: () => void;
}

const intakeQuestions = [
  {
    id: 1,
    question: "What's your style goal?",
    placeholder: "e.g., Elevated minimalist, Refined casual...",
  },
  {
    id: 2,
    question: "What occasions are you styling for?",
    placeholder: "e.g., Work events, Weekend outings, Special occasions...",
  },
  {
    id: 3,
    question: "Preferred brands or aesthetic?",
    placeholder: "e.g., Classic, Contemporary, Timeless...",
  },
  {
    id: 4,
    question: "Budget range?",
    placeholder: "e.g., $500-1000, Flexible...",
  },
  {
    id: 5,
    question: "Anything else Lissy should know?",
    placeholder: "Style preferences, sizing, colors...",
  },
];

export function IntakeForm({ uploadedImage, onComplete }: IntakeFormProps) {
  const navigate = useNavigate();
  const hasInitializedImage = useRef(false);
  const mainImageRef = useRef<File | null>(uploadedImage);
  // Store base64 as backup for reliable reconstruction
  const mainImageBase64Ref = useRef<string | null>(null);
  const mainImageNameRef = useRef<string | null>(null);
  const mainImageTypeRef = useRef<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(uploadedImage);
  const [imageCheckComplete, setImageCheckComplete] = useState(false);

  // DEBUG: Check sessionStorage immediately
  console.log('🔍 [DEBUG] IntakeForm component rendering...');
  console.log('🔍 [DEBUG] uploadedImage prop:', uploadedImage);
  console.log('🔍 [DEBUG] mainImage state:', mainImage);
  console.log('🔍 [DEBUG] sessionStorage.lissy_uploaded_image exists:', !!sessionStorage.getItem('lissy_uploaded_image'));
  console.log('🔍 [DEBUG] sessionStorage.lissy_uploaded_image_name:', sessionStorage.getItem('lissy_uploaded_image_name'));
  console.log('🔍 [DEBUG] sessionStorage.lissy_uploaded_image_type:', sessionStorage.getItem('lissy_uploaded_image_type'));

  // Restore image from sessionStorage if not provided
  useEffect(() => {
    if (hasInitializedImage.current) {
      console.log('🔍 Image already initialized, skipping...');
      return;
    }

    console.log('🔍 IntakeForm mounted - checking for image...');
    console.log('uploadedImage prop:', uploadedImage);
    console.log('mainImage state:', mainImage);
    
    if (!mainImage && !uploadedImage) {
      const base64 = sessionStorage.getItem('lissy_uploaded_image');
      const name = sessionStorage.getItem('lissy_uploaded_image_name');
      const type = sessionStorage.getItem('lissy_uploaded_image_type');
      
      console.log('📦 Checking sessionStorage:', { hasBase64: !!base64, name, type });
      
      if (base64 && name && type) {
        console.log('📦 Storing base64 data in refs for later reconstruction');
        
        // Store the raw data in refs for reliable reconstruction later
        mainImageBase64Ref.current = base64;
        mainImageNameRef.current = name;
        mainImageTypeRef.current = type;
        
        // Also create a File for display purposes
        fetch(base64)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], name, { 
              type: type,
              lastModified: Date.now()
            });
            
            console.log('✅ File created for display:', file.name, file.size, 'bytes');
            
            setMainImage(file);
            mainImageRef.current = file;
            setImageCheckComplete(true);
            hasInitializedImage.current = true;
          })
          .catch(err => {
            console.error('❌ Failed to restore image:', err);
            setImageCheckComplete(true);
            hasInitializedImage.current = true;
            toast.error('Please upload a photo to continue');
            navigate('/lissy');
          });
      } else {
        console.warn('⚠️ No image found in sessionStorage or props');
        setImageCheckComplete(true);
        hasInitializedImage.current = true;
        toast.error('Please upload a photo to get started');
        navigate('/lissy');
      }
    } else if (uploadedImage) {
      console.log('✅ Using uploadedImage prop:', uploadedImage.name);
      setMainImage(uploadedImage);
      mainImageRef.current = uploadedImage;
      
      // Also store as base64 for backup
      const reader = new FileReader();
      reader.onload = () => {
        mainImageBase64Ref.current = reader.result as string;
        mainImageNameRef.current = uploadedImage.name;
        mainImageTypeRef.current = uploadedImage.type;
      };
      reader.readAsDataURL(uploadedImage);
      
      setImageCheckComplete(true);
      hasInitializedImage.current = true;
    } else {
      console.log('✅ mainImage already set:', mainImage?.name);
      setImageCheckComplete(true);
      hasInitializedImage.current = true;
    }
  }, [uploadedImage, navigate]);

  // Safety check: ensure currentQuestion is within bounds
  useEffect(() => {
    if (currentQuestion >= intakeQuestions.length) {
      console.error('⚠️ currentQuestion index out of bounds, resetting to 0');
      setCurrentQuestion(0);
    }
  }, [currentQuestion]);

  // Don't render the form until we've checked for the image
  if (!imageCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).slice(0, 4 - referenceImages.length);
      setReferenceImages([...referenceImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
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
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          console.error('❌ No access token found');
          toast.error('Please sign in to continue');
          navigate('/signin');
          setIsSubmitting(false);
          return;
        }
        
        console.log('🔐 Access token found, length:', accessToken.length);

        // CRITICAL: Validate main image exists before attempting upload
        // First try to use the existing File object
        let imageToUpload = mainImageRef.current || mainImage;
        
        console.log('🔍 [PRE-UPLOAD CHECK] mainImage state:', mainImage);
        console.log('🔍 [PRE-UPLOAD CHECK] mainImageRef.current:', mainImageRef.current);
        console.log('🔍 [PRE-UPLOAD CHECK] imageToUpload (initial):', imageToUpload);
        console.log('🔍 [PRE-UPLOAD CHECK] Has base64 backup:', !!mainImageBase64Ref.current);
        
        // If the File is null but we have base64 data, reconstruct it
        if ((!imageToUpload || !(imageToUpload instanceof File)) && mainImageBase64Ref.current) {
          console.log('🔧 Reconstructing File from base64 backup...');
          
          try {
            // Convert base64 to Blob synchronously using Response API
            const base64Response = await fetch(mainImageBase64Ref.current);
            const blob = await base64Response.blob();
            
            // Create a new File from the blob
            imageToUpload = new File(
              [blob], 
              mainImageNameRef.current || 'image.jpg',
              { 
                type: mainImageTypeRef.current || 'image/jpeg',
                lastModified: Date.now()
              }
            );
            
            console.log('✅ File reconstructed:', {
              name: imageToUpload.name,
              size: imageToUpload.size,
              type: imageToUpload.type,
              instanceof_File: imageToUpload instanceof File
            });
            
          } catch (err) {
            console.error('❌ Failed to reconstruct File from base64:', err);
            toast.error('Failed to prepare image for upload');
            setIsSubmitting(false);
            return;
          }
        }
        
        // Final validation
        if (!imageToUpload || !(imageToUpload instanceof File)) {
          console.error('❌ No main image found or invalid!');
          console.error('mainImage:', mainImage);
          console.error('mainImageRef.current:', mainImageRef.current);
          console.error('uploadedImage prop:', uploadedImage);
          console.error('base64Ref:', !!mainImageBase64Ref.current);
          toast.error('Please upload a photo to continue');
          setIsSubmitting(false);
          navigate('/lissy'); // Redirect back to upload
          return;
        }

        console.log('💾 Saving intake form to backend...');
        console.log('📸 Main image:', imageToUpload.name, imageToUpload.type, imageToUpload.size, 'bytes');

        // Upload main image - Send base64 data directly
        console.log('📤 Sending base64 data to server...');
        
        // We already have base64 in the ref, or convert the File to base64
        let base64Data = mainImageBase64Ref.current;
        if (!base64Data) {
          // If somehow we don't have base64, read from the File
          const reader = new FileReader();
          base64Data = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageToUpload);
          });
        }
        
        console.log('📤 Base64 data length:', base64Data.length);
        
        const mainImageResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/upload`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              base64: base64Data,
              fileName: imageToUpload.name,
              fileType: imageToUpload.type,
            }),
          }
        );

        if (!mainImageResponse.ok) {
          const errorText = await mainImageResponse.text();
          console.error('❌ Upload failed:', mainImageResponse.status, errorText);
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

        // Create intake answers object
        const intakeAnswers: Record<string, string> = {};
        intakeQuestions.forEach((question) => {
          intakeAnswers[`q${question.id}`] = answers[question.id] || '';
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
              stylistId: 'lissy_roddy',
              mainImageUrl,
              referenceImages: referenceImageUrls,
              intakeAnswers,
              status: 'intake_submitted', // Initial status
            }),
          }
        );

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || 'Failed to create order');
        }

        const order = await orderResponse.json();
        console.log('✅ Order created:', order);

        // Navigate to waitlist page with order data
        const navigationState = {
          orderId: order.order_id,
          uploadedImageUrl: mainImageUrl,
          stylistId: 'lissy_roddy',
        };

        console.log('🚀 Navigating to waitlist with state:', navigationState);
        
        navigate('/lissy/waitlist', { state: navigationState });
        
        console.log('✅ Navigation command executed');
      } catch (error: any) {
        console.error('❌ Error saving intake:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error message:', error.message);
        toast.error(error.message || 'Failed to save. Please try again.');
        // Don't navigate away on error - stay on the form
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentAnswer = answers[intakeQuestions[currentQuestion].id] || '';
  const isLastQuestion = currentQuestion === intakeQuestions.length - 1;
  const canProceed = currentAnswer.trim().length > 0;

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white h-[48px] w-full relative z-50">
        <div className="h-full flex items-center justify-between px-4 max-w-[393px] mx-auto">
          {/* Back button aligned left */}
          <button
            onClick={() => navigate('/lissy')}
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
              Upload additional images to help Lissy understand your style better.
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
          onClick={isLastQuestion ? handleNext : handleNext}
          disabled={!canProceed || (isLastQuestion && isSubmitting)}
          className="w-full h-[52px] bg-[#1E1709] rounded-[12px] font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[2px] text-white uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2A2315] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              LOADING...
            </>
          ) : isLastQuestion ? (
            'NEXT'
          ) : (
            'NEXT'
          )}
        </button>
      </div>
    </div>
  );
}