import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { projectId } from '../utils/supabase/info';

interface Order {
  id: string;
  status: string;
  stylist_id: string;
}

interface HomePageBannerProps {
  onBannerHeightChange?: (height: number) => void;
}

export function HomePageBanner({ onBannerHeightChange }: HomePageBannerProps) {
  const navigate = useNavigate();
  const [invitedOrder, setInvitedOrder] = useState<Order | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const orders = await response.json();
          
          // Find first "invited" order (status = "invited")
          const invited = orders.find((o: Order) => o.status === 'invited');
          setInvitedOrder(invited || null);
          
          // Find first "completed" order (status = "sent")
          const completed = orders.find((o: Order) => o.status === 'sent');
          setCompletedOrder(completed || null);
          
          console.log('📊 Banner orders:', { invited, completed });
        }
      } catch (error) {
        console.error('❌ Error fetching orders for banner:', error);
        console.error('❌ Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Don't show banner while loading or if no relevant orders
  if (isLoading || (!invitedOrder && !completedOrder)) {
    return null;
  }

  // Priority: Show "invited" banner first, then "completed"
  const orderToShow = invitedOrder || completedOrder;
  const isInvited = !!invitedOrder;

  const handleCTAClick = () => {
    if (isInvited) {
      // Navigate to message detail for payment
      navigate(`/message-detail/${orderToShow!.id}`);
    } else {
      // Navigate to edit view
      navigate(`/message-detail/${orderToShow!.id}`);
    }
  };

  return (
    <div className="w-full bg-[#1e1709] px-4 py-5 max-w-[393px] mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-['Helvetica_Neue:Bold',sans-serif] text-[14px] leading-[18px] tracking-[1px] text-[#fffefd] uppercase mb-1">
            {isInvited ? "YOU'RE INVITED" : "YOUR EDIT IS READY"}
          </p>
          <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[11px] leading-[16px] tracking-[0.5px] text-[#fffefd]/80">
            {isInvited 
              ? "Confirm to start your styling" 
              : "Your curated selection is ready to view"}
          </p>
        </div>
        
        <button
          onClick={handleCTAClick}
          className="px-5 py-2.5 bg-[#fffefd] rounded-[6px] font-['Helvetica_Neue:Bold',sans-serif] text-[12px] leading-[14px] tracking-[0.5px] text-[#1e1709] uppercase whitespace-nowrap hover:bg-[#f5f5f4] transition-colors"
        >
          {isInvited ? "View & Pay" : "View Edit"}
        </button>
      </div>
    </div>
  );
}