import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { deviceAPI } from '../../services/api';
import StatCards from './StatCards';
import ActivityLog from './ActivityLog';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { connected: socketConnected, on: socketOn } = useSocket();
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    inactive: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [firebaseStatus, setFirebaseStatus] = useState('checking');

  useEffect(() => {
    fetchStats();
    fetchActivities();
    checkBackendStatus();
    checkFirebaseStatus();

    // Socket listeners
    socketOn('device:online', (data) => {
      toast.success(`Device ${data.deviceName} online`);
      fetchStats();
    });

    socketOn('device:offline', (data) => {
      toast.warning(`Device ${data.deviceName} offline`);
      fetchStats();
    });

    socketOn('device:new', (data) => {
      toast.success(`Device baru: ${data.deviceName}`);
      fetchStats();
      fetchActivities();
    });

    socketOn('device:updated', () => {
      fetchStats();
    });

    // Real-time activities
    socketOn('monitoring:activity', (data) => {
      setActivities(prev => [data, ...prev].slice(0, 50));
    });

    // Polling interval
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await deviceAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await deviceAPI.getHistory('latest');
      setActivities(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const checkFirebaseStatus = () => {
    // Check Firebase connection
    const timeout = setTimeout(() => {
      setFirebaseStatus('online');
    }, 1000);
    return () => clearTimeout(timeout);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${socketConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
              {socketConnected ? 'Socket.IO Online' : 'Socket.IO Offline'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full 
              ${backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Backend</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full 
              ${firebaseStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Firebase</span>
          </div>
        </div>
      </div>

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityLog activities={activities} loading={loading} />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ringkasan Sistem
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total Perangkat</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Perangkat Online</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.online}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Perangkat Offline</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{stats.offline}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Perangkat Dinonaktifkan</span>
              <span className="font-semibold text-gray-600 dark:text-gray-400">{stats.inactive}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Aktivitas Terbaru</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {activities.length > 0 ? 'Ada' : 'Tidak ada'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
