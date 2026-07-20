import React, { useState, useEffect } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { FaMapMarkerAlt, FaHistory, FaCrosshairs } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const LocationTracker = () => {
  const { devices, getDeviceLocation } = useDevice();
  const { on, emit } = useSocket();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Socket listeners
    on('monitoring:location', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        setCurrentLocation(data);
        setLocationHistory(prev => [data, ...prev].slice(0, 50));
      }
    });

    on('device:status', (data) => {
      if (data.deviceId === selectedDevice?.id && data.status === 'offline') {
        toast.warning('Perangkat offline, lokasi tidak dapat diperbarui');
        setIsTracking(false);
      }
    });
  }, [selectedDevice]);

  const handleSelectDevice = async (deviceId) => {
    setSelectedDevice(devices.find(d => d.id === deviceId));
    const location = await getDeviceLocation(deviceId);
    setCurrentLocation(location);
    setLocationHistory([]);
  };

  const handleStartTracking = () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    setIsTracking(true);
    emit('monitoring:start-tracking', { deviceId: selectedDevice.id });
    toast.success('Mulai melacak lokasi');
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    emit('monitoring:stop-tracking', { deviceId: selectedDevice.id });
    toast.success('Berhenti melacak lokasi');
  };

  const handleGetCurrentLocation = async () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    const location = await getDeviceLocation(selectedDevice.id);
    setCurrentLocation(location);
    toast.success('Lokasi berhasil diperbarui');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pelacakan Lokasi
        </h1>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${isTracking ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            {isTracking ? '● Tracking' : 'Offline'}
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

        {/* Location Map */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-900 aspect-video flex items-center justify-center">
              {currentLocation ? (
                <div className="relative w-full h-full">
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <FaMapMarkerAlt className="text-6xl mx-auto mb-4 text-blue-500" />
                      <p className="text-white font-semibold">
                        {currentLocation.lat}, {currentLocation.lng}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Diperbarui: {formatDate(currentLocation.timestamp)}
                      </p>
                    </div>
                  </div>
                  {/* Google Maps would be integrated here */}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <FaMapMarkerAlt className="text-6xl mx-auto mb-4" />
                  <p>{selectedDevice ? 'Klik "Get Location" untuk melihat lokasi' : 'Pilih perangkat terlebih dahulu'}</p>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              <button
                onClick={isTracking ? handleStopTracking : handleStartTracking}
                disabled={!selectedDevice}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors
                  ${isTracking 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaCrosshairs className="inline mr-2" />
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </button>
              <button
                onClick={handleGetCurrentLocation}
                disabled={!selectedDevice}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Location
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                disabled={!selectedDevice}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaHistory className="inline mr-2" />
                Riwayat
              </button>
            </div>
          </div>

          {/* Location History */}
          {showHistory && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Riwayat Lokasi
              </h3>
              {locationHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Belum ada data lokasi
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Waktu</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Koordinat</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Akurasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationHistory.map((location, index) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {formatDate(location.timestamp)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {location.lat}, {location.lng}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {location.accuracy || '-'}m
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationTracker;
