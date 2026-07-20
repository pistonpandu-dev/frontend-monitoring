import React, { useState, useEffect } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FaCamera, FaBell, FaLock, FaExclamationTriangle, 
  FaLightbulb, FaMobile, FaVolumeUp, FaVolumeDown,
  FaSync, FaRedo, FaTelegramPlane
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const DeviceControls = () => {
  const { devices, sendCommand, getDevice } = useDevice();
  const { on } = useSocket();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(50);
  const [vibrateDuration, setVibrateDuration] = useState(1000);
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    type: 'info'
  });

  useEffect(() => {
    // Socket listeners
    on('control:result', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        if (data.success) {
          toast.success(`Perintah ${data.command} berhasil`);
        } else {
          toast.error(`Perintah ${data.command} gagal: ${data.message}`);
        }
        setLoading(false);
      }
    });
  }, [selectedDevice]);

  const handleSelectDevice = async (deviceId) => {
    const device = await getDevice(deviceId);
    setSelectedDevice(device);
  };

  const handleCommand = async (command, data = {}) => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    setLoading(true);
    await sendCommand(selectedDevice.id, command, data);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationData.title || !notificationData.body) {
      toast.error('Title dan Body harus diisi');
      return;
    }
    await handleCommand('notification', notificationData);
    setNotificationData({ title: '', body: '', type: 'info' });
  };

  const controls = [
    {
      id: 'screenshot',
      icon: FaCamera,
      label: 'Screenshot',
      color: 'bg-blue-600 hover:bg-blue-700',
      command: 'screenshot'
    },
    {
      id: 'ring',
      icon: FaBell,
      label: 'Ring Device',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      command: 'ring'
    },
    {
      id: 'lock',
      icon: FaLock,
      label: 'Lock Device',
      color: 'bg-red-600 hover:bg-red-700',
      command: 'lock'
    },
    {
      id: 'lost-mode',
      icon: FaExclamationTriangle,
      label: 'Lost Mode',
      color: 'bg-orange-600 hover:bg-orange-700',
      command: 'lost-mode'
    },
    {
      id: 'flashlight',
      icon: FaLightbulb,
      label: 'Flashlight',
      color: 'bg-purple-600 hover:bg-purple-700',
      command: 'flashlight',
      data: { status: true }
    },
    {
      id: 'vibrate',
      icon: FaMobile,
      label: 'Vibrate',
      color: 'bg-pink-600 hover:bg-pink-700',
      command: 'vibrate',
      data: { duration: vibrateDuration }
    },
    {
      id: 'sync',
      icon: FaSync,
      label: 'Sync Data',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      command: 'sync'
    },
    {
      id: 'refresh',
      icon: FaRedo,
      label: 'Refresh Device',
      color: 'bg-teal-600 hover:bg-teal-700',
      command: 'refresh'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kontrol Perangkat
        </h1>
        {selectedDevice && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Perangkat: <strong>{selectedDevice.name}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pilih Perangkat
          </h2>
          <div className="space-y-2">
            {devices.map(device => (
              <button
                key={device.id}
                onClick={() => handleSelectDevice(device.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors
                  ${selectedDevice?.id === device.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <div className="flex items-center justify-between">
                  <span>{device.name}</span>
                  <span className={`w-2 h-2 rounded-full
                    ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-3 space-y-6">
          {selectedDevice ? (
            <>
              {/* Quick Controls */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Kontrol Cepat
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {controls.map(control => {
                    const Icon = control.icon;
                    return (
                      <button
                        key={control.id}
                        onClick={() => handleCommand(control.command, control.data)}
                        disabled={loading || selectedDevice?.status !== 'online'}
                        className={`${control.color} text-white p-4 rounded-lg transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed
                          flex flex-col items-center space-y-2`}
                      >
                        <Icon className="text-2xl" />
                        <span className="text-sm">{control.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Volume Control */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    <FaVolumeUp className="inline mr-2" />
                    Volume Control
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volumeLevel}
                      onChange={(e) => setVolumeLevel(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCommand('volume', { level: 0 })}
                        className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaVolumeDown className="inline" /> Mute
                      </button>
                      <button
                        onClick={() => handleCommand('volume', { level: volumeLevel })}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        Set Volume ({volumeLevel}%)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vibrate Control */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    <FaMobile className="inline mr-2" />
                    Vibrate Control
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={vibrateDuration}
                      onChange={(e) => setVibrateDuration(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Durasi: {vibrateDuration}ms
                      </span>
                      <button
                        onClick={() => handleCommand('vibrate', { duration: vibrateDuration })}
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded transition-colors"
                      >
                        <FaMobile className="inline mr-2" />
                        Getar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Push Notification */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  <FaTelegramPlane className="inline mr-2" />
                  Kirim Notifikasi
                </h3>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={notificationData.title}
                      onChange={(e) => setNotificationData({
                        ...notificationData,
                        title: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Judul notifikasi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Body
                    </label>
                    <textarea
                      value={notificationData.body}
                      onChange={(e) => setNotificationData({
                        ...notificationData,
                        body: e.target.value
                      })}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Isi notifikasi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={notificationData.type}
                      onChange={(e) => setNotificationData({
                        ...notificationData,
                        type: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || selectedDevice?.status !== 'online'}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTelegramPlane className="inline mr-2" />
                    Kirim Notifikasi
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Pilih perangkat untuk mengontrol
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceControls;
