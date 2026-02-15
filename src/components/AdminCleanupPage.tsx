import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Eye, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useNavigate } from 'react-router-dom';

export function AdminCleanupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching cleanup preview...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/admin/cleanup-preview`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('📡 Preview response status:', response.status);
      const data = await response.json();
      console.log('📡 Preview response data:', data);

      if (response.ok) {
        setPreview(data.preview);
        setShowPreview(true);
        toast.success('Preview loaded');
      } else {
        console.error('❌ Preview failed:', data);
        toast.error(`Failed to load preview: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error loading preview:', error);
      toast.error(`Error loading preview: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('⚠️ This will DELETE ALL test data (orders, selections, conversations). Are you sure?')) {
      return;
    }

    if (!confirm('🔴 FINAL WARNING: This cannot be undone! Continue?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🧹 Starting cleanup...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/admin/cleanup-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('📡 Cleanup response status:', response.status);
      const data = await response.json();
      console.log('📡 Cleanup response data:', data);

      if (response.ok) {
        toast.success(`✅ Cleaned up ${data.deleted.total} items`);
        console.log('✅ Cleanup results:', data.deleted);
        setShowPreview(false);
        setPreview(null);
        
        // Reload preview to show empty state
        setTimeout(() => handlePreview(), 1000);
      } else {
        console.error('❌ Cleanup failed:', data);
        toast.error(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      toast.error(`Error during cleanup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 relative">
          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Cleanup
            </h1>
            <p className="text-gray-600">
              Clear all test data before showing the app to Lissy
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">Warning: Destructive Action</h3>
                <p className="text-red-800 text-sm mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-red-800 text-sm space-y-1 list-disc list-inside">
                  <li>All orders (waitlist, invited, paid, styling, completed)</li>
                  <li>All curated selections and styling notes</li>
                  <li>All SEVN conversation history</li>
                </ul>
                <p className="text-red-800 text-sm mt-3 font-semibold">
                  User accounts and profiles will NOT be deleted.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
              Preview What Will Be Deleted
            </button>

            <button
              onClick={handleCleanup}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              Delete All Test Data
            </button>
          </div>

          {/* Preview Display */}
          {showPreview && preview && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Preview</h3>
              
              <div className="space-y-4">
                {/* Orders */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Orders</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {preview.orders.count}
                    </span>
                  </div>
                  {preview.orders.count > 0 && (
                    <div className="bg-white rounded p-3 text-xs font-mono text-gray-600 max-h-40 overflow-y-auto">
                      {preview.orders.keys.slice(0, 10).map((key: string, i: number) => (
                        <div key={i} className="py-1">{key}</div>
                      ))}
                      {preview.orders.keys.length > 10 && (
                        <div className="py-1 text-gray-400">
                          ... and {preview.orders.keys.length - 10} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selections */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Selections</h4>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {preview.selections.count}
                    </span>
                  </div>
                  {preview.selections.count > 0 && (
                    <div className="bg-white rounded p-3 text-xs font-mono text-gray-600 max-h-40 overflow-y-auto">
                      {preview.selections.keys.slice(0, 10).map((key: string, i: number) => (
                        <div key={i} className="py-1">{key}</div>
                      ))}
                      {preview.selections.keys.length > 10 && (
                        <div className="py-1 text-gray-400">
                          ... and {preview.selections.keys.length - 10} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Conversations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Conversations</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {preview.conversations.count}
                    </span>
                  </div>
                  {preview.conversations.count > 0 && (
                    <div className="bg-white rounded p-3 text-xs font-mono text-gray-600 max-h-40 overflow-y-auto">
                      {preview.conversations.keys.slice(0, 10).map((key: string, i: number) => (
                        <div key={i} className="py-1">{key}</div>
                      ))}
                      {preview.conversations.keys.length > 10 && (
                        <div className="py-1 text-gray-400">
                          ... and {preview.conversations.keys.length - 10} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">Total Items</h4>
                    <span className="px-4 py-2 bg-gray-800 text-white rounded-lg text-lg font-bold">
                      {preview.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}