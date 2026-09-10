import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { PharmacyProvider } from '@/lib/store';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <PharmacyProvider>
        <App />
      </PharmacyProvider>
    </BrowserRouter>
  </React.StrictMode>
);
