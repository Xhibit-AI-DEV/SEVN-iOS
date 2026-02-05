import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Loader2, Edit } from 'lucide-react';
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

export function CustomerOrderView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
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
        setOrder(data.order);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch order:', errorText);
        toast.error('Failed to load order');
      }
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleMockPayment = async () => {
    if (!order || order.status !== 'invited') return;

    try {
      setPaymentLoading(true);
      
      console.log('💳 Processing mock payment for order:', order.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${order.id}/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            transaction_id: `mock_txn_${Date.now()}`,
            amount: 100,
            currency: 'USD',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment completed:', data);
        toast.success('Payment successful! Your stylist will start styling soon.');
        
        // Update local order state
        setOrder(data.order);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to process payment:', errorText);
        toast.error('Failed to process payment');
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!order) return null;

    switch (order.status) {
      case 'waitlist':
        return {
          title: "You're on the waitlist",
          description: "You will be notified when you're selected",
          color: 'text-[#1e1709] bg-white border-[#1e1709]',
        };
      case 'invited':
        return {
          title: 'Invitation Received!',
          description: `Your stylist is ready to style you. Complete payment ($${order.payment_amount}) to get started.`,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      case 'paid':
        return {
          title: 'Payment Complete',
          description: 'Your stylist is preparing your curated selections',
          color: 'text-green-700 bg-green-50 border-green-200',
        };
      case 'styling':
        return {
          title: 'Styling in Progress',
          description: 'Your stylist is curating selections for you',
          color: 'text-purple-700 bg-purple-50 border-purple-200',
        };
      case 'completed':
        return {
          title: 'Selections Delivered!',
          description: 'Your curated selections are ready to view',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      default:
        return {
          title: order.status,
          description: '',
          color: 'text-gray-700 bg-gray-50 border-gray-200',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FFFEFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1e1709] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full min-h-screen bg-[#FFFEFD] flex flex-col items-center justify-center px-6">
        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/50 text-center">
          Order not found
        </p>
        <button
          onClick={() => navigate('/home')}
          className="mt-4 px-6 py-2 bg-[#1e1709] text-white rounded-[5px] font-['Helvetica_Neue:Medium',sans-serif] text-[13px] tracking-[1px] uppercase hover:bg-[#2a2412] transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#FFFEFD]">
      <div className="w-[393px] mx-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-[#FFFEFD] z-10 pt-5 pb-4 border-b border-black/70">
          <div className="flex items-center gap-3 pl-4">
            {/* Back button */}
            <button 
              onClick={() => navigate('/home')}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
            </button>
            
            <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[24px] tracking-[3px] text-[#1e1709] uppercase">
              My Request
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Status Card */}
          {statusDisplay && (
            <div className={`mb-6 p-4 rounded-[8px] border ${statusDisplay.color}`}>
              <h2 className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] mb-1">
                {statusDisplay.title}
              </h2>
              <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] opacity-80">
                {statusDisplay.description}
              </p>
            </div>
          )}

          {/* Main Image */}
          {order.main_image_url && (
            <div className="mb-6">
              <img
                src={order.main_image_url}
                alt="Style reference"
                className="w-full aspect-[3/4] object-cover rounded-[8px] border border-[#1e1709]"
              />
            </div>
          )}

          {/* Reference Images */}
          {order.reference_images && order.reference_images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709] mb-3">
                Reference Images
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {order.reference_images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Reference ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-[5px] border border-[#1e1709]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Style Intake Answers */}
          {order.intake_answers && Object.keys(order.intake_answers).length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709]">
                  Style Intake
                </h3>
                {order.status === 'waitlist' && (
                  <button
                    onClick={() => navigate(`/chris/intake/edit/${order.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[#1e1709] rounded-[4px] hover:bg-[#1e1709]/5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#1e1709]" strokeWidth={1.5} />
                    <span className="font-['Helvetica_Neue:Medium',sans-serif] text-[10px] tracking-[0.5px] uppercase text-[#1e1709]">
                      Edit
                    </span>
                  </button>
                )}
              </div>
              <div className="bg-white border border-[#1e1709]/20 rounded-[8px] p-4 space-y-4">
                {Object.entries(order.intake_answers).map(([question, answer], index) => (
                  <div key={index}>
                    <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[11px] tracking-[0.5px] uppercase text-[#1e1709]/60 mb-1">
                      {question}
                    </p>
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] leading-[1.5]">
                      {answer || 'No answer provided'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="mb-6">
            <h3 className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase text-[#1e1709] mb-3">
              Order Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/60">
                  Order ID
                </span>
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]">
                  {order.id.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/60">
                  Submitted
                </span>
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]">
                  {new Date(order.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/60">
                  Stylist
                </span>
                <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709] capitalize">
                  {order.stylist_id}
                </span>
              </div>
              {order.invited_at && (
                <div className="flex justify-between">
                  <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/60">
                    Invited
                  </span>
                  <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]">
                    {new Date(order.invited_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]/60">
                    Paid
                  </span>
                  <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[13px] text-[#1e1709]">
                    {new Date(order.paid_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Button (only show if order is in 'invited' status) */}
          {order.status === 'invited' && (
            <div className="mb-6">
              <button
                onClick={handleMockPayment}
                disabled={paymentLoading}
                className="w-full bg-[#1e1709] text-white py-4 rounded-[8px] font-['Helvetica_Neue:Medium',sans-serif] text-[14px] tracking-[1px] uppercase hover:bg-[#2a2412] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${order.payment_amount} (Mock)`
                )}
              </button>
              <p className="mt-2 text-center font-['Helvetica_Neue:Regular',sans-serif] text-[11px] text-[#1e1709]/50">
                Mock payment for testing purposes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}