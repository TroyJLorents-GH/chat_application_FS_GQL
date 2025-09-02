import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import AuthContext from './contexts/AuthContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ChatLayout from './components/ChatLayout';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // You could verify the token here if needed
      setUser({ token }); // For now, just set basic user info
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    // Clear Apollo cache
    client.clearStore();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route 
                path="/login" 
                element={user ? <Navigate to="/chat" /> : <Login />} 
              />
              <Route 
                path="/signup" 
                element={user ? <Navigate to="/chat" /> : <SignUp />} 
              />
              <Route 
                path="/chat/*" 
                element={user ? <ChatLayout /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/" 
                element={<Navigate to={user ? "/chat" : "/login"} />} 
              />
            </Routes>
          </div>
        </Router>
      </AuthContext.Provider>
    </ApolloProvider>
  );
}

export default App;
