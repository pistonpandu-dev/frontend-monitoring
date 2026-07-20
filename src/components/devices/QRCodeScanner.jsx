import React, { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import toast from 'react-hot-toast';

const QRCodeScanner = ({ onClose, onScan }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const fileInputRef = useRef(null);

  // Handle scan result
  const handleScan = async (result) => {
    if (result && !loading) {
      setLoading(true);
      try {
        // Try to parse as JSON
        let deviceData;
        try {
          deviceData = JSON.parse(result.text || result);
        } catch {
          // If not JSON, treat as device ID
          deviceData = { deviceId: result.text || result };
        }
        
        setIsScanning(false);
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

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    if (err?.name === 'NotAllowedError') {
      setError('Izin kamera ditolak. Mohon izinkan akses kamera.');
    } else if (err?.name === 'NotFoundError') {
      setError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.');
    } else {
      setError('Gagal mengakses kamera');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target.result;
        // Simulate QR scan from image
        handleScan({ text: result });
      } catch (error) {
        toast.error('Gagal membaca file');
      }
    };
    reader.readAsText(file);
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
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setError(null);
                    setIsScanning(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Upload Gambar QR
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-square max-w-[300px] mx-auto overflow-hidden rounded-lg bg-black">
                {isScanning ? (
                  <QrReader
                    onResult={handleScan}
                    onError={handleError}
                    constraints={{ 
                      facingMode: 'environment',
                      width: { ideal: 300 },
                      height: { ideal: 300 }
                    }}
                    videoStyle={{ 
                      width: '100%', 
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    containerStyle={{ 
                      width: '100%', 
                      height: '100%',
                      overflow: 'hidden'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <p className="text-white text-sm">Scan selesai</p>
                  </div>
                )}
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
              <div className="mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                >
                  📷 Upload Gambar QR
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <button
                onClick={() => setIsScanning(!isScanning)}
                className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isScanning ? '⏸️ Pause' : '▶️ Lanjutkan Scan'}
              </button>
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
