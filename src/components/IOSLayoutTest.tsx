/**
 * iOS Layout Test Page
 * This page tests if the min-h-screen fix is working correctly on iOS
 */

export function IOSLayoutTest() {
  return (
    <div 
      className="fixed inset-0 w-full overflow-x-hidden overflow-y-auto bg-gradient-to-b from-blue-500 to-purple-500"
      style={{
        height: '100vh',
        height: '-webkit-fill-available'
      }}
    >
      <div className="min-h-full flex flex-col">
        {/* Header - Fixed at top */}
        <div className="bg-white p-4 shadow-md">
          <h1 className="text-xl font-bold text-center">iOS Layout Test</h1>
          <p className="text-sm text-center text-gray-600">Testing min-h-screen fix</p>
        </div>

        {/* Main content - Should fill remaining space */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Height Test</h2>
            
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-green-100 rounded">
                <p className="font-semibold">✅ If you see this centered vertically:</p>
                <p>The iOS height fix is working!</p>
              </div>
              
              <div className="p-3 bg-yellow-100 rounded">
                <p className="font-semibold">⚠️ If this is squished at the top:</p>
                <p>The fix is NOT working properly</p>
              </div>

              <div className="p-3 bg-blue-100 rounded">
                <p className="font-semibold">📱 Device Info:</p>
                <p>Window Height: {window.innerHeight}px</p>
                <p>Screen Height: {window.screen.height}px</p>
                <p>User Agent: {navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Other'}</p>
              </div>

              <div className="p-3 bg-purple-100 rounded">
                <p className="font-semibold">🔍 CSS Check:</p>
                <p className="text-xs break-all">
                  Check DevTools: .min-h-screen should have min-height: -webkit-fill-available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="bg-white p-4 shadow-md">
          <p className="text-center text-sm text-gray-600">
            If you see both header and footer, the page fills the screen ✅
          </p>
        </div>
      </div>
    </div>
  );
}