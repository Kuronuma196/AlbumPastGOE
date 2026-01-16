import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';

// Importar estilos globais
import './index.css';

// Importar componentes de UI
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ui/theme-provider';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="album-past-goe-theme">
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;