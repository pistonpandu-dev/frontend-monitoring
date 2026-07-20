import { useState, useEffect } from 'react';
import { requestPermission, setupFCMListener, updateFCMToken } from '../services/fcm';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (user) {
      initializeFCM();
    }
  }, [user]);

  const initializeFCM = async () => {
    try {
      const token = await requestPermission();
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        await updateFCMToken(user.uid, token);
        setupFCMListener();
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.error('FCM initialization error:', error);
      setPermission('error');
    }
  };

  return {
    fcmToken,
    permission,
    isSupported: 'Notification' in window,
    requestPermission: initializeFCM,
  };
};
