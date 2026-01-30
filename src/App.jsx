import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './Dashboard';
import { authService, utils } from './services/api';
import { ModalProvider } from './contexts/ModalContext';
import GlobalModal from './components/common/GlobalModal';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuário já está logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = utils.getCurrentUser();
      
      if (token && savedUser && utils.isTokenValid()) {
        // Verificar se o token ainda é válido no servidor
        const result = await authService.me();
        if (result.success) {
          setUser(result.data.user);
        } else {
          // Token inválido, limpar dados
          utils.clearAuth();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ModalProvider>
      <GlobalModal />
      <Router>
        <Routes>
          {/* Rota pública - Landing Page */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LandingPage />
            } 
          />
          
          {/* Rota de Login */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          
          {/* Rota protegida - Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleLogin} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Redirecionar rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;