import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import svgPaths from "../imports/svg-ixy1f48tju";

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
    question: "Anything else your stylist should know?",
    placeholder: "Style preferences, sizing, colors...",
  },
];

export function IntakeFormPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  
  // Stylist data loaded from username
  const [stylistData, setStylistData] = useState<any>(null);
  const [loadingStylist, setLoadingStylist] = useState(true);

  // Load stylist data from username
  useEffect(() => {
    const loadStylist = async () => {
      if (!username) {
        toast.error('Invalid stylist link');
        navigate('/');
        return;
      }

      try {
        setLoadingStylist(true);
        const accessToken = localStorage.getItem('access_token');
        
        console.log('🔍 Loading stylist by username:', username);
        
        // Fetch stylist profile by username
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/username/${username}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Stylist not found');
        }

        const data = await response.json();
        console.log('✅ Stylist loaded:', data);
        
        if (!data.profile) {
          throw new Error('Stylist profile not found');
        }

        setStylistData(data.profile);
      } catch (error: any) {
        console.error('❌ Error loading stylist:', error);
        toast.error(error.message || 'Stylist not found');
        navigate('/');
      } finally {
        setLoadingStylist(false);
      }
    };

    loadStylist();
  }, [username, navigate]);

  // Restore main image from sessionStorage on mount
  useEffect(() => {
    const savedImageUrl = sessionStorage.getItem('pendingIntakeImageUrl');
    const savedImageFile = sessionStorage.getItem('pendingIntakeImageFile');
    
    if (savedImageUrl) {
      console.log('🔄 Restored image URL from session:', savedImageUrl);
      setUploadedImageUrl(savedImageUrl);
    }
    
    if (savedImageFile) {
      // Reconstruct File object from stored data if possible
      console.log('🔄 Image file data found in session');
    }
  }, []);

  const handleFileUpload = async (file: File, type: 'main' | 'reference') => {
    try {
      console.log(`📤 Uploading ${type} image:`, file.name);
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in to upload images');
        navigate('/signin');
        return null;
      }

      const formData = new FormData();
      formData.append('image', file);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      console.log(`✅ ${type} image uploaded:`, result.url);
      return result.url;
    } catch (error: any) {
      console.error(`❌ Error uploading ${type} image:`, error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    }
  };

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setUploadedImageUrl(previewUrl);
      sessionStorage.setItem('pendingIntakeImageUrl', previewUrl);
      toast.success('Main image added!');
    }
  };

  const handleReferenceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (referenceImages.length + files.length > 4) {
      toast.error('Maximum 4 reference images allowed');
      return;
    }
    setReferenceImages([...referenceImages, ...files]);
    toast.success(`${files.length} reference image(s) added!`);
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestion];
    if (!currentAnswer || currentAnswer.trim() === '') {
      toast.error('Please answer the question before continuing');
      return;
    }
    
    if (currentQuestion < intakeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Last question - navigate to waitlist with ALL data (no backend save yet)
      console.log('📝 Navigating to waitlist page with intake data...');

      // Validate main image exists
      if (!mainImage && !uploadedImageUrl) {
        toast.error('Please upload a main style reference image');
        return;
      }

      if (!stylistData?.user_id) {
        toast.error('Stylist information not loaded');
        return;
      }

      // Create intake answers object
      const intakeAnswers: Record<string, string> = {};
      intakeQuestions.forEach((question, index) => {
        intakeAnswers[`q${index + 1}`] = answers[index] || '';
      });

      // Navigate to waitlist page with ALL data (no backend save yet)
      navigate(`/u/${username}/waitlist`, { 
        state: { 
          uploadedImage: mainImage,  // Pass the File object
          referenceImages,  // Pass the File array
          intakeAnswers,
          stylistId: stylistData.auth_user_id || stylistData.user_id,
          stylistUsername: stylistData.username,
          stylistDisplayName: stylistData.display_name,
        } 
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    for (let i = 0; i < intakeQuestions.length; i++) {
      if (!answers[i] || answers[i].trim() === '') {
        toast.error(`Please answer question ${i + 1}`);
        setCurrentQuestion(i);
        return;
      }
    }

    // Validate main image
    if (!mainImage && !uploadedImageUrl) {
      toast.error('Please upload a main style reference image');
      return;
    }

    if (!stylistData?.user_id) {
      toast.error('Stylist information not loaded');
      return;
    }

    try {
      setIsSubmitting(true);
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Please sign in to submit your request');
        navigate('/signin');
        return;
      }

      console.log('📝 Starting order submission...');

      // Step 1: Upload main image
      let mainImageUrl = uploadedImageUrl;
      if (mainImage && !uploadedImageUrl.startsWith('http')) {
        mainImageUrl = await handleFileUpload(mainImage, 'main') || '';
        if (!mainImageUrl) {
          throw new Error('Failed to upload main image');
        }
      }

      // Step 2: Upload reference images
      const referenceImageUrls: string[] = [];
      for (const img of referenceImages) {
        const url = await handleFileUpload(img, 'reference');
        if (url) {
          referenceImageUrls.push(url);
        }
      }

      // Step 3: Create intake answers object
      const intakeAnswers: Record<string, string> = {};
      intakeQuestions.forEach((question, index) => {
        intakeAnswers[`q${index + 1}`] = answers[index] || '';
      });

      console.log('📝 Submitting order with:', {
        stylistId: stylistData.auth_user_id || stylistData.user_id,
        stylistUsername: stylistData.username,
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
            stylistId: stylistData.auth_user_id || stylistData.user_id, // Use the stylist's immutable auth user ID
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

      // Clear session storage
      sessionStorage.removeItem('pendingIntakeImageUrl');
      sessionStorage.removeItem('pendingIntakeImageFile');

      toast.success(`Request submitted! ${stylistData.display_name || stylistData.username} will review your style request.`);
      
      // Navigate based on stylist
      // Lissy uses the special waitlist page, others go to customer inbox
      if (stylistData.username?.toLowerCase() === 'lissy_roddy' || stylistData.username?.toLowerCase() === 'lissy') {
        navigate('/lissy/waitlist');
      } else {
        navigate('/customer-inbox');
      }
    } catch (error: any) {
      console.error('Error submitting intake:', error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStylist) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e1709] mx-auto mb-4" />
          <p className="text-gray-600">Loading stylist...</p>
        </div>
      </div>
    );
  }

  if (!stylistData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Stylist not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#1e1709] text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = intakeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / intakeQuestions.length) * 100;
  const isLastQuestion = currentQuestion === intakeQuestions.length - 1;

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white h-[48px] w-full relative z-50 border-b border-gray-100">
        <div className="h-full flex items-center justify-between px-4 max-w-[393px] mx-auto">
          {/* Back button aligned left */}
          <button
            onClick={() => navigate(`/u/${stylistData.username}`)}
            className="flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* SEVN SELECTS title centered */}
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[20px] tracking-[3px] text-black uppercase absolute left-1/2 transform -translate-x-1/2">
            SEVN SELECTS
          </p>
          
          {/* Empty div for layout balance */}
          <div className="w-6" />
        </div>
      </div>

      <div className="w-full max-w-[390px] mx-auto px-6">
        {/* Uploaded Main Image Display */}
        {uploadedImageUrl && currentQuestion === 0 && (
          <div className="mb-6 mt-6 flex justify-center">
            <div className="w-full max-w-[280px] aspect-[3/4] rounded-[8px] overflow-hidden border border-[#1E1709]">
              <img 
                src={uploadedImageUrl} 
                alt="Your uploaded style" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Main Image Upload - shown if no image yet */}
        {currentQuestion === 0 && !uploadedImageUrl && (
          <div className="mb-6 mt-6">
            <label className="block w-full aspect-[3/4] max-w-[280px] mx-auto border-2 border-dashed border-[#CCCCCC] rounded-[8px] cursor-pointer hover:border-[#1E1709] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageSelect}
                className="hidden"
              />
              <div className="w-full h-full flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-gray-600 text-sm">Tap to upload main photo</p>
              </div>
            </label>
          </div>
        )}

        {/* Progress Indicator - Sticky at top */}
        <div className="sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
          <div className="h-[5px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#15120A] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Progress Text */}
          <div className="mt-3">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] tracking-[1.5px] uppercase text-gray-400 text-center">
              STYLE INTAKE · {currentQuestion + 1} OF {intakeQuestions.length}
            </p>
          </div>
        </div>

        {/* Question Flow */}
        <div className="pb-32 pt-[14px]">
          <div className="transition-all duration-500">
            {/* Question Card */}
            <div className="mb-6">
              {/* Question */}
              <div className="mb-4 mt-1">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] leading-[22px] tracking-[0.3px] text-[#1E1709]">
                  {currentQuestionData.question}
                </p>
              </div>

              {/* Answer Input - More translucent */}
              <div>
                <textarea
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })}
                  placeholder={currentQuestionData.placeholder}
                  className="w-full min-h-[98px] p-4 border border-gray-200 rounded-[12px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709] placeholder:text-gray-400 placeholder:opacity-50 focus:outline-none focus:border-gray-300 resize-none bg-white/60 backdrop-blur-sm transition-colors"
                />
              </div>
            </div>

            {/* Reference Images (show on last question) */}
            {isLastQuestion && (
              <div className="mb-6 -mt-2">
                <label className="block mb-4">
                  <div className="w-full h-[52px] border border-gray-200 rounded-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors bg-white/60">
                    <svg className="w-5 h-5 text-[#1E1709]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]">
                      Add Reference Images ({referenceImages.length}/4)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReferenceImageSelect}
                    className="hidden"
                  />
                </label>

                {/* Reference Image Previews */}
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {referenceImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-[8px] overflow-hidden border border-[#1E1709]">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setReferenceImages(referenceImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Single Continue Button */}
            <button
              onClick={handleNext}
              disabled={isSubmitting || !answers[currentQuestion]?.trim()}
              className="w-full h-[52px] bg-[#1E1709] rounded-[12px] font-['Helvetica_Neue:Medium',sans-serif] text-[16px] tracking-[2px] text-white uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2A2315] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                'CONTINUE'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}