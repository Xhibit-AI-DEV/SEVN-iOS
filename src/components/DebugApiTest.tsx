import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DebugApiTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testHealthEndpoint = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('🏥 Testing health endpoint...');
      addLog(`URL: https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/health`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      addLog(`Status: ${response.status}`);
      addLog(`OK: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        addLog(`Error: ${text}`);
      }
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      addLog(`Error type: ${error instanceof Error ? error.name : typeof error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCustomersList = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('📋 Testing customers list endpoint...');
      addLog(`URL: https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/list`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/list`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      addLog(`Status: ${response.status}`);
      addLog(`OK: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Response: ${JSON.stringify(data, null, 2)}`);
        addLog(`Customer count: ${data.customers?.length || 0}`);
      } else {
        const text = await response.text();
        addLog(`Error: ${text}`);
      }
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      addLog(`Error type: ${error instanceof Error ? error.name : typeof error}`);
    } finally {
      setLoading(false);
    }
  };

  const testByStylist = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('👩‍💼 Testing by-stylist endpoint...');
      addLog(`URL: https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/by-stylist/lissy`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/by-stylist/lissy`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      addLog(`Status: ${response.status}`);
      addLog(`OK: ${response.ok}`);
      addLog(`Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Response: ${JSON.stringify(data, null, 2)}`);
        addLog(`Customer count: ${data.customers?.length || 0}`);
      } else {
        const text = await response.text();
        addLog(`Error response: ${text}`);
      }
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      addLog(`Error type: ${error instanceof Error ? error.name : typeof error}`);
      addLog(`Error stack: ${error instanceof Error ? error.stack : 'No stack'}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestCustomer = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('👤 Creating test customer...');
      
      // First, we need to sign in or create a user
      addLog('Note: This requires authentication. Sign in first!');
      
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        addLog('❌ No auth token found. Please sign in first.');
        return;
      }
      
      addLog('✅ Auth token found');
      
      const testData = {
        stylistId: 'lissy_roddy',
        mainImageUrl: 'https://via.placeholder.com/400',
        referenceImages: [],
        answers: {
          style_preferences: 'Modern and minimal',
          favorite_brands: 'Test Brand',
          budget_range: '£100-200',
          sizes: {
            tops: 'M',
            bottoms: 'M',
            shoes: '9'
          }
        }
      };
      
      addLog(`Submitting intake: ${JSON.stringify(testData, null, 2)}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/submit-intake`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(testData),
        }
      );
      
      addLog(`Status: ${response.status}`);
      addLog(`OK: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        addLog(`❌ Error: ${text}`);
      }
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Debug Test Page</h1>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Project ID: <code className="bg-gray-100 px-2 py-1 rounded">{projectId}</code>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Base URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              https://{projectId}.supabase.co/functions/v1/make-server-b14d984c
            </code>
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={testHealthEndpoint}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Test Health Endpoint
          </button>

          <button
            onClick={testCustomersList}
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Test Customers List
          </button>

          <button
            onClick={testByStylist}
            disabled={loading}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            Test By Stylist (Lissy)
          </button>

          <button
            onClick={createTestCustomer}
            disabled={loading}
            className="w-full px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
          >
            Create Test Customer (requires sign in)
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
          {logs.length === 0 ? (
            <p className="text-gray-500">Click a button to test an endpoint...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}