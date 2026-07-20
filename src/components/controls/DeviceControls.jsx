import React, { useState, useEffect } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FaCamera, FaBell, FaLock, FaExclamationTriangle, 
  FaLightbulb, FaMobile, FaVolumeUp, FaVolumeDown,
  FaSync, FaRedo, FaTelegramPlane, FaPowerOff,
  FaMicrophone, FaMicrophoneAlt, FaVideo, FaMusic,
  FaQuestionCircle, FaCheck, FaTimes, FaArrowRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const DeviceControls = () => {
  const { devices, sendCommand, getDevice } = useDevice();
  const { on, emit } = useSocket();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(50);
  const [vibrateDuration, setVibrateDuration] = useState(1000);
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    type: 'info',
    priority: 'normal',
    sound: true,
    vibrate: true
  });
  const [commandHistory, setCommandHistory] = useState([]);
  const [flashlightStatus, setFlashlightStatus] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    // Socket listeners
    on('control:result', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        if (data.success) {
          toast.success(`Perintah ${data.command} berhasil`);
          // Add to history
          setCommandHistory(prev => [{
            id: Date.now(),
            command: data.command,
            status: 'success',
            timestamp: new Date(),
            deviceName: selectedDevice?.name
          }, ...prev].slice(0, 20));
        } else {
          toast.error(`Perintah ${data.command} gagal: ${data.message}`);
          setCommandHistory(prev => [{
            id: Date.now(),
            command: data.command,
            status: 'error',
            timestamp: new Date(),
            deviceName: selectedDevice?.name,
            message: data.message
          }, ...prev].slice(0, 20));
        }
        setLoading(false);
      }
    });

    on('control:status', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        if (data.command === 'flashlight') {
          setFlashlightStatus(data.status);
        }
      }
    });

    on('device:status', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setSelectedDevice(prev => ({ ...prev, status: data.status }));
        if (data.status === 'offline') {
          toast.warning('Perangkat offline, beberapa kontrol tidak tersedia');
        }
      }
    });

    return () => {
      // Cleanup
    };
  }, [selectedDevice]);

  const handleSelectDevice = async (deviceId) => {
    const device = await getDevice(deviceId);
    setSelectedDevice(device);
    setCommandHistory([]);
    setFlashlightStatus(false);
  };

  const handleCommand = async (command, data = {}) => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    if (selectedDevice.status !== 'online') {
      toast.error('Perangkat offline, perintah tidak dapat dikirim');
      return;
    }
    setLoading(true);
    const result = await sendCommand(selectedDevice.id, command, data);
    if (!result) {
      setLoading(false);
    }
    // Timeout for loading state
    setTimeout(() => setLoading(false), 5000);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationData.title || !notificationData.body) {
      toast.error('Title dan Body harus diisi');
      return;
    }
    await handleCommand('notification', notificationData);
    setNotificationData({ 
      title: '', 
      body: '', 
      type: 'info',
      priority: 'normal',
      sound: true,
      vibrate: true
    });
  };

  const handleToggleFlashlight = async () => {
    const newStatus = !flashlightStatus;
    setFlashlightStatus(newStatus);
    await handleCommand('flashlight', { status: newStatus });
  };

  const controls = [
    {
      id: 'screenshot',
      icon: FaCamera,
      label: 'Screenshot',
      color: 'bg-blue-600 hover:bg-blue-700',
      command: 'screenshot',
      description: 'Ambil tangkapan layar'
    },
    {
      id: 'ring',
      icon: FaBell,
      label: 'Ring Device',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      command: 'ring',
      description: 'Bunyikan perangkat'
    },
    {
      id: 'lock',
      icon: FaLock,
      label: 'Lock Device',
      color: 'bg-red-600 hover:bg-red-700',
      command: 'lock',
      description: 'Kunci perangkat'
    },
    {
      id: 'lost-mode',
      icon: FaExclamationTriangle,
      label: 'Lost Mode',
      color: 'bg-orange-600 hover:bg-orange-700',
      command: 'lost-mode',
      description: 'Aktifkan mode hilang'
    },
    {
      id: 'flashlight',
      icon: FaLightbulb,
      label: flashlightStatus ? 'Flashlight ON' : 'Flashlight OFF',
      color: flashlightStatus ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-purple-600 hover:bg-purple-700',
      command: 'flashlight',
      data: { status: !flashlightStatus },
      onClick: handleToggleFlashlight,
      description: 'Nyalakan/matikan senter'
    },
    {
      id: 'vibrate',
      icon: FaMobile,
      label: 'Vibrate',
      color: 'bg-pink-600 hover:bg-pink-700',
      command: 'vibrate',
      data: { duration: vibrateDuration },
      description: `Getar selama ${vibrateDuration}ms`
    },
    {
      id: 'sync',
      icon: FaSync,
      label: 'Sync Data',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      command: 'sync',
      description: 'Sinkronisasi data'
    },
    {
      id: 'refresh',
      icon: FaRedo,
      label: 'Refresh Device',
      color: 'bg-teal-600 hover:bg-teal-700',
      command: 'refresh',
      description: 'Refresh perangkat'
    }
  ];

  const getCommandIcon = (command) => {
    const found = controls.find(c => c.command === command);
    if (found) {
      const Icon = found.icon;
      return <Icon className="text-sm" />;
    }
    return <FaQuestionCircle className="text-sm" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kontrol Perangkat
        </h1>
        {selectedDevice && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Perangkat: <strong>{selectedDevice.name}</strong>
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${selectedDevice.status === 'online' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
              {selectedDevice.status === 'online' ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pilih Perangkat
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                  <span className="truncate">{device.name}</span>
                  <span className={`w-2 h-2 rounded-full
                    ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
                  </span>
                </div>
                {device.id === selectedDevice?.id && device.group && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {device.group}
                  </div>
                )}
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
                        onClick={control.onClick || (() => handleCommand(control.command, control.data))}
                        disabled={loading || selectedDevice?.status !== 'online'}
                        className={`${control.color} text-white p-4 rounded-lg transition-all
                          disabled:opacity-50 disabled:cursor-not-allowed
                          hover:scale-105 transform
                          flex flex-col items-center space-y-2`}
                        title={control.description}
                      >
                        <Icon className="text-2xl" />
                        <span className="text-sm font-medium">{control.label}</span>
                        <span className="text-xs opacity-75">{control.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Volume Control */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaVolumeUp className="mr-2 text-blue-500" />
                    Volume Control
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <FaVolumeDown className="text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volumeLevel}
                        onChange={(e) => setVolumeLevel(parseInt(e.target.value))}
                        className="flex-1"
                        disabled={selectedDevice?.status !== 'online'}
                      />
                      <FaVolumeUp className="text-gray-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Volume: {volumeLevel}%</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCommand('volume', { level: 0 })}
                          disabled={selectedDevice?.status !== 'online'}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          Mute
                        </button>
                        <button
                          onClick={() => handleCommand('volume', { level: volumeLevel })}
                          disabled={selectedDevice?.status !== 'online'}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vibrate Control */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaMobile className="mr-2 text-pink-500" />
                    Vibrate Control
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">
                        Durasi: {vibrateDuration}ms
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={vibrateDuration}
                        onChange={(e) => setVibrateDuration(parseInt(e.target.value))}
                        className="w-full"
                        disabled={selectedDevice?.status !== 'online'}
                      />
                    </div>
                    <button
                      onClick={() => handleCommand('vibrate', { duration: vibrateDuration })}
                      disabled={selectedDevice?.status !== 'online'}
                      className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <FaMobile className="mr-2" />
                      Getar Sekarang ({vibrateDuration}ms)
                    </button>
                  </div>
                </div>
              </div>

              {/* Audio Control */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaMicrophone className="mr-2 text-purple-500" />
                  Audio Control
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      setIsAudioEnabled(!isAudioEnabled);
                      toast.info(isAudioEnabled ? 'Audio dinonaktifkan' : 'Audio diaktifkan');
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center
                      ${isAudioEnabled 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  >
                    {isAudioEnabled ? <FaMicrophoneAlt className="mr-2" /> : <FaMicrophone className="mr-2" />}
                    {isAudioEnabled ? 'Audio ON' : 'Audio OFF'}
                  </button>
                  <button
                    onClick={() => handleCommand('notification', { 
                      title: 'Test Audio', 
                      body: 'Ini adalah test audio notification',
                      sound: true,
                      vibrate: true
                    })}
                    disabled={selectedDevice?.status !== 'online'}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                  >
                    <FaMusic className="mr-2" />
                    Test Sound
                  </button>
                </div>
              </div>

              {/* Push Notification */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaTelegramPlane className="mr-2 text-blue-500" />
                  Kirim Notifikasi
                </h3>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title *
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
                        disabled={selectedDevice?.status !== 'online'}
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
                        disabled={selectedDevice?.status !== 'online'}
                      >
                        <option value="info">ℹ️ Info</option>
                        <option value="success">✅ Success</option>
                        <option value="warning">⚠️ Warning</option>
                        <option value="error">❌ Error</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Body *
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
                      disabled={selectedDevice?.status !== 'online'}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={notificationData.priority === 'high'}
                        onChange={(e) => setNotificationData({
                          ...notificationData,
                          priority: e.target.checked ? 'high' : 'normal'
                        })}
                        className="mr-2"
                        disabled={selectedDevice?.status !== 'online'}
                      />
                      Priority
                    </label>
                    <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={notificationData.sound}
                        onChange={(e) => setNotificationData({
                          ...notificationData,
                          sound: e.target.checked
                        })}
                        className="mr-2"
                        disabled={selectedDevice?.status !== 'online'}
                      />
                      Sound
                    </label>
                    <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={notificationData.vibrate}
                        onChange={(e) => setNotificationData({
                          ...notificationData,
                          vibrate: e.target.checked
                        })}
                        className="mr-2"
                        disabled={selectedDevice?.status !== 'online'}
                      />
                      Vibrate
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || selectedDevice?.status !== 'online'}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FaTelegramPlane className="mr-2" />
                    {loading ? 'Mengirim...' : 'Kirim Notifikasi'}
                  </button>
                </form>
              </div>

              {/* Command History */}
              {commandHistory.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaArrowRight className="mr-2 text-gray-400" />
                    Riwayat Perintah
                  </h3>
                  <div className="max-h-48 overflow-y-auto">
                    {commandHistory.map((cmd) => (
                      <div key={cmd.id} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                        <div className="flex items-center space-x-2">
                          {getCommandIcon(cmd.command)}
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {cmd.command}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {cmd.timestamp ? new Date(cmd.timestamp).toLocaleTimeString() : ''}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {cmd.status === 'success' ? (
                            <FaCheck className="text-green-500" />
                          ) : (
                            <FaTimes className="text-red-500" />
                          )}
                          {cmd.message && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              {cmd.message}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <FaPowerOff className="text-6xl mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Pilih perangkat untuk mengontrol
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Pilih perangkat dari daftar di sebelah kiri
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceControls;
