/**
 * Debug component to show which version is running
 */
export function DebugVersion() {
  const buildTime = "2025-02-09 7:00PM";
  const buildVersion = "IONIC-COMPONENTS";
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-xs font-bold z-[999999]">
      🔵 BUILD {buildTime} - {buildVersion}
    </div>
  );
}