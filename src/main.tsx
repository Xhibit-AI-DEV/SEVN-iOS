import { createRoot } from 'react-dom/client';
import CustomerApp from './CustomerApp.tsx';
import './styles/globals.css'; // Import global styles

const root = createRoot(document.getElementById('root')!);
root.render(<CustomerApp />);

// Hide splash screen after app loads
const splashScreen = document.getElementById('splash-screen');
if (splashScreen) {
  splashScreen.classList.add('hidden');
}