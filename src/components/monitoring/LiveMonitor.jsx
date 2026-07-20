import React, { useState, useEffect, useRef } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { FaCamera, FaVideo, FaMicrophone, FaDesktop, FaMobile } from 'react-icons/fa';
import toast from 'react-hot-toast';

const LiveMonitor = () => {
  const { devices, getDeviceInfo, sendCommand } = useDevice();
  const { on, emit } = useSocket();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    // Socket listeners
    on('monitoring:screenshot', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setScreenshots(prev => [data.image, ...prev].slice(0, 10));
        toast.success('Screenshot berhasil diambil');
      }
    });

    on('monitoring:activity', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        // Update activity log
      }
    });

    on('device:status', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setDeviceInfo(prev => ({ ...prev, status: data.status }));
      }
    });
  }, [selectedDevice]);

  const handleSelectDevice = async (deviceId) => {
    setSelectedDevice(devices.find(d => d.id === deviceId));
    const info = await getDeviceInfo(deviceId);
    setDeviceInfo(info);
    setScreenshots([]);
  };

  const handleTakeScreenshot = async () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    await sendCommand(selectedDevice.id, 'screenshot');
  };

  const handleStartRecording = () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    setIsRecording(true);
    toast.success('Merekam layar...');
    
    // Emit recording start event
    emit('monitoring:start-recording', { deviceId: selectedDevice.id });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.success('Rekaman berhenti');
    emit('monitoring:stop-recording', { deviceId: selectedDevice.id });
  };

  const handleToggleLive = () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    setIsLive(!isLive);
    if (!isLive) {
      toast.success('Memulai live streaming...');
      emit('monitoring:start-live', { deviceId: selectedDevice.id });
    } else {
      toast.success('Menghentikan live streaming');
      emit('monitoring:stop-live', { deviceId: selectedDevice.id });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Live Monitoring
        </h1>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            {isLive ? '● LIVE' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Perangkat
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

        {/* Monitoring Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video/Live Stream */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-900 aspect-video flex items-center justify-center">
              {isLive ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="text-center text-gray-400">
                  <FaDesktop className="text-6xl mx-auto mb-4" />
                  <p>{selectedDevice ? 'Klik "Start Live" untuk memulai' : 'Pilih perangkat terlebih dahulu'}</p>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              <button
                onClick={handleToggleLive}
                disabled={!selectedDevice}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors
                  ${isLive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLive ? 'Stop Live' : 'Start Live'}
              </button>
              <button
                onClick={handleTakeScreenshot}
                disabled={!selectedDevice}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCamera className="inline mr-2" />
                Screenshot
              </button>
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={!selectedDevice}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors
                  ${isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaVideo className="inline mr-2" />
                {isRecording ? 'Stop Record' : 'Record Screen'}
              </button>
            </div>
          </div>

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Screenshots Terbaru
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Device Info */}
          {deviceInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informasi Perangkat
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">OS</span>
                  <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.os || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Browser</span>
                  <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.browser || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">IP Address</span>
                  <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.ip || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Battery</span>
                  <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.battery || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
