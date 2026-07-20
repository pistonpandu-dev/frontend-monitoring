import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut as firebaseSignOut
} from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const idToken = await user.getIdToken();
        setToken(idToken);
        
        // Set persistence
        await setPersistence(auth, browserLocalPersistence);
        
        // Refresh token periodically
        const refreshInterval = setInterval(async () => {
          try {
            const newToken = await user.getIdToken(true);
            setToken(newToken);
          } catch (error) {
            console.error('Token refresh failed:', error);
          }
        }, 50 * 60 * 1000); // Refresh every 50 minutes

        // Cleanup interval
        return () => clearInterval(refreshInterval);
      } else {
        setUser(null);
        setToken(null);
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const login = async (email, password, remember = false) => {
    try {
      const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      setUser(user);
      setToken(idToken);
      
      // Verify token with backend
      await verifyTokenWithBackend(idToken);
      
      toast.success('Login berhasil!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login gagal');
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setToken(null);
      toast.success('Logout berhasil');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout gagal');
    }
  };

  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email reset password telah dikirim');
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Gagal mengirim email reset password');
      return { success: false, error: error.message };
    }
  };

  const verifyTokenWithBackend = async (idToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    forgotPassword,
    isAdmin: user?.email === 'admin@example.com' // Sesuaikan dengan role admin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
