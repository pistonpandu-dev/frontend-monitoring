import React, { useState, useEffect } from 'react';
import { deviceAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import DeviceForm from './DeviceForm';
import QRCodeScanner from './QRCodeScanner';
import toast from 'react-hot-toast';
import { FaPlus, FaQrcode, FaEnvelope } from 'react-icons/fa';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const { on: socketOn } = useSocket();

  useEffect(() => {
    fetchDevices();

    // Socket listeners
    socketOn('device:online', (data) => {
      updateDeviceStatus(data.deviceId, 'online');
      toast.success(`${data.deviceName} online`);
    });

    socketOn('device:offline', (data) => {
      updateDeviceStatus(data.deviceId, 'offline');
      toast.warning(`${data.deviceName} offline`);
    });

    socketOn('device:new', () => {
      fetchDevices();
    });

    socketOn('device:updated', (data) => {
      fetchDevices();
    });
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceAPI.getAll();
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      toast.error('Gagal mengambil data perangkat');
    } finally {
      setLoading(false);
    }
  };

  const updateDeviceStatus = (deviceId, status) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, status } : device
    ));
  };

  const handleDeviceAction = async (action, deviceId, data = null) => {
    try {
      switch (action) {
        case 'activate':
          await deviceAPI.activate(deviceId);
          toast.success('Perangkat berhasil diaktifkan');
          break;
        case 'deactivate':
          await deviceAPI.deactivate(deviceId);
          toast.success('Perangkat berhasil dinonaktifkan');
          break;
        case 'delete':
          if (window.confirm('Yakin ingin menghapus perangkat ini?')) {
            await deviceAPI.delete(deviceId);
            toast.success('Perangkat berhasil dihapus');
          }
          break;
        case 'sync':
          await deviceAPI.sync(deviceId);
          toast.success('Sinkronisasi berhasil');
          break;
        default:
          return;
      }
      fetchDevices();
    } catch (error) {
      console.error(`Failed to ${action} device:`, error);
      toast.error(`Gagal ${action} perangkat`);
    }
  };

  const handleInvite = async (email) => {
    try {
      await deviceAPI.invite(email);
      toast.success(`Undangan berhasil dikirim ke ${email}`);
      setShowInvite(false);
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast.error('Gagal mengirim undangan');
    }
  };

  const handleQRScan = (data) => {
    console.log('QR Code scanned:', data);
    setShowQRScanner(false);
    toast.success('QR Code berhasil dipindai');
    fetchDevices();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manajemen Perangkat
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 
                     text-white rounded-lg transition-colors"
          >
            <FaEnvelope className="mr-2" />
            Undang Email
          </button>
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 
                     text-white rounded-lg transition-colors"
          >
            <FaQrcode className="mr-2" />
            Scan QR
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     text-white rounded-lg transition-colors"
          >
            <FaPlus className="mr-2" />
            Tambah Perangkat
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Memuat data perangkat...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden 
                       hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {device.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {device.deviceId}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                    ${device.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      device.status === 'offline' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {device.status || 'inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Kelompok:</span> {device.group || 'Default'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Terakhir aktif:</span> {device.lastActive || 'Belum aktif'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {device.status === 'inactive' ? (
                    <button
                      onClick={() => handleDeviceAction('activate', device.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white 
                               rounded text-sm transition-colors"
                    >
                      Aktivasi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeviceAction('deactivate', device.id)}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white 
                               rounded text-sm transition-colors"
                    >
                      Nonaktifkan
                    </button>
                  )}
                  <button
                    onClick={() => handleDeviceAction('sync', device.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white 
                             rounded text-sm transition-colors"
                  >
                    Sinkronisasi
                  </button>
                  <button
                    onClick={() => handleDeviceAction('delete', device.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white 
                             rounded text-sm transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal components */}
      {showForm && (
        <DeviceForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchDevices();
          }}
          device={selectedDevice}
        />
      )}

      {showQRScanner && (
        <QRCodeScanner
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
        />
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Undang Perangkat via Email
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              if (email) handleInvite(email);
            }}>
              <input
                type="email"
                name="email"
                placeholder="Email pengguna"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 
                         dark:border-gray-600 dark:text-white mb-4"
                required
              />
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  Kirim Undangan
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 
                           py-2 rounded"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceList;
