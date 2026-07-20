import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { FaArrowLeft, FaSync, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDevice, deleteDevice, syncDevice, getDeviceHistory, loading } = useDevice();
  const { on } = useSocket();
  const [device, setDevice] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchDevice();
    fetchHistory();

    // Socket listeners
    on('device:status', (data) => {
      if (data.deviceId === id) {
        setDevice(prev => ({ ...prev, status: data.status }));
      }
    });

    on('device:updated', (data) => {
      if (data.deviceId === id) {
        fetchDevice();
      }
    });
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
    setHistory(data);
  };

  const handleDelete = async () => {
    if (window.confirm('Yakin ingin menghapus perangkat ini?')) {
      const success = await deleteDevice(id);
      if (success) {
        navigate('/devices');
      }
    }
  };

  const handleSync = async () => {
    await syncDevice(id);
    await fetchDevice();
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
    <div className="p-6">
      <button
        onClick={() => navigate('/devices')}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Kembali
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {device.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">ID: {device.deviceId}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSync}
              className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              title="Sinkronisasi"
            >
              <FaSync />
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              title="Hapus"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status)} text-white`}>
                {getStatusText(device.status)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Kelompok</span>
              <span className="font-medium text-gray-900 dark:text-white">{device.group || '-'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Terakhir Aktif</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {device.lastActive ? formatDate(device.lastActive) : 'Belum aktif'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Dibuat</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {device.createdAt ? formatDate(device.createdAt) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Diperbarui</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {device.updatedAt ? formatDate(device.updatedAt) : '-'}
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Deskripsi</span>
              <p className="mt-1 text-gray-900 dark:text-white">{device.description || 'Tidak ada deskripsi'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <FaHistory className="mr-2" />
            {showHistory ? 'Sembunyikan' : 'Tampilkan'} Riwayat Aktivasi
          </button>

          {showHistory && (
            <div className="mt-4 max-h-60 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Belum ada riwayat
                </p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Tanggal</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Aksi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {formatDate(item.timestamp)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                          {item.action}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)} text-white`}>
                            {getStatusText(item.status)}
                          </span>
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
  );
};

export default DeviceDetails;
