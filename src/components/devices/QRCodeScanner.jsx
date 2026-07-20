import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import toast from 'react-hot-toast';

const QRCodeScanner = ({ onClose, onScan }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async (data) => {
    if (data && !loading) {
      setLoading(true);
      try {
        // Parse QR code data
        const deviceData = JSON.parse(data);
        onScan?.(deviceData);
        toast.success('QR Code berhasil dipindai');
      } catch (error) {
        console.error('Failed to parse QR code:', error);
        toast.error('Format QR Code tidak valid');
        setError('Format QR Code tidak valid');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner error:', error);
    setError('Gagal mengakses kamera');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Scan QR Code
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-square max-w-[300px] mx-auto overflow-hidden rounded-lg bg-black">
                <QrReader
                  onResult={handleScan}
                  onError={handleError}
                  constraints={{ facingMode: 'environment' }}
                  containerStyle={{ width: '100%', height: '100%' }}
                />
              </div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Memproses...</p>
                  </div>
                </div>
              )}
              <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Arahkan kamera ke QR Code perangkat</p>
                <p className="mt-1">Pastikan QR Code terlihat jelas</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
