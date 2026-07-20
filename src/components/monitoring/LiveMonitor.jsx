import React, { useState, useEffect, useRef } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  FaCamera, FaVideo, FaMicrophone, FaDesktop, FaMobile,
  FaPlay, FaPause, FaStop, FaDownload, FaExpand,
  FaCompress, FaRedo, FaCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const LiveMonitor = () => {
  const { devices, getDeviceInfo, sendCommand } = useDevice();
  const { on, emit } = useSocket();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState('medium');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Socket listeners
    on('monitoring:screenshot', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        const newScreenshot = {
          id: Date.now(),
          image: data.image,
          timestamp: new Date(),
          deviceId: data.deviceId
        };
        setScreenshots(prev => [newScreenshot, ...prev].slice(0, 20));
        toast.success('Screenshot berhasil diambil');
      }
    });

    on('monitoring:frame', (data) => {
      if (data.deviceId === selectedDevice?.id && isLive) {
        // Update video frame
        if (videoRef.current) {
          videoRef.current.src = `data:image/jpeg;base64,${data.frame}`;
        }
      }
    });

    on('monitoring:recording', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        if (data.status === 'started') {
          toast.info('Rekaman dimulai');
          setIsRecording(true);
        } else if (data.status === 'stopped') {
          toast.success('Rekaman selesai');
          setIsRecording(false);
          setRecordings(prev => [{
            id: Date.now(),
            url: data.url,
            timestamp: new Date(),
            deviceId: data.deviceId,
            duration: recordingTime
          }, ...prev]);
          setRecordingTime(0);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    });

    on('device:status', (data) => {
      if (data.deviceId === selectedDevice?.id) {
        if (data.status === 'offline') {
          setIsLive(false);
          toast.warning('Perangkat offline, live streaming dihentikan');
        }
        setDeviceInfo(prev => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedDevice, isLive, recordingTime]);

  const handleSelectDevice = async (deviceId) => {
    setSelectedDevice(devices.find(d => d.id === deviceId));
    const info = await getDeviceInfo(deviceId);
    setDeviceInfo(info);
    setScreenshots([]);
    setRecordings([]);
    setIsLive(false);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleTakeScreenshot = async () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    if (selectedDevice.status !== 'online') {
      toast.error('Perangkat offline, tidak dapat mengambil screenshot');
      return;
    }
    await sendCommand(selectedDevice.id, 'screenshot');
  };

  const handleToggleLive = async () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    if (selectedDevice.status !== 'online') {
      toast.error('Perangkat offline, tidak dapat memulai live streaming');
      return;
    }

    if (!isLive) {
      setIsLive(true);
      toast.success('Memulai live streaming...');
      emit('monitoring:start-live', { 
        deviceId: selectedDevice.id,
        quality: quality,
        audio: !isMuted
      });
    } else {
      setIsLive(false);
      toast.success('Menghentikan live streaming');
      emit('monitoring:stop-live', { deviceId: selectedDevice.id });
      if (videoRef.current) {
        videoRef.current.src = '';
      }
    }
  };

  const handleStartRecording = () => {
    if (!selectedDevice) {
      toast.error('Pilih perangkat terlebih dahulu');
      return;
    }
    if (selectedDevice.status !== 'online') {
      toast.error('Perangkat offline, tidak dapat memulai rekaman');
      return;
    }

    setIsRecording(true);
    setRecordingTime(0);
    toast.success('Merekam layar...');
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    emit('monitoring:start-recording', { 
      deviceId: selectedDevice.id,
      quality: quality,
      audio: !isMuted
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.success('Rekaman dihentikan');
    emit('monitoring:stop-recording', { deviceId: selectedDevice.id });
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = (recording) => {
    if (recording.url) {
      const link = document.createElement('a');
      link.href = recording.url;
      link.download = `recording-${recording.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download rekaman dimulai');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Live Monitoring
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
            ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <FaCircle className={`text-xs mr-1 ${isLive ? 'text-white' : 'text-gray-500'}`} />
            {isLive ? 'LIVE' : 'Offline'}
          </span>
          {isRecording && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium animate-pulse flex items-center">
              <FaCircle className="text-xs mr-1" />
              REC {formatTime(recordingTime)}
            </span>
          )}
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
            disabled={isLive || isRecording}
          >
            <option value="low">Low Quality</option>
            <option value="medium">Medium Quality</option>
            <option value="high">High Quality</option>
          </select>
          <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={!isMuted}
              onChange={() => setIsMuted(!isMuted)}
              className="mr-1"
              disabled={isLive || isRecording}
            />
            <FaMicrophone className="mr-1" />
            Audio
          </label>
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
                  <div className="flex items-center">
                    {device.type === 'mobile' ? <FaMobile className="mr-2" /> : <FaDesktop className="mr-2" />}
                    <span className="truncate">{device.name}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full
                    ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
                  </span>
                </div>
                {deviceInfo?.status === 'online' && device.id === selectedDevice?.id && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {deviceInfo.ip || ''}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Monitoring Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video/Live Stream */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
              {isLive ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted={isMuted}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <FaDesktop className="text-6xl mx-auto mb-4" />
                  <p>{selectedDevice ? 'Klik "Start Live" untuk memulai' : 'Pilih perangkat terlebih dahulu'}</p>
                  {selectedDevice && selectedDevice.status !== 'online' && (
                    <p className="text-sm text-red-400 mt-2">Perangkat offline</p>
                  )}
                </div>
              )}
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  ● REC {formatTime(recordingTime)}
                </div>
              )}
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              <button
                onClick={handleToggleLive}
                disabled={!selectedDevice || selectedDevice.status !== 'online'}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center
                  ${isLive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLive ? (
                  <>
                    <FaStop className="mr-2" />
                    Stop Live
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" />
                    Start Live
                  </>
                )}
              </button>
              <button
                onClick={handleTakeScreenshot}
                disabled={!selectedDevice || selectedDevice.status !== 'online'}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCamera className="mr-2" />
                Screenshot
              </button>
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={!selectedDevice || selectedDevice.status !== 'online'}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center
                  ${isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaVideo className="mr-2" />
                {isRecording ? 'Stop Record' : 'Record Screen'}
              </button>
              {isLive && (
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.requestFullscreen?.();
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors flex items-center"
                >
                  <FaExpand className="mr-2" />
                  Fullscreen
                </button>
              )}
            </div>
          </div>

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Screenshots Terbaru
                </h3>
                <button
                  onClick={() => setScreenshots([])}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {screenshots.slice(0, 10).map((screenshot) => (
                  <div key={screenshot.id} className="group relative">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={screenshot.image}
                        alt={`Screenshot ${screenshot.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-1 right-1 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                      {formatDate(screenshot.timestamp)}
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = screenshot.image;
                        link.download = `screenshot-${screenshot.id}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="absolute top-1 right-1 p-1 bg-white dark:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaDownload className="text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recordings */}
          {recordings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Rekaman Tersimpan
              </h3>
              <div className="space-y-2">
                {recordings.map((recording) => (
                  <div key={recording.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Rekaman {formatDate(recording.timestamp)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Durasi: {formatTime(recording.duration || 0)}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center"
                    >
                      <FaDownload className="mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Device Info */}
          {deviceInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informasi Perangkat
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${deviceInfo.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {deviceInfo.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">OS</span>
                  <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.os || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">IP Address</span>
                  <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.ip || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Battery</span>
                  <p className="font-medium text-gray-900 dark:text-white">{deviceInfo.battery || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
