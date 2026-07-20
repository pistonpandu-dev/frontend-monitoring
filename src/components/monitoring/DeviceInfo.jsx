import React, { useState, useEffect } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FaServer, FaNetworkWired, FaHdd, FaMemory, FaCpu, 
  FaBatteryHalf, FaWifi, FaBluetooth, FaAndroid, FaApple,
  FaWindows, FaLinux, FaChrome, FaFirefox, FaEdge,
  FaSafari, FaMicrochip, FaDatabase, FaClock, FaGlobe,
  FaPlug, FaPowerOff, FaInfoCircle
} from 'react-icons/fa';
import { getStatusColor, getStatusText, formatDate } from '../../utils/helpers';

const DeviceInfo = () => {
  const { devices, getDeviceInfo } = useDevice();
  const { on, emit } = useSocket();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [applications, setApplications] = useState([]);
  const [runningApps, setRunningApps] = useState([]);
  const [showApps, setShowApps] = useState(false);
  const [showRunning, setShowRunning] = useState(false);
  const [networkUsage, setNetworkUsage] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Socket listeners
    on('monitoring:device-info', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setDeviceInfo(data);
        setLoading(false);
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
        setNetworkUsage(data);
      }
    });

    on('monitoring:permissions', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setPermissions(data.permissions || []);
      }
    });

    on('device:status', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setDeviceInfo(prev => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      // Cleanup
    };
  }, [selectedDevice]);

  const handleSelectDevice = async (deviceId) => {
    setLoading(true);
    setSelectedDevice(devices.find(d => d.id === deviceId));
    const info = await getDeviceInfo(deviceId);
    setDeviceInfo(info);
    setApplications(info?.apps || []);
    setRunningApps(info?.runningApps || []);
    setNetworkUsage(info?.network || null);
    setPermissions(info?.permissions || []);
    setLoading(false);
  };

  const renderOSIcon = (os) => {
    if (!os) return <FaServer className="text-gray-400" />;
    const osLower = os.toLowerCase();
    if (osLower.includes('android')) return <FaAndroid className="text-green-500" />;
    if (osLower.includes('ios') || osLower.includes('mac') || osLower.includes('darwin')) 
      return <FaApple className="text-gray-400" />;
    if (osLower.includes('windows')) return <FaWindows className="text-blue-500" />;
    if (osLower.includes('linux')) return <FaLinux className="text-yellow-500" />;
    return <FaServer className="text-purple-500" />;
  };

  const renderBrowserIcon = (browser) => {
    if (!browser) return <FaGlobe className="text-gray-400" />;
    const browserLower = browser.toLowerCase();
    if (browserLower.includes('chrome')) return <FaChrome className="text-green-500" />;
    if (browserLower.includes('firefox')) return <FaFirefox className="text-orange-500" />;
    if (browserLower.includes('edge')) return <FaEdge className="text-blue-500" />;
    if (browserLower.includes('safari')) return <FaSafari className="text-blue-400" />;
    return <FaGlobe className="text-purple-500" />;
  };

  const getBatteryIcon = (battery) => {
    if (!battery) return <FaBatteryHalf className="text-gray-400" />;
    const level = parseInt(battery);
    if (level >= 80) return <FaBatteryHalf className="text-green-500" />;
    if (level >= 50) return <FaBatteryHalf className="text-yellow-500" />;
    return <FaBatteryHalf className="text-red-500" />;
  };

  const getBatteryColor = (battery) => {
    if (!battery) return 'text-gray-400';
    const level = parseInt(battery);
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Informasi Perangkat
        </h1>
        {selectedDevice && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deviceInfo?.status)} text-white`}>
            {getStatusText(deviceInfo?.status)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Perangkat
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
                {device.id === selectedDevice?.id && deviceInfo?.os && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    {renderOSIcon(deviceInfo.os)}
                    <span className="ml-1">{deviceInfo.os}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Device Information */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat informasi perangkat...</p>
            </div>
          ) : deviceInfo ? (
            <>
              {/* System Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    {renderOSIcon(deviceInfo.os)}
                    <span className="ml-2">Informasi Sistem</span>
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FaClock className="mr-1" />
                    Terakhir diperbarui: {deviceInfo.updatedAt ? formatDate(deviceInfo.updatedAt) : 'Baru saja'}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FaServer className="mr-1" /> OS
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.os || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FaGlobe className="mr-1" /> Browser
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center">
                      {renderBrowserIcon(deviceInfo.browser)}
                      <span className="ml-1">{deviceInfo.browser || '-'}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FaNetworkWired className="mr-1" /> Platform
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.platform || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FaClock className="mr-1" /> Uptime
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.uptime || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardware Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaMicrochip className="mr-2 text-blue-500" />
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
                    {deviceInfo.cpuUsage && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full" 
                            style={{ width: `${deviceInfo.cpuUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {deviceInfo.cpuUsage}% usage
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">RAM</span>
                      <FaMemory className="text-purple-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.ram || '-'}
                    </p>
                    {deviceInfo.ramUsage && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-purple-500 h-1 rounded-full" 
                            style={{ width: `${deviceInfo.ramUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {deviceInfo.ramUsage}% usage
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Storage</span>
                      <FaHdd className="text-green-500" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {deviceInfo.storage || '-'}
                    </p>
                    {deviceInfo.storageUsage && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full" 
                            style={{ width: `${deviceInfo.storageUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {deviceInfo.storageUsage}% usage
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Battery</span>
                      {getBatteryIcon(deviceInfo.battery)}
                    </div>
                    <p className={`font-medium mt-1 ${getBatteryColor(deviceInfo.battery)}`}>
                      {deviceInfo.battery || '-'}
                    </p>
                    {deviceInfo.battery && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${getBatteryColor(deviceInfo.battery)}`}
                            style={{ width: `${deviceInfo.battery}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {deviceInfo.batteryCharging ? '🔌 Charging' : 'Battery'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaNetworkWired className="mr-2 text-green-500" />
                  Jaringan
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">IP Address</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1 font-mono">
                      {deviceInfo.ip || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">MAC Address</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1 font-mono">
                      {deviceInfo.mac || '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">WiFi</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center">
                      {deviceInfo.wifi ? (
                        <>
                          <FaWifi className="text-green-500 mr-1" />
                          {deviceInfo.wifiName || 'Connected'}
                        </>
                      ) : (
                        'Tidak terhubung'
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Bluetooth</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center">
                      {deviceInfo.bluetooth ? (
                        <>
                          <FaBluetooth className="text-blue-500 mr-1" />
                          {deviceInfo.bluetoothName || 'Active'}
                        </>
                      ) : (
                        'Tidak aktif'
                      )}
                    </p>
                  </div>
                </div>
                {networkUsage && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Download</span>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {networkUsage.download || '0 KB/s'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Upload</span>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {networkUsage.upload || '0 KB/s'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Download</span>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {networkUsage.totalDownload || '0 MB'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Upload</span>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {networkUsage.totalUpload || '0 MB'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Permissions */}
              {permissions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaInfoCircle className="mr-2 text-yellow-500" />
                    Izin Perangkat
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {permissions.map((perm, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className={`w-2 h-2 rounded-full mr-2 ${perm.granted ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{perm.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaDatabase className="mr-2 text-purple-500" />
                    Aplikasi
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowApps(!showApps)}
                      className={`px-3 py-1 rounded text-sm transition-colors
                        ${showApps 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'}`}
                    >
                      {showApps ? 'Sembunyikan' : 'Tampilkan'} Terinstall ({applications.length})
                    </button>
                    <button
                      onClick={() => setShowRunning(!showRunning)}
                      className={`px-3 py-1 rounded text-sm transition-colors
                        ${showRunning 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'}`}
                    >
                      {showRunning ? 'Sembunyikan' : 'Tampilkan'} Berjalan ({runningApps.length})
                    </button>
                  </div>
                </div>

                {showApps && applications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Aplikasi Terinstall
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {applications.map((app, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                            <FaPlug className="mr-2 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{app.name || app}</span>
                            {app.version && (
                              <span className="ml-auto text-xs text-gray-400">v{app.version}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {showRunning && runningApps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Aplikasi Berjalan
                    </h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {runningApps.map((app, index) => (
                          <div key={index} className="flex items-center p-2 bg-green-50 dark:bg-green-900 rounded-lg text-sm">
                            <FaPowerOff className="mr-2 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">{app.name || app}</span>
                            {app.cpu && (
                              <span className="ml-auto text-xs text-gray-400">{app.cpu}% CPU</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(!showApps || applications.length === 0) && (!showRunning || runningApps.length === 0) && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Tidak ada data aplikasi
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <FaServer className="text-6xl mx-auto mb-4 text-gray-400" />
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
