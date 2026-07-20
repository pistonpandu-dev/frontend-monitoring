import React, { useState, useEffect, useRef } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FaMapMarkerAlt, FaHistory, FaCrosshairs, FaSearch,
  FaPlay, FaPause, FaDownload, FaTrash, FaLocationArrow,
  FaStreetView, FaGlobe
} from 'react-icons/fa';
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
  const [zoom, setZoom] = useState(15);
  const [mapType, setMapType] = useState('roadmap');
  const mapRef = useRef(null);

  useEffect(() => {
    // Socket listeners
    on('monitoring:location', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        const locationData = {
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date(data.timestamp),
          accuracy: data.accuracy,
          speed: data.speed,
          heading: data.heading,
          altitude: data.altitude
        };
        setCurrentLocation(locationData);
        setLocationHistory(prev => [locationData, ...prev].slice(0, 100));
        updateMap(locationData);
      }
    });

    on('device:status', (data) => {
      if (data.deviceId === selectedDevice?.id && data.status === 'offline') {
        toast.warning('Perangkat offline, lokasi tidak dapat diperbarui');
        setIsTracking(false);
      }
    });

    on('monitoring:location-error', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        toast.error(`Error lokasi: ${data.message}`);
      }
    });

    return () => {
      if (mapRef.current) {
        // Cleanup map
      }
    };
  }, [selectedDevice]);

  const handleSelectDevice = async (deviceId) => {
    setSelectedDevice(devices.find(d => d.id === deviceId));
    const location = await getDeviceLocation(deviceId);
    if (location) {
      setCurrentLocation({
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date(location.timestamp),
        accuracy: location.accuracy
      });
      updateMap(location);
    }
    setLocationHistory([]);
    setIsTracking(false);
  };

  const handleStartTracking = () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    if (selectedDevice.status !== 'online') {
      toast.error('Perangkat offline, tidak dapat melacak lokasi');
      return;
    }
    setIsTracking(true);
    emit('monitoring:start-tracking', { 
      deviceId: selectedDevice.id,
      interval: 5000 // 5 seconds
    });
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
    if (selectedDevice.status !== 'online') {
      toast.error('Perangkat offline, tidak dapat mengambil lokasi');
      return;
    }
    const location = await getDeviceLocation(selectedDevice.id);
    if (location) {
      setCurrentLocation({
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date(location.timestamp),
        accuracy: location.accuracy
      });
      updateMap(location);
      toast.success('Lokasi berhasil diperbarui');
    }
  };

  const updateMap = (location) => {
    if (!location) return;
    // In production, this would update a real map (Google Maps, Leaflet, etc.)
    console.log('Updating map to:', location.lat, location.lng);
  };

  const downloadLocationHistory = () => {
    if (locationHistory.length === 0) {
      toast.error('Tidak ada riwayat lokasi untuk diunduh');
      return;
    }

    const data = locationHistory.map((loc, index) => ({
      no: index + 1,
      timestamp: formatDate(loc.timestamp),
      latitude: loc.lat,
      longitude: loc.lng,
      accuracy: loc.accuracy || '-',
      speed: loc.speed || '-'
    }));

    const csv = [
      ['No', 'Timestamp', 'Latitude', 'Longitude', 'Accuracy (m)', 'Speed (km/h)'],
      ...data.map(d => [d.no, d.timestamp, d.latitude, d.longitude, d.accuracy, d.speed])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `location-history-${selectedDevice?.name || 'device'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Riwayat lokasi berhasil diunduh');
  };

  const clearLocationHistory = () => {
    if (window.confirm('Yakin ingin menghapus semua riwayat lokasi?')) {
      setLocationHistory([]);
      toast.success('Riwayat lokasi dihapus');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pelacakan Lokasi
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
            ${isTracking ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <FaLocationArrow className={`text-xs mr-1 ${isTracking ? 'text-white' : 'text-gray-500'}`} />
            {isTracking ? '● Tracking' : 'Offline'}
          </span>
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            className="px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
          >
            <option value="roadmap">Peta Jalan</option>
            <option value="satellite">Satelit</option>
            <option value="hybrid">Hybrid</option>
            <option value="terrain">Terrain</option>
          </select>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 1))}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              -
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Zoom: {zoom}</span>
            <button
              onClick={() => setZoom(Math.min(20, zoom + 1))}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>
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
                {device.id === selectedDevice?.id && currentLocation && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location Map */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
              {currentLocation ? (
                <div className="relative w-full h-full">
                  {/* Map Placeholder - In production, integrate with Google Maps or Leaflet */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                    <div className="text-center text-white">
                      <FaMapMarkerAlt className="text-6xl mx-auto mb-4 text-red-500 animate-pulse" />
                      <p className="text-xl font-semibold">
                        {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                      </p>
                      <p className="text-sm opacity-75 mt-2">
                        Zoom: {zoom} | {mapType === 'satellite' ? '🛰️' : '🗺️'} {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
                      </p>
                      <p className="text-xs opacity-50 mt-1">
                        Akurasi: {currentLocation.accuracy || 'N/A'}m
                      </p>
                    </div>
                  </div>
                  {/* Info overlay */}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
                    <div>📌 {selectedDevice?.name}</div>
                    <div className="text-xs opacity-75">
                      {currentLocation.timestamp ? formatDate(currentLocation.timestamp) : 'Baru saja'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <FaMapMarkerAlt className="text-6xl mx-auto mb-4" />
                  <p>{selectedDevice ? 'Klik "Get Location" untuk melihat lokasi' : 'Pilih perangkat terlebih dahulu'}</p>
                  {selectedDevice && selectedDevice.status !== 'online' && (
                    <p className="text-sm text-red-400 mt-2">Perangkat offline</p>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              <button
                onClick={isTracking ? handleStopTracking : handleStartTracking}
                disabled={!selectedDevice || selectedDevice.status !== 'online'}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center
                  ${isTracking 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isTracking ? (
                  <>
                    <FaPause className="mr-2" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" />
                    Start Tracking
                  </>
                )}
              </button>
              <button
                onClick={handleGetCurrentLocation}
                disabled={!selectedDevice || selectedDevice.status !== 'online'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCrosshairs className="mr-2" />
                Get Location
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                disabled={!selectedDevice}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center
                  ${showHistory 
                    ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaHistory className="mr-2" />
                Riwayat ({locationHistory.length})
              </button>
              {locationHistory.length > 0 && (
                <>
                  <button
                    onClick={downloadLocationHistory}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    Download
                  </button>
                  <button
                    onClick={clearLocationHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Location History */}
          {showHistory && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Riwayat Lokasi
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {locationHistory.length} data
                </span>
              </div>
              {locationHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Belum ada data lokasi
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Waktu
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Koordinat
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Akurasi
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Kecepatan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {locationHistory.map((location, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {formatDate(location.timestamp)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {location.accuracy || '-'}m
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {location.speed || '-'}km/h
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
