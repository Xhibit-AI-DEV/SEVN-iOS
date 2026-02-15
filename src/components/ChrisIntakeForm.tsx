import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import svgPaths from "../imports/svg-ixy1f48tju";

interface ChrisIntakeFormProps {
  uploadedImage: File | null;
  onComplete: () => void;
  stylistId?: string; // Make it optional for backwards compatibility
}

const intakeQuestions = [
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
    question: "Anything else Chris should know?",
    placeholder: "Style preferences, sizing, colors...",
  },
];

export function ChrisIntakeForm({ uploadedImage, onComplete, stylistId }: ChrisIntakeFormProps) {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(uploadedImage);

  // Restore image from sessionStorage if not provided
  useEffect(() => {
    if (!mainImage && !uploadedImage) {
      const base64 = sessionStorage.getItem('chris_uploaded_image');
      const name = sessionStorage.getItem('chris_uploaded_image_name');
      const type = sessionStorage.getItem('chris_uploaded_image_type');
      
      if (base64 && name && type) {
        console.log('📦 Retrieving image from sessionStorage:', name);
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
  }, [uploadedImage, mainImage]);

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
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
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

        console.log('💾 Saving Chris intake form to backend...');
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
              stylistId: stylistId || 'chris_whly',
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
        console.log('✅ Order created:', order);

        const navigationState = {
          orderId: order.order_id,
          uploadedImageUrl: mainImageUrl,
          stylistId: stylistId || 'chris_whly',
        };

        console.log('🚀 Navigating to waitlist with state:', navigationState);

        // Navigate to waitlist page with order ID and image URL
        navigate('/chris/waitlist', { 
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
    setIsSubmitting(true);

    try {
      // Get auth token
      const authToken = localStorage.getItem('auth_token');
      const accessToken = localStorage.getItem('access_token');
      
      if (!authToken || !accessToken) {
        toast.error('Please sign in to continue');
        navigate('/signin');
        return;
      }

      // Validate that we have an uploaded image
      if (!mainImage) {
        toast.error('Please upload a photo to continue');
        setIsSubmitting(false);
        return;
      }

      console.log('📸 Starting upload process...');
      console.log('📸 Uploaded image:', mainImage.name, mainImage.type, mainImage.size);

      // Upload main image
      const mainImageFormData = new FormData();
      mainImageFormData.append('file', mainImage);

      console.log('📤 Sending main image to server...');

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
        console.error('Main image upload failed:', mainImageResponse.status, errorText);
        throw new Error(`Failed to upload main image: ${errorText}`);
      }

      const { url: mainImageUrl } = await mainImageResponse.json();
      console.log('Main image uploaded:', mainImageUrl);

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
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const { url } = await response.json();
          referenceImageUrls.push(url);
          console.log('Reference image uploaded:', url);
        }
      }

      // Prepare intake answers
      const intakeAnswers = intakeQuestions.reduce((acc, q) => {
        acc[q.question] = answers[q.id] || '';
        return acc;
      }, {} as Record<string, string>);

      console.log('📝 Submitting order with:', {
        stylistId: stylistId || 'chris_whly',
        mainImageUrl,
        referenceImagesCount: referenceImageUrls.length,
        intakeAnswers,
      });

      // Create order
      const orderResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            stylistId: stylistId || 'chris_whly', // Chris Whly's stylist ID
            mainImageUrl,
            referenceImages: referenceImageUrls,
            intakeAnswers: intakeAnswers,
          }),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await orderResponse.json();
      console.log('✅ Order created:', order);
      console.log('📸 Main image URL being passed to waitlist:', mainImageUrl);

      toast.success('Request submitted! Chris will review your style request.');
      
      // Navigate with the uploaded image URL and order ID in state
      navigate('/chris/waitlist', { 
        state: { 
          uploadedImageUrl: mainImageUrl,
          orderId: order.order_id 
        } 
      });
    } catch (error: any) {
      console.error('Error submitting intake:', error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              Upload additional images to help Chris understand your style better.
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