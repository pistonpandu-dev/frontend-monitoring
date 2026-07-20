import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import DeviceList from './components/devices/DeviceList';
import DeviceDetails from './components/devices/DeviceDetails';
import LiveMonitor from './components/monitoring/LiveMonitor';
import LocationTracker from './components/monitoring/LocationTracker';
import DeviceInfo from './components/monitoring/DeviceInfo';
import DeviceControls from './components/controls/DeviceControls';
import { setupFCMListener, requestPermission } from './services/fcm';
import { auth } from './services/firebase';
import { updateFCMToken } from './services/fcm';
import './index.css';

const App = () => {
  useEffect(() => {
    // Setup FCM
    const initFCM = async () => {
      try {
        const token = await requestPermission();
        if (token) {
          console.log('FCM token:', token);
          // Send token to backend
          const user = auth.currentUser;
          if (user) {
            await updateFCMToken(user.uid, token);
          }
        }
        setupFCMListener();
      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };
    
    initFCM();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devices" element={<DeviceList />} />
                <Route path="/devices/:id" element={<DeviceDetails />} />
                <Route path="/monitoring" element={<LiveMonitor />} />
                <Route path="/monitoring/location" element={<LocationTracker />} />
                <Route path="/monitoring/info" element={<DeviceInfo />} />
                <Route path="/controls" element={<DeviceControls />} />
              </Route>
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
