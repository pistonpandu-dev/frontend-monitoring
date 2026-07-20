import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FaArrowLeft, FaSync, FaEdit, FaTrash, FaHistory, 
  FaWifi, FaPowerOff, FaPlay, FaPause, FaInfoCircle,
  FaDesktop, FaMobile, FaTablet
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';
import DeviceForm from './DeviceForm';

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getDevice, 
    deleteDevice, 
    syncDevice, 
    getDeviceHistory,
    activateDevice,
    deactivateDevice,
    loading 
  } = useDevice();
  const { on, emit } = useSocket();
  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDevice();
    fetchHistory();
    fetchDeviceInfo();

    // Socket listeners
    on('device:status', (data) => {
      if (data.deviceId === id) {
        setDevice(prev => ({ ...prev, status: data.status }));
        toast.info(`Status perangkat: ${data.status}`);
      }
    });

    on('device:updated', (data) => {
      if (data.deviceId === id) {
        fetchDevice();
        toast.info('Data perangkat diperbarui');
      }
    });

    on('device:info', (data) => {
      if (data.deviceId === id) {
        setDeviceInfo(data);
      }
    });

    return () => {
      // Cleanup listeners
    };
  }, [id]);

  const fetchDevice = async () => {
    const data = await getDevice(id);
    if (data) {
      setDevice(data);
    } else {
      toast.error('Perangkat tidak ditemukan');
      navigate('/devices');
    }
  };

  const fetchHistory = async () => {
    const data = await getDeviceHistory(id);
    setHistory(data || []);
  };

  const fetchDeviceInfo = async () => {
    try {
      // Emit socket event to get device info
      emit('device:get-info', { deviceId: id });
    } catch (error) {
      console.error('Failed to fetch device info:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Yakin ingin menghapus perangkat ini? Tindakan ini tidak dapat dibatalkan!')) {
      const success = await deleteDevice(id);
      if (success) {
        toast.success('Perangkat berhasil dihapus');
        navigate('/devices');
      }
    }
  };

  const handleSync = async () => {
    setIsRefreshing(true);
    await syncDevice(id);
    await fetchDevice();
    await fetchHistory();
    setIsRefreshing(false);
    toast.success('Sinkronisasi selesai');
  };

  const handleActivate = async () => {
    const success = await activateDevice(id);
    if (success) {
      await fetchDevice();
    }
  };

  const handleDeactivate = async () => {
    const success = await deactivateDevice(id);
    if (success) {
      await fetchDevice();
    }
  };

  const getDeviceIcon = () => {
    if (deviceInfo?.type === 'mobile') return <FaMobile className="text-2xl" />;
    if (deviceInfo?.type === 'tablet') return <FaTablet className="text-2xl" />;
    return <FaDesktop className="text-2xl" />;
  };

  if (loading || !device) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data perangkat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => navigate('/devices')}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" />
        Kembali ke Daftar Perangkat
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                {getDeviceIcon()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {device.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {device.deviceId}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status)} text-white`}>
                {getStatusText(device.status)}
              </span>
              <button
                onClick={handleSync}
                disabled={isRefreshing}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center"
              >
                <FaSync className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Sync...' : 'Sync'}
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <FaEdit className="inline mr-1" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                <FaTrash className="inline mr-1" />
                Hapus
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informasi Perangkat */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <FaInfoCircle className="inline mr-2 text-blue-500" />
                Informasi Perangkat
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Nama Perangkat</span>
                  <span className="font-medium text-gray-900 dark:text-white">{device.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">ID Perangkat</span>
                  <span className="font-medium text-gray-900 dark:text-white">{device.deviceId}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Kelompok</span>
                  <span className="font-medium text-gray-900 dark:text-white">{device.group || 'Default'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status)} text-white`}>
                    {getStatusText(device.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Terakhir Aktif</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {device.lastActive ? formatDate(device.lastActive) : 'Belum aktif'}
                  </span>
                </div>
                {deviceInfo && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">IP Address</span>
                      <span className="font-medium text-gray-900 dark:text-white">{deviceInfo.ip || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">OS</span>
                      <span className="font-medium text-gray-900 dark:text-white">{deviceInfo.os || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Battery</span>
                      <span className="font-medium text-gray-900 dark:text-white">{deviceInfo.battery || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Aksi dan Kontrol */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <FaWifi className="inline mr-2 text-green-500" />
                Kontrol Perangkat
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {device.status === 'inactive' ? (
                  <button
                    onClick={handleActivate}
                    className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex flex-col items-center"
                  >
                    <FaPlay className="text-2xl mb-1" />
                    <span className="text-sm">Aktivasi</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDeactivate}
                    className="p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex flex-col items-center"
                  >
                    <FaPause className="text-2xl mb-1" />
                    <span className="text-sm">Nonaktifkan</span>
                  </button>
                )}
                
                <button
                  onClick={() => navigate(`/monitoring/${device.id}`)}
                  className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex flex-col items-center"
                >
                  <FaDesktop className="text-2xl mb-1" />
                  <span className="text-sm">Monitoring</span>
                </button>
                
                <button
                  onClick={() => navigate(`/controls/${device.id}`)}
                  className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex flex-col items-center"
                >
                  <FaPowerOff className="text-2xl mb-1" />
                  <span className="text-sm">Kontrol</span>
                </button>
                
                <button
                  onClick={() => navigate(`/monitoring/location/${device.id}`)}
                  className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex flex-col items-center"
                >
                  <FaDesktop className="text-2xl mb-1" />
                  <span className="text-sm">Lokasi</span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Dibuat</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {device.createdAt ? formatDate(device.createdAt) : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Diperbarui</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {device.updatedAt ? formatDate(device.updatedAt) : '-'}
                  </span>
                </div>
                {device.description && (
                  <div className="mt-2 pt-2 border-t dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Deskripsi:</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{device.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Riwayat Aktivasi */}
          <div className="mt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              <FaHistory className="mr-2" />
              {showHistory ? 'Sembunyikan' : 'Tampilkan'} Riwayat Aktivasi
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({history.length})
              </span>
            </button>

            {showHistory && (
              <div className="mt-4 max-h-80 overflow-y-auto border dark:border-gray-700 rounded-lg">
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Belum ada riwayat aktivasi
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Aksi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {history.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {formatDate(item.timestamp)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {item.action}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)} text-white`}>
                              {getStatusText(item.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {item.note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <DeviceForm
          device={device}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            fetchDevice();
            toast.success('Perangkat berhasil diperbarui');
          }}
        />
      )}
    </div>
  );
};

export default DeviceDetails;
