
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Log for debugging
console.log('Starting application initialization');

try {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Error during initial render:', error);
  // Render error directly to DOM as a fallback
  rootElement.innerHTML = `
    <div style="padding: 20px; margin: 20px; background: #fff0f0; border: 1px solid #ffcccc; border-radius: 4px;">
      <h2 style="color: #cc0000; margin-bottom: 10px;">Critical Rendering Error</h2>
      <p>The application failed to initialize. Check the console for more details.</p>
      <pre style="background: #ffeeee; padding: 10px; overflow: auto; margin-top: 10px;">${
        error instanceof Error ? error.message : String(error)
      }</pre>
    </div>
  `;
}
