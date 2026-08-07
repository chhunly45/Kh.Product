import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { initializeCsrfToken } from './services/api';

let csrfBootstrapStarted = false;

const BootstrapCsrf = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    if (csrfBootstrapStarted) {
      return;
    }

    csrfBootstrapStarted = true;
    void initializeCsrfToken();
  }, []);

  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BootstrapCsrf>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BootstrapCsrf>
    </HelmetProvider>
  </React.StrictMode>
);
