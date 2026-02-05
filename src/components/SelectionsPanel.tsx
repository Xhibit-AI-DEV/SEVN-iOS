import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Save, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import type { SelectedItem } from './StylistWorkspace';

interface Customer {
  sys: {
    id: string;
  };
  fields: any;
}

interface SelectionsPanelProps {
  customer: Customer;
  selectedItems: SelectedItem[];
  onAddItem: (url: string) => void;
  onRemoveItem: (id: string) => void;
}

export function SelectionsPanel({ customer, selectedItems, onAddItem, onRemoveItem }: SelectionsPanelProps) {
  const [manualUrl, setManualUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [stylingNotes, setStylingNotes] = useState('');
  const [stylingNotesError, setStylingNotesError] = useState(false);
  const [stylingNotesFocused, setStylingNotesFocused] = useState(false);
  
  // State for assigned stylist (from customer's stylist_id field)
  const [assignedStylist, setAssignedStylist] = useState<{ name: string; image: string; title: string } | null>(null);
  const [loadingAssignedStylist, setLoadingAssignedStylist] = useState(true);
  
  // Debug: Log when selectedItems changes
  useEffect(() => {
    console.log('📦 SelectionsPanel received items:', selectedItems);
    selectedItems.forEach((item, index) => {
      console.log(`📦 Item ${index + 1}:`, {
        id: item.id,
        title: item.title,
        hasImage: !!item.image,
        image: item.image,
        url: item.url
      });
    });
  }, [selectedItems]);

  useEffect(() => {
    // Load saved selections when customer changes
    loadSelections();
  }, [customer.sys.id]);

  // Fetch assigned stylist from customer's stylist_id field
  useEffect(() => {
    const fetchAssignedStylist = async () => {
      try {
        setLoadingAssignedStylist(true);
        setAssignedStylist(null);

        // Extract stylist_id from customer fields
        let stylistId = '';
        const stylistIdField = customer.fields?.stylist_id;
        
        console.log('🔍 Customer stylist_id field:', stylistIdField);
        
        if (typeof stylistIdField === 'string') {
          stylistId = stylistIdField.trim();
        } else if (typeof stylistIdField === 'object' && stylistIdField !== null) {
          // Handle Contentful Rich Text Document
          if (stylistIdField.nodeType === 'document' && stylistIdField.content) {
            try {
              const firstParagraph = stylistIdField.content[0];
              if (firstParagraph?.content && firstParagraph.content[0]?.value) {
                stylistId = firstParagraph.content[0].value.trim();
              }
            } catch (e) {
              console.error('Error parsing stylist ID from Rich Text:', e);
            }
          }
        }

        console.log('🔍 Extracted stylist ID:', stylistId);

        if (!stylistId) {
          console.warn('⚠️ No stylist assigned to this customer');
          setLoadingAssignedStylist(false);
          return;
        }

        // Fetch stylist data from Contentful using the ID
        const stylistResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/stylists/${stylistId}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!stylistResponse.ok) {
          console.error(`❌ Failed to fetch stylist "${stylistId}":`, stylistResponse.status);
          setLoadingAssignedStylist(false);
          return;
        }

        const stylistData = await stylistResponse.json();
        console.log('✅ Fetched assigned stylist data:', stylistData);

        // Extract stylist name
        const name = stylistData.fields?.fullname || 'Unknown Stylist';

        // Extract title from bio Rich Text
        let title = '';
        if (stylistData.fields?.bio?.content?.[0]?.content) {
          const firstParagraph = stylistData.fields.bio.content[0].content;
          const boldText = firstParagraph.find((node: any) => 
            node.marks?.some((mark: any) => mark.type === 'bold')
          );
          title = boldText?.value || '';
        }

        // Get stylist profile picture
        let image = '';
        const imageRef = stylistData.fields?.profile_picture;
        
        if (imageRef?.sys?.id) {
          try {
            const assetResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/assets/${imageRef.sys.id}`,
              {
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              }
            );
            if (assetResponse.ok) {
              const assetData = await assetResponse.json();
              image = assetData.fields?.file?.url || '';
              if (image.startsWith('//')) {
                image = 'https:' + image;
              }
            }
          } catch (error) {
            console.error('Error fetching stylist image:', error);
          }
        }

        setAssignedStylist({ name, image, title });
        console.log('✅ Set assigned stylist:', { name, image, title });

      } catch (error) {
        console.error('Error fetching assigned stylist:', error);
      } finally {
        setLoadingAssignedStylist(false);
      }
    };

    fetchAssignedStylist();
  }, [customer.sys.id]);

  const loadSelections = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/get/${customer.sys.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Backend response:', data);
        
        // Extract the actual data from the response wrapper
        const selectionData = data.data || data;
        
        // Load previously saved styling notes
        if (selectionData?.stylingNotes) {
          setStylingNotes(selectionData.stylingNotes);
          console.log('✅ Loaded styling notes:', selectionData.stylingNotes);
        } else {
          setStylingNotes('');
        }
        console.log('Previous selections available:', selectionData);
      }
    } catch (error) {
      console.error('Error loading selections:', error);
    }
  };

  const handleAddManual = () => {
    if (!manualUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(manualUrl);
      onAddItem(manualUrl);
      setManualUrl('');
      toast.success('Item added manually');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      toast.info('Saving complete snapshot to backend...');

      console.log('💾 ========== SAVE INITIATED ==========');
      
      // Extract client email from Contentful structure
      let clientEmail = '';
      const emailField = customer.fields?.email;
      
      if (typeof emailField === 'string') {
        clientEmail = emailField;
      } else if (typeof emailField === 'object' && emailField !== null) {
        if (emailField.nodeType === 'document' && emailField.content) {
          try {
            const firstParagraph = emailField.content[0];
            if (firstParagraph?.content && firstParagraph.content[0]?.value) {
              clientEmail = firstParagraph.content[0].value;
            }
          } catch (e) {
            console.error('Error parsing rich text email:', e);
          }
        }
      }
      
      clientEmail = clientEmail.trim();
      
      if (!clientEmail || !clientEmail.includes('@')) {
        toast.error('Customer email not found or invalid in Contentful');
        setSaving(false);
        return;
      }

      // Extract client name from Contentful Rich Text or plain string
      let clientName = '';
      const nameField = customer.fields?.name || customer.fields?.firstName;
      
      if (typeof nameField === 'string') {
        clientName = nameField.trim();
      } else if (typeof nameField === 'object' && nameField !== null) {
        if (nameField.nodeType === 'document' && nameField.content) {
          try {
            const firstParagraph = nameField.content[0];
            if (firstParagraph?.content && firstParagraph.content[0]?.value) {
              clientName = firstParagraph.content[0].value.trim();
            }
          } catch (e) {
            console.error('Error parsing rich text name:', e);
          }
        }
      }
      
      // Extract intake answers from Contentful Rich Text
      let intakeAnswers = '';
      const intakeField = customer.fields?.intake_answers;
      
      if (intakeField?.nodeType === 'document' && intakeField.content) {
        try {
          const textParts: string[] = [];
          intakeField.content.forEach((paragraph: any) => {
            if (paragraph.content) {
              paragraph.content.forEach((node: any) => {
                if (node.value) {
                  textParts.push(node.value);
                }
              });
            }
          });
          intakeAnswers = textParts.join('\n');
        } catch (e) {
          console.error('Error parsing intake answers:', e);
        }
      }

      // Get client image
      let clientImage = '';
      const customerImageData = customer.fields?.images;
      
      if (customerImageData && Array.isArray(customerImageData) && customerImageData.length > 0) {
        const firstImageRef = customerImageData[0];
        const assetId = firstImageRef.sys?.id;
        
        if (assetId) {
          try {
            const assetResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/assets/${assetId}`,
              {
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              }
            );
            if (assetResponse.ok) {
              const assetData = await assetResponse.json();
              clientImage = assetData.fields?.file?.url || '';
              if (clientImage.startsWith('//')) {
                clientImage = 'https:' + clientImage;
              }
            }
          } catch (error) {
            console.error('Error fetching customer image:', error);
          }
        }
      }

      // Get assigned stylist info (from the state that was already loaded)
      let stylistName = '';
      let stylistImage = '';
      let stylistId = '';

      if (assignedStylist) {
        stylistName = assignedStylist.name;
        stylistImage = assignedStylist.image;
        
        // Get stylist ID from customer fields
        const stylistIdField = customer.fields?.stylist_id;
        if (typeof stylistIdField === 'string') {
          stylistId = stylistIdField.trim();
        } else if (typeof stylistIdField === 'object' && stylistIdField !== null) {
          if (stylistIdField.nodeType === 'document' && stylistIdField.content) {
            try {
              const firstParagraph = stylistIdField.content[0];
              if (firstParagraph?.content && firstParagraph.content[0]?.value) {
                stylistId = firstParagraph.content[0].value.trim();
              }
            } catch (e) {
              console.error('Error parsing stylist ID:', e);
            }
          }
        }
      } else {
        toast.error('No stylist assigned to this customer');
        setSaving(false);
        return;
      }

      console.log('💾 Complete snapshot data:', {
        customerId: customer.sys.id,
        clientEmail,
        clientName,
        clientImage,
        stylistId,
        stylistName,
        stylistImage,
        stylingNotes,
        stylingNotesType: typeof stylingNotes,
        stylingNotesLength: stylingNotes?.length,
        stylingNotesValue: stylingNotes,
        intakeAnswers,
        itemsCount: selectedItems.length,
      });

      // Save complete snapshot to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerId: customer.sys.id,
            clientEmail,
            clientName,
            clientImage,
            stylistId,
            stylistName,
            stylistImage,
            stylingNotes,
            intakeAnswers,
            items: selectedItems,
            updatedAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save selections');
      }

      const data = await response.json();
      console.log('✅ Save complete:', data);

      toast.success('Complete snapshot saved to backend!');
    } catch (error: any) {
      console.error('Error saving selections:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleMigrateImages = async () => {
    try {
      setMigrating(true);
      toast.info('Re-hosting images for email compatibility...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/migrate-images/${customer.sys.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Migration failed:', errorData);
        throw new Error(errorData.error || 'Failed to migrate images');
      }

      const data = await response.json();
      console.log('✅ Migration complete:', data);
      console.log('📦 Updated items:', data.data?.items);
      
      toast.success(`✅ Re-hosted ${data.data?.items?.length || 0} images successfully! Please refresh the page.`);
      
    } catch (error: any) {
      console.error('Error migrating images:', error);
      toast.error(`Failed to migrate images: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const handleFixBucket = async () => {
    try {
      setFixingBucket(true);
      toast.info('🔧 Fixing storage bucket (one-time setup)...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/fix-bucket`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fix bucket');
      }

      const data = await response.json();
      console.log('✅ Bucket fixed:', data);
      
      toast.success('✅ Bucket fixed! Now click "Re-host Images" to update image URLs.');
    } catch (error: any) {
      console.error('Error fixing bucket:', error);
      toast.error(`Failed to fix bucket: ${error.message}`);
    } finally {
      setFixingBucket(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('⚠️ Clear all selections for this customer? This cannot be undone.')) {
      return;
    }

    try {
      setClearing(true);
      toast.info('🗑️ Clearing all selections...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/delete/${customer.sys.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear selections');
      }

      console.log('✅ Cleared all selections for customer');
      
      // Clear all items from UI
      selectedItems.forEach(item => onRemoveItem(item.id));
      
      // Clear notes and stylist
      setStylingNotes('');
      setSelectedStylist('');
      
      toast.success('✅ All selections cleared!');
    } catch (error: any) {
      console.error('Error clearing selections:', error);
      toast.error(`Failed to clear: ${error.message}`);
    } finally {
      setClearing(false);
    }
  };

  const sendDraft = async () => {
    try {
      if (selectedItems.length === 0) {
        toast.error('Please add at least one item before sending');
        return;
      }

      if (!assignedStylist) {
        toast.error('No stylist assigned to this customer');
        return;
      }

      // Validate styling notes are not empty
      if (!stylingNotes || stylingNotes.trim() === '') {
        toast.error('Styling notes are required before sending');
        setStylingNotesError(true);
        return;
      }

      // Clear error state if validation passes
      setStylingNotesError(false);

      setSending(true);

      console.log('🚀 ========== SEND INITIATED ==========');
      
      // STEP 1: Save complete snapshot to backend
      console.log('💾 STEP 1: Saving complete snapshot to backend...');
      toast.info('Saving data before sending...');

      // Extract client email
      let clientEmail = '';
      const emailField = customer.fields?.email;
      
      if (typeof emailField === 'string') {
        clientEmail = emailField.trim();
      } else if (typeof emailField === 'object' && emailField !== null) {
        if (emailField.nodeType === 'document' && emailField.content) {
          try {
            const firstParagraph = emailField.content[0];
            if (firstParagraph?.content && firstParagraph.content[0]?.value) {
              clientEmail = firstParagraph.content[0].value.trim();
            }
          } catch (e) {
            console.error('Error parsing email:', e);
          }
        }
      }
      
      if (!clientEmail || !clientEmail.includes('@')) {
        toast.error('Customer email not found or invalid');
        setSending(false);
        return;
      }

      // Extract client name from Contentful Rich Text or plain string
      let clientName = '';
      const nameField = customer.fields?.name || customer.fields?.firstName;
      
      if (typeof nameField === 'string') {
        clientName = nameField.trim();
      } else if (typeof nameField === 'object' && nameField !== null) {
        if (nameField.nodeType === 'document' && nameField.content) {
          try {
            const firstParagraph = nameField.content[0];
            if (firstParagraph?.content && firstParagraph.content[0]?.value) {
              clientName = firstParagraph.content[0].value.trim();
            }
          } catch (e) {
            console.error('Error parsing rich text name:', e);
          }
        }
      }
      
      // Extract intake answers
      let intakeAnswers = '';
      const intakeField = customer.fields?.intake_answers;
      if (intakeField?.nodeType === 'document' && intakeField.content) {
        try {
          const textParts: string[] = [];
          intakeField.content.forEach((paragraph: any) => {
            if (paragraph.content) {
              paragraph.content.forEach((node: any) => {
                if (node.value) {
                  textParts.push(node.value);
                }
              });
            }
          });
          intakeAnswers = textParts.join('\n');
        } catch (e) {
          console.error('Error parsing intake answers:', e);
        }
      }

      // Get client image
      let clientImage = '';
      const customerImageData = customer.fields?.images;
      if (customerImageData && Array.isArray(customerImageData) && customerImageData.length > 0) {
        const firstImageRef = customerImageData[0];
        const assetId = firstImageRef.sys?.id;
        
        if (assetId) {
          try {
            const assetResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/assets/${assetId}`,
              {
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              }
            );
            if (assetResponse.ok) {
              const assetData = await assetResponse.json();
              clientImage = assetData.fields?.file?.url || '';
              if (clientImage.startsWith('//')) {
                clientImage = 'https:' + clientImage;
              }
            }
          } catch (error) {
            console.error('Error fetching customer image:', error);
          }
        }
      }

      // Get stylist ID
      let stylistId = '';
      const stylistIdField = customer.fields?.stylist_id;
      if (typeof stylistIdField === 'string') {
        stylistId = stylistIdField.trim();
      } else if (typeof stylistIdField === 'object' && stylistIdField !== null) {
        if (stylistIdField.nodeType === 'document' && stylistIdField.content) {
          try {
            const firstParagraph = stylistIdField.content[0];
            if (firstParagraph?.content && firstParagraph.content[0]?.value) {
              stylistId = firstParagraph.content[0].value.trim();
            }
          } catch (e) {
            console.error('Error parsing stylist ID:', e);
          }
        }
      }

      // Save to backend
      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/selections/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerId: customer.sys.id,
            clientEmail,
            clientName,
            clientImage,
            stylistId,
            stylistName: assignedStylist.name,
            stylistImage: assignedStylist.image,
            stylingNotes,
            intakeAnswers,
            items: selectedItems,
            updatedAt: new Date().toISOString(),
          }),
        }
      );

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save selections');
      }

      console.log('✅ STEP 1 COMPLETE: Data saved to backend');

      // STEP 2: Send email via backend (backend reads from Supabase)
      console.log('📧 STEP 2: Sending email via backend...');
      toast.info('Sending email...');

      const sendResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/sendgrid/send-from-storage/${customer.sys.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const sendData = await sendResponse.json();
      
      if (!sendResponse.ok) {
        console.error('❌ Send email failed:', sendData);
        
        // Show detailed validation errors if available
        if (sendData.validationErrors && Array.isArray(sendData.validationErrors)) {
          const errorList = sendData.validationErrors.join('\n• ');
          throw new Error(`Missing required fields:\n• ${errorList}`);
        }
        
        throw new Error(sendData.error || sendData.details || 'Failed to send email');
      }

      console.log('✅ STEP 2 COMPLETE: Email sent successfully:', sendData);

      toast.success(`✅ Email sent to ${clientEmail}!`);
      
    } catch (error: any) {
      console.error('Error sending draft:', error);
      toast.error(`Failed to send: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const emptySlots = Math.max(0, 7 - selectedItems.length);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Assigned Stylist Display */}
      {loadingAssignedStylist ? (
        <div className="p-2 border-b border-gray-800 bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="ml-2 text-[9px] text-gray-500">Loading stylist...</span>
        </div>
      ) : assignedStylist ? (
        <div className="p-2 border-b border-gray-800 bg-gray-900">
          <div className="flex flex-col items-center gap-1">
            {assignedStylist.image ? (
              <img
                src={assignedStylist.image}
                alt={assignedStylist.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                <span className="text-gray-600 text-xs">👤</span>
              </div>
            )}
            <div className="text-center">
              <h3 className="text-[10px] text-white">{assignedStylist.name}</h3>
              {assignedStylist.title && (
                <p className="text-[8px] text-gray-400 uppercase tracking-wide">{assignedStylist.title}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="p-1.5 border-b border-gray-800">
        {/* Manual URL Input */}
        <div className="space-y-1">
          <Input
            type="url"
            placeholder="URL"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddManual();
              }
            }}
            disabled={selectedItems.length >= 7}
            className="text-[9px] h-6 px-1.5 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
          />
          <Button
            onClick={handleAddManual}
            disabled={selectedItems.length >= 7}
            size="sm"
            className="w-full h-5 text-[9px] px-1 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-2.5 w-2.5 mr-0.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Items List - Single Column */}
      <div className="flex-1 overflow-y-auto p-1">
        <div className="space-y-1.5">
          {selectedItems.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block border-2 border-gray-700 rounded overflow-hidden bg-gray-800 hover:border-blue-400 transition-all cursor-pointer group"
            >
              {/* Delete button - top right */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                className="absolute top-1 right-1 z-20 p-1 bg-red-900/90 hover:bg-red-800 rounded border border-red-700 shadow-lg"
              >
                <X className="h-3 w-3 text-white" />
              </button>

              {/* Number badge - top left */}
              <div className="absolute top-1 left-1 z-20 text-[10px] px-1.5 py-0.5 bg-gray-900/90 border border-gray-600 rounded shadow-lg text-white">
                #{index + 1}
              </div>

              {/* Image Section */}
              <div className="w-full aspect-square bg-gray-900 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      console.error('❌ Image failed to load:', item.image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-2">
                    <div className="w-8 h-8 mx-auto mb-1 bg-gray-800 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[9px] text-gray-500">No image</p>
                  </div>
                )}
              </div>
              
              {/* Info Section */}
              <div className="p-2 bg-gray-850">
                {/* Title */}
                <h3 className="text-[10px] text-white mb-1 line-clamp-3 leading-tight">
                  {item.title || 'Loading...'}
                </h3>
                
                {/* Price */}
                {item.price && (
                  <p className="text-[11px] text-blue-400 mb-1">
                    {item.price}
                  </p>
                )}
              </div>
            </a>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="border-2 border-dashed border-gray-700 rounded flex items-center justify-center aspect-square"
            >
              <p className="text-gray-600 text-[10px]">
                {selectedItems.length + index + 1}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-1.5 border-t border-gray-800 bg-gray-950">
        {/* Styling Notes */}
        <div className="mb-1.5">
          <textarea
            placeholder="Styling Notes"
            value={stylingNotes}
            onChange={(e) => {
              setStylingNotes(e.target.value);
              // Clear error when user starts typing
              if (stylingNotesError) {
                setStylingNotesError(false);
              }
            }}
            onFocus={() => setStylingNotesFocused(true)}
            onBlur={() => setStylingNotesFocused(false)}
            rows={stylingNotesFocused ? 18 : 6}
            className={`w-full text-[9px] px-1.5 py-1 bg-gray-800 rounded text-gray-100 placeholder:text-gray-500 resize-none focus:outline-none focus:ring-1 transition-all duration-300 ${
              stylingNotesError 
                ? 'border-2 border-red-500 focus:ring-red-500' 
                : 'border border-gray-700 focus:ring-blue-500'
            }`}
          />
          {stylingNotesError && (
            <p className="text-[9px] text-red-500 mt-1">Styling notes are required</p>
          )}
        </div>

        <div className="space-y-1">
          <Button
            onClick={handleSave}
            disabled={saving || selectedItems.length === 0}
            variant="ghost"
            size="sm"
            className="w-full h-5 text-[9px] px-1 text-gray-900"
            style={{ backgroundColor: '#E2DFDD', color: '#000' }}
          >
            {saving ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin mr-0.5" />
            ) : (
              <Save className="h-2.5 w-2.5 mr-0.5" />
            )}
            Save
          </Button>
          <Button
            onClick={sendDraft}
            disabled={sending || selectedItems.length === 0}
            variant="ghost"
            size="sm"
            className="w-full h-5 text-[9px] px-1 text-gray-900"
            style={{ backgroundColor: '#E2DFDD', color: '#000' }}
          >
            {sending ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin mr-0.5" />
            ) : (
              <Send className="h-2.5 w-2.5 mr-0.5" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}