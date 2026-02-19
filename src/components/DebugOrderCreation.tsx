import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

/**
 * Debug component to test order creation independently
 * Add this to a route temporarily to test order creation flow
 */
export function DebugOrderCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [orderResult, setOrderResult] = useState<any>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testOrderCreation = async () => {
    setIsCreating(true);
    setLogs([]);
    setOrderResult(null);

    try {
      addLog('🚀 Starting order creation test...');

      // Step 1: Get access token
      addLog('📝 Step 1: Getting access token...');
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`);
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session?.access_token) {
        addLog('❌ No active session found');
        throw new Error('No active session. Please sign in first.');
      }

      const accessToken = session.access_token;
      addLog(`✅ Access token obtained (length: ${accessToken.length})`);
      addLog(`   User ID: ${session.user.id}`);
      addLog(`   Email: ${session.user.email}`);

      // Step 2: Create test order
      addLog('📝 Step 2: Creating test order...');
      
      const testOrderData = {
        stylistId: 'lewis_bloyce',
        mainImageUrl: 'https://via.placeholder.com/400x600/000/fff?text=Test+Image',
        referenceImages: [],
        intakeAnswers: {
          q1: 'Test answer 1',
          q2: 'Test answer 2',
          q3: 'Test answer 3',
          q4: 'Test answer 4',
          q5: 'Test answer 5',
        },
        status: 'intake_submitted',
      };

      addLog(`   Payload: ${JSON.stringify(testOrderData, null, 2)}`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(testOrderData),
        }
      );

      addLog(`   Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ Error response: ${errorText}`);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      addLog(`✅ Order created successfully!`);
      addLog(`   Order ID: ${result.order_id}`);
      addLog(`   Status: ${result.status}`);
      addLog(`   Message: ${result.message}`);

      setOrderResult(result);

      // Step 3: Verify order was saved
      addLog('📝 Step 3: Verifying order was saved...');
      
      const verifyResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/${result.order_id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        addLog(`✅ Order verified in database`);
        addLog(`   Customer: ${verifyData.order.customer_name}`);
        addLog(`   Stylist: ${verifyData.order.stylist_id}`);
      } else {
        addLog(`⚠️ Could not verify order: ${verifyResponse.status}`);
      }

      // Step 4: Check my-orders endpoint
      addLog('📝 Step 4: Checking /my-orders endpoint...');
      
      const myOrdersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/orders/my-orders`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (myOrdersResponse.ok) {
        const myOrders = await myOrdersResponse.json();
        addLog(`✅ /my-orders returned ${myOrders.length} orders`);
        if (myOrders.length > 0) {
          addLog(`   Most recent: ${myOrders[0].id} (${myOrders[0].status})`);
        }
      } else {
        const errorText = await myOrdersResponse.text();
        addLog(`⚠️ /my-orders failed: ${myOrdersResponse.status} - ${errorText}`);
      }

      addLog('🎉 Test completed successfully!');
      toast.success('Order creation test passed!');

    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message}`);
      addLog(`   Stack: ${error.stack}`);
      toast.error(error.message || 'Test failed');
    } finally {
      setIsCreating(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setOrderResult(null);
  };

  return (
    <div className="w-full min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Order Creation Debug Tool</h1>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Debug Tool:</strong> This component tests the order creation flow.
            Make sure you're signed in before running the test.
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={testOrderCreation}
            disabled={isCreating}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Testing...' : 'Run Order Creation Test'}
          </button>
          
          <button
            onClick={clearLogs}
            className="px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
          >
            Clear Logs
          </button>
        </div>

        {orderResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-bold text-green-800 mb-2">✅ Order Created</h2>
            <pre className="text-xs text-green-700 overflow-auto">
              {JSON.stringify(orderResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="font-bold mb-2">Console Logs:</h2>
          <div className="font-mono text-xs space-y-1 max-h-96 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet. Click "Run Test" to start.</p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index}
                  className={`${
                    log.includes('❌') ? 'text-red-600' :
                    log.includes('✅') ? 'text-green-600' :
                    log.includes('⚠️') ? 'text-yellow-600' :
                    'text-gray-700'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
