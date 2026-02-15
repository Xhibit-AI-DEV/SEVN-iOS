import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useNavigate } from 'react-router-dom';

export function SimpleDebug() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<string>('Loading...');

  useEffect(() => {
    const runCheck = async () => {
      const accessToken = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      
      let debugText = '=== SIMPLE DEBUG ===\n\n';
      debugText += `Access Token: ${accessToken ? 'EXISTS' : 'MISSING'}\n`;
      debugText += `User ID: ${userId || 'MISSING'}\n\n`;
      
      if (accessToken) {
        try {
          debugText += 'Fetching orders...\n';
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/customer/me`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          
          debugText += `Response Status: ${response.status}\n`;
          
          if (response.ok) {
            const data = await response.json();
            debugText += `Orders Found: ${data.orders?.length || 0}\n\n`;
            
            if (data.orders && data.orders.length > 0) {
              debugText += 'ORDERS:\n';
              data.orders.forEach((order: any, i: number) => {
                debugText += `\n${i + 1}. ${order.id}\n`;
                debugText += `   Status: ${order.status}\n`;
                debugText += `   Created: ${order.created_at}\n`;
                debugText += `   Customer: ${order.customer_id}\n`;
              });
            } else {
              debugText += '\n❌ NO ORDERS FOUND\n\n';
              debugText += 'Possible reasons:\n';
              debugText += '1. You haven\'t submitted any styling requests\n';
              debugText += '2. Orders weren\'t saved to the database\n';
              debugText += '3. Customer ID mismatch\n';
            }
          } else {
            const errorText = await response.text();
            debugText += `ERROR: ${errorText}\n`;
          }
        } catch (error) {
          debugText += `ERROR: ${error}\n`;
        }
      }
      
      setInfo(debugText);
    };
    
    runCheck();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Debug</h1>
      
      {!localStorage.getItem('access_token') && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700 font-bold mb-2">⚠️ NOT SIGNED IN</p>
          <p className="text-red-600 mb-4">Your session has expired or you're not signed in.</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign In
          </button>
        </div>
      )}
      
      <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap font-mono">
        {info}
      </pre>
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate('/customer-inbox')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Inbox
        </button>
        <button
          onClick={() => navigate('/signin')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}