import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner@2.0.3';
import { Loader2, X } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

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

interface Order {
  id: string;
  customer_id: string;
  status: string;
  stylist_id: string;
  created_at: string;
  main_image_url?: string;
  reference_images?: string[];
  intake_answers?: Record<string, string> | Array<{ question: string; answer: string }>;
}

export function EditIntakeForm() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);
  const [existingReferenceUrls, setExistingReferenceUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in to continue');
        navigate('/signin');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      console.log('📋 Order data loaded:', data);

      // Allow viewing for all statuses, but only editing for waitlist
      setOrder(data.order);
      setMainImageUrl(data.order.main_image_url || '');
      setExistingReferenceUrls(data.order.reference_images || []);

      // Populate answers from intake_answers - handle both object and array formats
      if (data.order.intake_answers) {
        const answersMap: Record<number, string> = {};
        
        console.log('📝 Raw intake_answers from backend:', data.order.intake_answers);
        
        if (Array.isArray(data.order.intake_answers)) {
          // Array format: [{ question: string, answer: string }]
          console.log('📝 Loading answers from array format');
          data.order.intake_answers.forEach((item: { question: string; answer: string }) => {
            const questionObj = intakeQuestions.find(q => q.question === item.question);
            if (questionObj) {
              answersMap[questionObj.id] = item.answer;
            }
          });
        } else {
          // Object format - check if it's using q1, q2, etc. or question text as keys
          console.log('📝 Loading answers from object format');
          Object.entries(data.order.intake_answers).forEach(([key, answer]) => {
            // Check if key is in format "q1", "q2", etc.
            if (key.startsWith('q') && /^q\d+$/.test(key)) {
              // Extract the question ID from "q1" -> 1
              const questionId = parseInt(key.substring(1));
              console.log(`📝 Found answer for question ${questionId}:`, answer);
              answersMap[questionId] = answer as string;
            } else {
              // Key is the actual question text
              const questionObj = intakeQuestions.find(q => q.question === key);
              if (questionObj) {
                answersMap[questionObj.id] = answer as string;
              }
            }
          });
        }
        
        console.log('✅ Loaded answers:', answersMap);
        setAnswers(answersMap);
      } else {
        console.log('⚠️ No intake_answers found in order data');
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load request');
      navigate('/customer-inbox');
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImageUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReferenceImageFiles([...referenceImageFiles, ...files]);
  };

  const removeReferenceFile = (index: number) => {
    setReferenceImageFiles(referenceImageFiles.filter((_, i) => i !== index));
  };

  const removeExistingReference = (index: number) => {
    setExistingReferenceUrls(existingReferenceUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in to continue');
        navigate('/signin');
        return;
      }

      let newMainImageUrl = mainImageUrl;

      // Upload new main image if changed
      if (mainImageFile) {
        const mainImageFormData = new FormData();
        mainImageFormData.append('file', mainImageFile);

        const mainImageResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: mainImageFormData,
          }
        );

        if (!mainImageResponse.ok) {
          const errorText = await mainImageResponse.text();
          console.error('Main image upload failed:', mainImageResponse.status, errorText);
          throw new Error(`Failed to upload main image: ${errorText}`);
        }

        const { url } = await mainImageResponse.json();
        newMainImageUrl = url;
        console.log('Main image uploaded:', url);
      }

      // Upload new reference images
      const newReferenceUrls: string[] = [];
      for (const image of referenceImageFiles) {
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
          newReferenceUrls.push(url);
          console.log('Reference image uploaded:', url);
        }
      }

      // Combine existing and new reference images
      const allReferenceImages = [...existingReferenceUrls, ...newReferenceUrls];

      // Prepare intake answers as object (new format)
      const intakeAnswers = intakeQuestions.reduce((acc, q) => {
        acc[q.question] = answers[q.id] || '';
        return acc;
      }, {} as Record<string, string>);

      console.log('💾 Saving order with answers:', intakeAnswers);

      // Update order
      const updateResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            mainImageUrl: newMainImageUrl,
            referenceImages: allReferenceImages,
            intakeAnswers: intakeAnswers,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update request');
      }

      toast.success('Request updated successfully!');
      navigate('/messages');
    } catch (error: any) {
      console.error('Error updating intake:', error);
      toast.error(error.message || 'Failed to update request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1e1709] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-white">
      {/* Top Navigation Bar */}
      <div className="bg-white h-[48px] w-full relative z-50 border-b border-gray-100">
        <div className="h-full flex items-center justify-between px-4 max-w-[393px] mx-auto">
          {/* Back button aligned left */}
          <button
            onClick={() => navigate('/messages')}
            className="flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Center title */}
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-['Helvetica_Neue:Regular',sans-serif] text-[14px] tracking-[2px] text-[#1e1709] uppercase">
            EDIT REQUEST
          </h1>
          
          {/* Empty right side for balance */}
          <div className="w-8" />
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-[393px] mx-auto px-4 py-6 pb-32">
        {/* Main Image - Figma Design with layered borders */}
        <div className="mb-8">
          <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 uppercase">
            Your Style Photo
          </h3>
          
          {/* Card with layered border effect */}
          <div className="relative h-[386px] w-full">
            {/* Background border layer 1 - furthest back */}
            <div className="absolute border border-[#1e1709] border-solid inset-[2.22%] opacity-80 rounded-[8px]" />
            
            {/* Background border layer 2 - middle */}
            <div className="absolute border border-[#1e1709] border-solid inset-[4.43%_0_0_4.43%] rounded-[8px]" />
            
            {/* Main image container - front */}
            <div className="absolute inset-[0_4.43%_4.43%_0] rounded-[8px] overflow-hidden">
              {mainImageUrl ? (
                <>
                  <img 
                    src={mainImageUrl} 
                    alt="Your style" 
                    className="absolute max-w-none object-cover rounded-[8px] size-full"
                  />
                  <div className="absolute border border-[#1e1709] border-solid inset-0 rounded-[8px]" />
                  
                  {/* Change Photo Button */}
                  <label className="absolute bottom-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-[4px] font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[0.5px] uppercase cursor-pointer hover:bg-white transition-colors border border-[#1e1709] z-10">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <label className="absolute inset-0 rounded-[8px] border border-[#1e1709] bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="#1e1709" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/60 mt-2">
                    Upload Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* All Questions */}
        <div className="space-y-6 mb-8">
          {intakeQuestions.map((question) => (
            <div key={question.id}>
              <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[18px] text-[#1e1709] mb-3">
                {question.question}
              </h3>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                className="w-full min-h-[120px] p-4 border border-[#1e1709] rounded-lg font-['Helvetica_Neue:Regular',sans-serif] text-[16px] text-[#1e1709] placeholder:text-[#1e1709]/40 focus:outline-none focus:ring-1 focus:ring-[#1e1709] resize-none"
              />
            </div>
          ))}
        </div>

        {/* Reference Images */}
        <div className="mb-8">
          <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] text-[#1e1709] mb-3 uppercase">
            Additional Reference Images (Optional)
          </h3>
          <p className="font-['Helvetica_Neue:Light',sans-serif] text-[12px] text-[#1e1709]/60 mb-4">
            Upload additional images to help Chris Whyle understand your preferred style direction better.
          </p>
          
          <div className="flex gap-3 flex-wrap">
            {/* Existing reference images */}
            {existingReferenceUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-[100px] h-[100px] rounded-lg overflow-hidden border border-[#1e1709]">
                <img 
                  src={url} 
                  alt={`Reference ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeExistingReference(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* New reference image files */}
            {referenceImageFiles.map((image, index) => (
              <div key={`new-${index}`} className="relative w-[100px] h-[100px] rounded-lg overflow-hidden border border-[#1e1709]">
                <img 
                  src={URL.createObjectURL(image)} 
                  alt={`New reference ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeReferenceFile(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <label className="w-[100px] h-[100px] border border-[#1e1709] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#1e1709]/5 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="#1e1709" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[10px] text-[#1e1709]/60 mt-1">
                Add Image
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-8 pt-6 border-t border-[#1e1709]/20">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/50 uppercase tracking-[0.5px]">
                Order Number
              </span>
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]">
                {order.id.substring(0, 12).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/50 uppercase tracking-[0.5px]">
                Date Requested
              </span>
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]">
                {new Date(order.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/50 uppercase tracking-[0.5px]">
                Stylist
              </span>
              <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709] capitalize">
                {order.stylist_id === 'chris_whly' ? 'Chris Whly' : order.stylist_id}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || order.status !== 'waitlist'}
          className="w-full h-[52px] bg-[#1e1709] text-white rounded-[4px] font-['Helvetica_Neue:Bold',sans-serif] text-[14px] tracking-[0.08em] uppercase hover:bg-[#2a2010] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>UPDATING...</span>
            </>
          ) : (
            <span>SAVE CHANGES</span>
          )}
        </button>
      </div>
    </div>
  );
}