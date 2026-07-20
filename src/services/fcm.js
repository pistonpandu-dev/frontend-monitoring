import { messaging, getToken, onMessage } from './firebase';
import toast from 'react-hot-toast';

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('FCM permission error:', error);
    return null;
  }
};

export const setupFCMListener = () => {
  onMessage(messaging, (payload) => {
    console.log('FCM Message received:', payload);
    
    const { title, body, type } = payload.data || payload.notification || {};
    
    // Show toast notification
    if (title && body) {
      toast[type === 'success' ? 'success' : 
             type === 'error' ? 'error' : 
             type === 'warning' ? 'warning' : 'custom'](body, {
        duration: 5000,
        icon: getNotificationIcon(type),
      });
    }
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title || 'Device Monitor', {
        body: body || 'Ada notifikasi baru',
        icon: '/favicon.ico',
        silent: true,
      });
      
      notification.onclick = () => {
        window.focus();
        // Handle click action based on payload
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
        notification.close();
      };
    }
  });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return '📱';
  }
};

export const updateFCMToken = async (userId, token) => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/devices/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, token }),
    });
  } catch (error) {
    console.error('Failed to update FCM token:', error);
  }
};
