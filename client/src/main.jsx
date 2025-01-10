import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpeedInsights/>
    <Analytics/>
    <App />
  </StrictMode>
);
