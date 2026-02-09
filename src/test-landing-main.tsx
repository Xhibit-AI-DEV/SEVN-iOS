import { LissyLanding } from './components/LissyLanding.tsx';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner@2.0.3';

const root = createRoot(document.getElementById('root')!);

const handleImageUpload = (file: File) => {
  console.log('Image uploaded:', file.name);
  alert(`Image uploaded: ${file.name}`);
};

root.render(
  <>
    <LissyLanding onImageUpload={handleImageUpload} />
    <Toaster position="top-center" />
  </>
);
