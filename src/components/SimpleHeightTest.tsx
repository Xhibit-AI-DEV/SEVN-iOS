/**
 * Ultra-simple height test for iOS debugging
 */

export function SimpleHeightTest() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        // @ts-ignore - webkit specific
        height: '-webkit-fill-available',
        background: 'linear-gradient(to bottom, #ff0000, #0000ff)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '20px',
        overflow: 'auto'
      }}
    >
      <div style={{ background: 'rgba(0,0,0,0.8)', padding: '30px', borderRadius: '10px', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
          🔧 iOS Height Debug
        </h1>
        
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Window dimensions:</strong>
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>innerHeight: {window.innerHeight}px</li>
            <li>innerWidth: {window.innerWidth}px</li>
            <li>screen.height: {window.screen.height}px</li>
            <li>screen.width: {window.screen.width}px</li>
          </ul>
          
          <p style={{ marginBottom: '10px' }}>
            <strong>Visual check:</strong>
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>✅ Red at top, blue at bottom = WORKING</li>
            <li>❌ White space at bottom = BROKEN</li>
            <li>✅ This box centered = WORKING</li>
            <li>❌ This box at top = BROKEN</li>
          </ul>
          
          <p style={{ marginBottom: '10px' }}>
            <strong>Device:</strong>
          </p>
          <ul style={{ marginLeft: '20px' }}>
            <li style={{ fontSize: '11px', wordBreak: 'break-all' }}>
              {navigator.userAgent}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
