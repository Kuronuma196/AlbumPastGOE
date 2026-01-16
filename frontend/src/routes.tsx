import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Albums from './pages/Albums';
import AlbumView from './pages/AlbumView';
import PublicAlbum from './pages/PublicAlbum';
import NotFound from './pages/NotFound';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rotas públicas apenas para não-autenticados
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/albums" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas públicas (apenas para não autenticados) */}
      <Route path="/login" element={
        <PublicOnlyRoute>
          <Login />
        </PublicOnlyRoute>
      } />
      
      <Route path="/register" element={
        <PublicOnlyRoute>
          <Register />
        </PublicOnlyRoute>
      } />

      {/* Rota pública de álbum compartilhado */}
      <Route path="/album/public/:token" element={<PublicAlbum />} />

      {/* Rotas protegidas */}
      <Route path="/albums" element={
        <ProtectedRoute>
          <Albums />
        </ProtectedRoute>
      } />
      
      <Route path="/album/:id" element={
        <ProtectedRoute>
          <AlbumView />
        </ProtectedRoute>
      } />

      {/* Redirecionamentos */}
      <Route path="/" element={<Navigate to="/albums" replace />} />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;