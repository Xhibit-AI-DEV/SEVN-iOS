import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useNavigate } from 'react-router';

export function DebugOrders() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/debug/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const debugData = await response.json();
        setData(debugData);
        console.log('🐛 Debug data:', debugData);
      } else {
        console.error('Failed to fetch debug data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Debug: All Orders in KV Store</h1>
          <button
            onClick={() => navigate('/customer-inbox')}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Back to Inbox
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Current User Info:</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify({
              user_id: localStorage.getItem('user_id'),
              user_email: localStorage.getItem('user_email'),
              user_name: localStorage.getItem('user_name'),
              user_role: localStorage.getItem('user_role'),
            }, null, 2)}
          </pre>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : data ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Summary:</h2>
              <ul className="list-disc list-inside bg-blue-50 p-4 rounded">
                <li>Total Orders: {data.total_orders}</li>
                <li>Customer Indexes: {data.customer_indexes?.length || 0}</li>
                <li>Stylist Indexes: {data.stylist_indexes?.length || 0}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">All Orders:</h2>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data.orders, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Customer Indexes:</h2>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data.customer_indexes, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Stylist Indexes:</h2>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data.stylist_indexes, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p>No data</p>
        )}
      </div>
    </div>
  );
}
