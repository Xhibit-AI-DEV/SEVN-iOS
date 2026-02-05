import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import imgScreenshot20231117At12524 from "figma:asset/e4b87ad125820c87df00cd6e705bde4e8af3e67e.png";

interface CustomerIntake {
  id: string;
  name: string;
  email: string;
  phone?: string;
  main_image_url?: string;
  additional_images?: string[];
  status: 'new' | 'invited' | 'in_progress' | 'completed';
  intake_data?: {
    style_preferences?: string;
    favorite_brands?: string;
    budget_range?: string;
    sizes?: {
      tops?: string;
      bottoms?: string;
      shoes?: string;
    };
    occasions?: string;
    style_goals?: string;
    color_preferences?: string;
    body_type?: string;
    fit_preferences?: string;
    areas_to_highlight?: string;
    areas_to_avoid?: string;
    additional_notes?: string;
  };
  intake_submitted_at?: string;
}

export function RorySelectsDetail() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [customer, setCustomer] = useState<CustomerIntake | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/${customerId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Fetched customer data:', data);
          setCustomer(data.customer);
        } else {
          console.error('Failed to fetch customer data');
          toast.error('Failed to load customer data');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  const handleInvite = async () => {
    if (!customer) return;
    
    try {
      setInviting(true);
      console.log('💌 Inviting customer:', customer.id);
      
      // Update customer status to "in_progress"
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/update-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: customer.id,
            status: 'in_progress',
          }),
        }
      );

      if (response.ok) {
        console.log('✅ Customer status updated to in_progress');
        toast.success(`Started working on ${customer.name}'s selections!`);
        
        // Navigate to stylist workspace to create their edit
        navigate(`/stylist-workspace/${customer.id}`);
      } else {
        console.error('Failed to update status');
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error inviting customer:', error);
      toast.error('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1e1709] animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden bg-white flex items-center justify-center">
        <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-[#1e1709]/50">
          Customer not found
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-white">
      <div className="w-[393px] mx-auto relative pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 pt-5 pb-4 border-b border-black/70">
          <div className="flex items-center justify-center px-4 relative">
            {/* Back button */}
            <button 
              onClick={() => navigate(-1)}
              className="absolute left-4 w-6 h-6 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6 text-[#1e1709]" strokeWidth={1.5} />
            </button>
            
            <h1 className="font-['Helvetica_Neue:Regular',sans-serif] text-[26px] tracking-[3px] text-black uppercase">
              SEVN SELECTS
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {/* Customer Image Section */}
          <div className="flex flex-col gap-[4px] items-center px-[16px] pt-[32px]">
            {/* Customer Photo with triple border */}
            <div className="relative inline-block">
              {/* Back card - offset most */}
              <div className="absolute top-[8px] left-[8px] h-[368px] w-[286px] rounded-[8px] border border-[#1e1709] bg-white" />
              
              {/* Middle card - offset less */}
              <div className="absolute top-[4px] left-[4px] h-[368px] w-[286px] rounded-[8px] border border-[#1e1709] bg-white" />
              
              {/* Front card - Customer's image */}
              <div className="relative h-[368px] w-[286px] rounded-[8px] border border-black overflow-hidden">
                {customer.main_image_url ? (
                  <img alt={customer.name} className="w-full h-full object-cover" src={customer.main_image_url} />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="font-['Helvetica_Neue:Regular',sans-serif] text-[14px] text-gray-500">
                      No image uploaded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Name */}
            <p className="font-['Helvetica_Neue:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1709] text-[20px] text-center tracking-[2px] uppercase w-[361px] mt-[32px]">
              {customer.name}
            </p>
            
            {/* Status */}
            <p className="font-['Helvetica_Neue:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1709]/60 text-[14px] text-center tracking-[1px] w-[361px] mt-[8px]">
              STATUS: {customer.status.toUpperCase().replace('_', ' ')}
            </p>
            
            {/* Line Divider */}
            <div className="h-0 w-[349px] mt-[20px]">
              <div className="relative inset-[-1px_0_0_0]">
                <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
                  <line stroke="black" x2="349" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Lissy's Profile Photo */}
          <div className="relative mt-[32px] flex justify-center">
            <div className="relative h-[162px] w-[162px]">
              <div className="w-full h-full rounded-full border border-[#1e1709] overflow-hidden">
                <img alt="Lissy Roddy" className="w-full h-full object-cover" src={imgScreenshot20231117At12524} />
              </div>
              {/* Label */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[rgba(255,254,253,0.8)] rounded-[20px] border border-[#1e1709] px-4 h-[30px] flex items-center justify-center z-[60]">
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[14px] leading-[22px] text-[#130326] tracking-[2px] uppercase whitespace-nowrap">
                  Lissy Roddy
                </p>
              </div>
            </div>
          </div>

          {/* Intake Information Section */}
          <div className="mt-[24px] px-[16px]">
            <p className="font-['Helvetica_Neue:Regular',sans-serif] leading-[normal] text-[#1e1709] text-[20px] text-center tracking-[2px] uppercase w-full">
              STYLE INTAKE
            </p>

            <div className="font-['Helvetica_Neue:Regular',sans-serif] leading-[26px] text-[#1e1709] text-[14px] tracking-[0.5px] w-full mt-[24px] space-y-4">
              {/* Contact Info */}
              <div>
                <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Contact</p>
                <p>{customer.email}</p>
                {customer.phone && <p>{customer.phone}</p>}
              </div>

              {/* Style Preferences */}
              {customer.intake_data?.style_preferences && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Style Preferences</p>
                  <p>{customer.intake_data.style_preferences}</p>
                </div>
              )}

              {/* Favorite Brands */}
              {customer.intake_data?.favorite_brands && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Favorite Brands</p>
                  <p>{customer.intake_data.favorite_brands}</p>
                </div>
              )}

              {/* Budget Range */}
              {customer.intake_data?.budget_range && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Budget Range</p>
                  <p>{customer.intake_data.budget_range}</p>
                </div>
              )}

              {/* Sizes */}
              {customer.intake_data?.sizes && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Sizes</p>
                  {customer.intake_data.sizes.tops && <p>Tops: {customer.intake_data.sizes.tops}</p>}
                  {customer.intake_data.sizes.bottoms && <p>Bottoms: {customer.intake_data.sizes.bottoms}</p>}
                  {customer.intake_data.sizes.shoes && <p>Shoes: {customer.intake_data.sizes.shoes}</p>}
                </div>
              )}

              {/* Style Goals */}
              {customer.intake_data?.style_goals && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Style Goals</p>
                  <p>{customer.intake_data.style_goals}</p>
                </div>
              )}

              {/* Color Preferences */}
              {customer.intake_data?.color_preferences && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Color Preferences</p>
                  <p>{customer.intake_data.color_preferences}</p>
                </div>
              )}

              {/* Body & Fit */}
              {(customer.intake_data?.body_type || customer.intake_data?.fit_preferences) && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Body & Fit</p>
                  {customer.intake_data.body_type && <p>Body Type: {customer.intake_data.body_type}</p>}
                  {customer.intake_data.fit_preferences && <p>Fit Preferences: {customer.intake_data.fit_preferences}</p>}
                  {customer.intake_data.areas_to_highlight && <p>Highlight: {customer.intake_data.areas_to_highlight}</p>}
                  {customer.intake_data.areas_to_avoid && <p>Avoid: {customer.intake_data.areas_to_avoid}</p>}
                </div>
              )}

              {/* Additional Notes */}
              {customer.intake_data?.additional_notes && (
                <div>
                  <p className="font-['Helvetica_Neue:Medium',sans-serif] text-[12px] tracking-[1px] uppercase mb-1">Additional Notes</p>
                  <p>{customer.intake_data.additional_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Line Divider */}
          <div className="mt-[40px] px-[16px] flex justify-center">
            <div className="h-0 w-[349px]">
              <div className="relative inset-[-1px_0_0_0]">
                <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 349 1">
                  <line stroke="black" x2="349" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Images */}
          {customer.additional_images && customer.additional_images.length > 0 && (
            <div className="mt-[40px] px-[16px]">
              <p className="font-['Helvetica_Neue:Regular',sans-serif] leading-[normal] text-[#1e1709] text-[20px] text-center tracking-[2px] uppercase w-full mb-[24px]">
                UPLOADED IMAGES
              </p>
              
              <div className="grid grid-cols-2 gap-[16px]">
                {customer.additional_images.map((imageUrl, index) => (
                  <div key={index} className="relative h-[227px] rounded-[3px] border border-black overflow-hidden">
                    <img alt={`Upload ${index + 1}`} className="w-full h-full object-cover" src={imageUrl} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INVITE Button - Only show if status is 'invited' or 'new' */}
          {(customer.status === 'invited' || customer.status === 'new') && (
            <div className="mt-[40px] px-[16px] flex justify-center mb-[40px]">
              <button 
                onClick={handleInvite}
                disabled={inviting}
                className="w-full h-[52px] bg-[#1E1709] rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[18px] text-white uppercase cursor-pointer hover:bg-[#2a2010] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    INVITING...
                  </>
                ) : (
                  'INVITE'
                )}
              </button>
            </div>
          )}

          {/* Show different message if already in progress or completed */}
          {customer.status === 'in_progress' && (
            <div className="mt-[40px] px-[16px] flex justify-center mb-[40px]">
              <button 
                onClick={() => navigate(`/stylist-workspace/${customer.id}`)}
                className="w-full h-[52px] bg-[#1E1709] rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[18px] text-white uppercase cursor-pointer hover:bg-[#2a2010] transition-all"
              >
                CONTINUE STYLING
              </button>
            </div>
          )}

          {customer.status === 'completed' && (
            <div className="mt-[40px] px-[16px] flex justify-center mb-[40px]">
              <div className="w-full h-[52px] bg-[#1E1709]/20 rounded-[8px] font-['Helvetica_Neue:Bold',sans-serif] text-[18px] text-[#1E1709] uppercase flex items-center justify-center">
                EDIT COMPLETED ✓
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <BottomNavigation />
      </div>
    </div>
  );
}