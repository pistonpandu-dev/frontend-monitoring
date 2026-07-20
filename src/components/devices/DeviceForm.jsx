import React, { useState, useEffect } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import toast from 'react-hot-toast';

const DeviceForm = ({ onClose, onSuccess, device }) => {
  const { createDevice, updateDevice } = useDevice();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    group: 'Default',
    description: '',
  });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        deviceId: device.deviceId || '',
        group: device.group || 'Default',
        description: device.description || '',
      });
    }
  }, [device]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.deviceId) {
      toast.error('Nama dan ID perangkat harus diisi');
      return;
    }

    setLoading(true);
    let result;
    
    if (device) {
      result = await updateDevice(device.id, formData);
    } else {
      result = await createDevice(formData);
    }
    
    setLoading(false);
    
    if (result) {
      onSuccess?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {device ? 'Edit Perangkat' : 'Tambah Perangkat Baru'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Perangkat *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Contoh: Laptop Kantor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Perangkat *
              </label>
              <input
                type="text"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Contoh: DEV-001"
                required
                disabled={!!device}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kelompok
              </label>
              <input
                type="text"
                name="group"
                value={formData.group}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Contoh: Kantor Pusat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Deskripsi perangkat..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : device ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeviceForm;
