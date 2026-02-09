import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  stylist_id: string;
  status: 'waitlist' | 'invited' | 'paid' | 'styling' | 'completed' | 'cancelled';
  main_image_url?: string;
  reference_images?: string[];
  intake_answers?: Record<string, string>;
  payment_status?: string;
  payment_amount?: number;
  created_at: string;
  invited_at?: string;
  paid_at?: string;
  styling_started_at?: string;
  completed_at?: string;
}

export function MessageDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      // Get current user profile first
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        toast.error('Please sign in');
        navigate('/signin');
        return;
      }
      
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/profiles/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await profileResponse.json();
      const userId = profileData.profile?.auth_user_id || profileData.profile?.user_id;
      
      console.log('👤 Current user ID:', userId);
      
      console.log('🔍 Fetching order:', orderId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched order:', data.order);
        console.log('📊 Order customer_id:', data.order.customer_id);
        console.log('📊 Current user ID:', userId);
        console.log('📊 Is Customer?:', data.order.customer_id === userId);
        
        setOrder(data.order);
        setCurrentUserId(userId);
        setIsCustomer(data.order.customer_id === userId);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch order:', errorText);
        toast.error('Failed to load order');
        navigate('/messages');
      }
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!order || order.status !== 'waitlist') return;

    try {
      setActionLoading(true);
      
      console.log('💌 Sending invite for order:', order.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${order.id}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Invite sent:', data);
        toast.success(`Invite sent to ${order.customer_name}!`);
        
        // Update local order state
        setOrder(data.order);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to send invite:', errorText);
        toast.error('Failed to send invite');
      }
    } catch (error) {
      console.error('❌ Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartStyling = async () => {
    if (!order || order.status !== 'paid') return;

    try {
      setActionLoading(true);
      
      console.log('🎨 Starting styling for order:', order.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${order.id}/start-styling`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Styling started:', data);
        toast.success('Opening styling workspace...');
        
        // Navigate to styling workspace (using existing RorySelectsDetail page)
        navigate(`/rory-selects/${order.id}`);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to start styling:', errorText);
        toast.error('Failed to start styling');
      }
    } catch (error) {
      console.error('❌ Error starting styling:', error);
      toast.error('Failed to start styling');
    } finally {
      setActionLoading(false);
    }
  };

  const handleContinueStyling = () => {
    if (!order) return;
    navigate(`/rory-selects/${order.id}`);
  };

  const getActionButton = () => {
    if (!order) return null;

    // CUSTOMER VIEW
    if (isCustomer) {
      switch (order.status) {
        case 'waitlist':
          return (
            <button
              onClick={() => navigate(`/lissy/intake/edit/${order.id}`)}
              className="w-full h-[52px] bg-white border-2 border-[#1e1709] text-[#1e1709] rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] uppercase hover:bg-[#1e1709] hover:text-white transition-colors flex items-center justify-center"
            >
              EDIT INTAKE
            </button>
          );
        
        case 'invited':
          return (
            <div className="space-y-3">
              {/* Mock Apple Pay Button */}
              <button
                onClick={() => {
                  toast.success('Payment processed! (Mock)');
                  // In real app, this would process payment and update order status
                }}
                className="w-full h-[52px] bg-black text-white rounded-[12px] font-['Helvetica_Neue:Medium',sans-serif] text-[18px] hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
                  <path d="M15.5 12C15.5 15.59 12.59 18.5 9 18.5C5.41 18.5 2.5 15.59 2.5 12C2.5 8.41 5.41 5.5 9 5.5C10.07 5.5 11.09 5.75 12 6.18C11.19 7.2 10.71 8.54 10.71 10C10.71 13.04 13.17 15.5 16.21 15.5C17.02 15.5 17.79 15.32 18.48 15C17.87 16.92 16.83 18.59 15.43 19.83C14.34 18.75 13.75 17.23 13.75 15.5C13.75 11.91 16.66 9 20.25 9H15.5V12Z"/>
                </svg>
                Pay with Apple Pay
              </button>
              <p className="text-center font-['Helvetica_Neue:Regular',sans-serif] text-[12px] text-[#1e1709]/50">
                $100.00 • Mock Payment
              </p>
            </div>
          );
        
        case 'paid':
        case 'styling':
          return (
            <div className="w-full p-6 bg-blue-50 border border-blue-200 rounded-[8px] text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[16px] tracking-[1px] uppercase text-blue-900 mb-2">
                Your stylist is creating your selections
              </p>
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-blue-700">
                You'll be notified when your curated selects are ready to view.
              </p>
            </div>
          );
        
        case 'completed':
          return (
            <button
              onClick={() => navigate(`/rory-selects/${order.id}`)}
              className="w-full h-[52px] bg-[#1e1709] text-white rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] uppercase hover:bg-[#2a2010] transition-colors flex items-center justify-center"
            >
              VIEW SELECTS
            </button>
          );
        
        default:
          return null;
      }
    }

    // STYLIST VIEW
    switch (order.status) {
      case 'waitlist':
        return (
          <button
            onClick={handleInvite}
            disabled={actionLoading}
            className="w-full h-[52px] bg-[#1e1709] text-white rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] uppercase hover:bg-[#2a2010] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'INVITE'}
          </button>
        );
      
      case 'invited':
        return (
          <div className="w-full h-[52px] bg-[#1e1709]/10 rounded-[8px] font-['Helvetica_Neue:Regular',sans-serif] text-[14px] uppercase text-[#1e1709]/60 flex items-center justify-center">
            AWAITING PAYMENT
          </div>
        );
      
      case 'paid':
        return (
          <button
            onClick={handleStartStyling}
            disabled={actionLoading}
            className="w-full h-[52px] bg-[#1e1709] text-white rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] uppercase hover:bg-[#2a2010] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'START STYLING'}
          </button>
        );
      
      case 'styling':
        return (
          <button
            onClick={handleContinueStyling}
            className="w-full h-[52px] bg-[#1e1709] text-white rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[16px] uppercase hover:bg-[#2a2010] transition-colors"
          >
            CONTINUE STYLING
          </button>
        );
      
      case 'completed':
        return (
          <div className="w-full h-[52px] bg-green-500/10 border border-green-500 rounded-[8px] font-['Helvetica_Neue:Medium',sans-serif] text-[14px] uppercase text-green-700 flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16.6667 5L7.5 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            COMPLETED
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (!order) return null;

    const statusConfig = {
      waitlist: { label: 'WAITLISTED', bg: 'bg-white', text: 'text-black', border: 'border-black' },
      invited: { label: 'INVITED', bg: 'bg-white', text: 'text-black', border: 'border-black' },
      paid: { label: 'PAID', bg: 'bg-white', text: 'text-black', border: 'border-black' },
      styling: { label: 'STYLING', bg: 'bg-white', text: 'text-black', border: 'border-black' },
      completed: { label: 'COMPLETED', bg: 'bg-white', text: 'text-black', border: 'border-black' },
      cancelled: { label: 'CANCELLED', bg: 'bg-white', text: 'text-black', border: 'border-black' },
    };

    const config = statusConfig[order.status];

    return (
      <div className={`px-5 py-2.5 ${config.bg} ${config.text} border ${config.border} rounded-[4px] font-['Helvetica_Neue:Regular',sans-serif] text-[13px] tracking-[1px] uppercase inline-block`}>
        {config.label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1e1709] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/50">
          Order not found
        </p>
      </div>
    );
  }

  const questions = [
    'What are you looking to be styled for?',
    'What\'s the vibe you\'re going for?',
    'Are there any brands, styles, or references you love?',
    'Anything you don\'t like or want to avoid?',
    'Is this for a specific time or occasion?',
    'Any fit or sizing notes we should know?',
    'What\'s your budget range?',
    'Anything else you want us to know?',
  ];

  return (
    <div 
      className="min-h-screen bg-white w-full overflow-x-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div 
        className="w-full mx-auto px-6"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 h-[48px] border-b border-gray-100 -mx-6 px-6 mb-6">
          <div className="h-full flex items-center justify-center relative">
            <button
              onClick={() => navigate('/messages')}
              className="absolute left-0 flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[20px] tracking-[3px] text-black uppercase">
              STYLE REQUEST
            </p>
          </div>
        </div>

        {/* Customer Photo with Card Stack Effect */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {/* Card stack layers - 1px lines, 4px apart */}
            <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[8px] bg-white" style={{ transform: 'translate(8px, 8px)' }} />
            <div className="absolute inset-0 border-[1px] border-[#1E1709] rounded-[8px] bg-white" style={{ transform: 'translate(4px, 4px)' }} />
            <div className="w-[286px] h-[368px] rounded-[8px] overflow-hidden border-[1px] border-[#1E1709] relative z-10 bg-white">
              {order.main_image_url ? (
                <img 
                  src={order.main_image_url} 
                  alt="Client style reference"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                  No Photo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Combined Status and Date Box */}
        <div className="flex justify-center mb-12">
          <div className="font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[0.5px] uppercase text-black">
            {order.status === 'waitlist' && `WAITLISTED · ${new Date(order.created_at).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: '2-digit' 
            }).replace(/\//g, '/')}`}
            {order.status === 'invited' && `INVITED · ${order.invited_at ? new Date(order.invited_at).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: '2-digit' 
            }).replace(/\//g, '/') : ''}`}
            {order.status === 'paid' && `PAID · ${order.paid_at ? new Date(order.paid_at).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: '2-digit' 
            }).replace(/\//g, '/') : ''}`}
            {order.status === 'styling' && `STYLING · ${order.styling_started_at ? new Date(order.styling_started_at).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: '2-digit' 
            }).replace(/\//g, '/') : ''}`}
            {order.status === 'completed' && `COMPLETED · ${order.completed_at ? new Date(order.completed_at).toLocaleDateString('en-US', { 
              month: 'numeric', 
              day: 'numeric', 
              year: '2-digit' 
            }).replace(/\//g, '/') : ''}`}
            {order.status === 'cancelled' && 'CANCELLED'}
          </div>
        </div>

        {/* Style Intake Section with Border */}
        {order.intake_answers && (
          <div className="mb-8">
            <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[12px] tracking-[1.5px] uppercase text-[#1E1709] mb-4">
              STYLE INTAKE
            </p>
            
            <div className="border-[1px] border-[#1E1709] rounded-[8px] p-6 space-y-6">
              {questions.map((question, index) => {
                const answerKey = `q${index + 1}`;
                const answer = order.intake_answers?.[answerKey];
                
                if (!answer) return null;
                
                return (
                  <div key={index}>
                    <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] text-[#1E1709] mb-2">
                      {question}
                    </p>
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1E1709]/70 leading-[20px]">
                      {answer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reference Images Section */}
        {order.reference_images && order.reference_images.length > 0 && (
          <div className="mb-8">
            <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[12px] tracking-[1.5px] uppercase text-[#1E1709] mb-4">
              REFERENCES
            </p>
            
            <div className="flex flex-wrap gap-2">
              {order.reference_images.map((imageUrl, index) => (
                <div key={index} className="w-[80px] h-[80px] rounded-[6px] overflow-hidden border-[1px] border-[#1E1709]">
                  <img 
                    src={imageUrl} 
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Info (if paid) */}
        {order.payment_status === 'completed' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-[8px]">
            <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[1px] uppercase text-green-700 mb-2">
              PAYMENT RECEIVED
            </p>
            <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-green-700">
              ${order.payment_amount} {order.payment_currency}
            </p>
            {order.paid_at && (
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] text-green-600 mt-1">
                {new Date(order.paid_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8">
          {getActionButton()}
        </div>
      </div>
    </div>
  );
}