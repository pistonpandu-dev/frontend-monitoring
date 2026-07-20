import React from 'react';
import { FaClock, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const ActivityLog = ({ activities, loading }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Aktivitas Terbaru
        </h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Aktivitas Terbaru
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activities.length} aktivitas
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FaInfoCircle className="text-4xl mx-auto mb-2 opacity-50" />
          <p>Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.slice(0, 20).map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="mt-1">{getIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.message}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <FaClock className="mr-1" />
                  {activity.timestamp ? getTimeAgo(activity.timestamp) : 'Baru saja'}
                  {activity.deviceName && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{activity.deviceName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
