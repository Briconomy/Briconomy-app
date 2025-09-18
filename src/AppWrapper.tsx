import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';

function AppWrapper() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;