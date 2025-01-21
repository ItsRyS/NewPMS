import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { SnackbarProvider } from './components/ReusableSnackbar';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider>
    <App />
    </SnackbarProvider>
  </StrictMode>
);
