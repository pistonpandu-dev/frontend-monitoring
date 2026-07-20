import React, { useState, useEffect } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FaServer, FaNetworkWired, FaHdd, FaMemory, FaCpu, 
  FaBatteryHalf, FaWifi, FaBluetooth, FaAndroid, FaApple
} from 'react-icons/fa';
import { getStatusColor, getStatusText } from '../../utils/helpers';

const DeviceInfo = () => {
  const { devices, getDeviceInfo } = useDevice();
  const { on } = useSocket();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [applications, setApplications] = useState([]);
  const [runningApps, setRunningApps] = useState([]);
  const [showApps, setShowApps] = useState(false);
  const [showRunning, setShowRunning] = useState(false);

  useEffect(() => {
    // Socket listeners
    on('monitoring:device-info', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setDeviceInfo(data);
      }
    });

    on('monitoring:applications', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setApplications(data.apps || []);
      }
    });

    on('monitoring:running-apps', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setRunningApps(data.apps || []);
      }
    });

    on('monitoring:network', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setDeviceInfo(prev => ({ ...prev, network: data }));
      }
    });
  }, [selectedDevice]);

  const handleSelectDevice = async (deviceId) => {
    setSelectedDevice(devices.find(d => d.id === deviceId));
    const info = await getDeviceInfo(deviceId);
    setDeviceInfo(info);
    setApplications(info?.apps || []);
    setRunningApps(info?.runningApps || []);
  };

  const renderOSIcon = (os) => {
    if (!os) return <FaServer />;
    if (os.toLowerCase().includes('android')) return <FaAndroid />;
    if (os.toLowerCase().includes('ios') || os.toLowerCase().includes('mac')) return <FaApple />;
    return <FaServer />;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Informasi Perangkat
      </h1>

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

        {/* Device Information */}
        <div className="lg:col-span-3 space-y-6">
          {deviceInfo ? (
            <>
              {/* System Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  {renderOSIcon(deviceInfo.os)}
                  <span className="ml-2">Informasi Sistem</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">OS</span>
                    <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.os || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Hostname</span>
                    <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.hostname || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Platform</span>
                    <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.platform || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Hardware Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Spesifikasi Hardware
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">CPU</span>
                      <FaCpu className="text-blue-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.cpu || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">RAM</span>
                      <FaMemory className="text-purple-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.ram || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Storage</span>
                      <FaHdd className="text-green-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.storage || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Battery</span>
                      <FaBatteryHalf className="text-yellow-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.battery || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <FaNetworkWired className="inline mr-2" />
                  Jaringan
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">IP Address</span>
                    <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.ip || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">MAC Address</span>
                    <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.mac || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">WiFi</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {deviceInfo.wifi ? <FaWifi className="text-green-500" /> : 'Tidak terhubung'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Bluetooth</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {deviceInfo.bluetooth ? <FaBluetooth className="text-blue-500" /> : 'Tidak aktif'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Applications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Aplikasi
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowApps(!showApps)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      {showApps ? 'Sembunyikan' : 'Tampilkan'} Terinstall
                    </button>
                    <button
                      onClick={() => setShowRunning(!showRunning)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                    >
                      {showRunning ? 'Sembunyikan' : 'Tampilkan'} Berjalan
                    </button>
                  </div>
                </div>

                {showApps && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Aplikasi Terinstall ({applications.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {applications.map((app, index) => (
                          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                            {app.name || app}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {showRunning && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Aplikasi Berjalan ({runningApps.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {runningApps.map((app, index) => (
                          <div key={index} className="p-2 bg-green-50 dark:bg-green-900 rounded-lg text-sm">
                            {app.name || app}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Pilih perangkat untuk melihat informasi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceInfo;
