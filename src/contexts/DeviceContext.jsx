import React, { createContext, useState, useContext, useCallback } from 'react';
import { deviceAPI, monitoringAPI, controlAPI } from '../services/api';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

const DeviceContext = createContext();

export const useDevice = () => useContext(DeviceContext);

export const DeviceProvider = ({ children }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const { on, emit } = useSocket();

  // Fetch all devices
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await deviceAPI.getAll();
      setDevices(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      toast.error('Gagal mengambil data perangkat');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get device by ID
  const getDevice = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await deviceAPI.getById(id);
      setSelectedDevice(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch device:', error);
      toast.error('Gagal mengambil data perangkat');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create device
  const createDevice = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await deviceAPI.create(data);
      toast.success('Perangkat berhasil ditambahkan');
      await fetchDevices();
      return response.data;
    } catch (error) {
      console.error('Failed to create device:', error);
      toast.error('Gagal menambahkan perangkat');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  // Update device
  const updateDevice = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await deviceAPI.update(id, data);
      toast.success('Perangkat berhasil diperbarui');
      await fetchDevices();
      return response.data;
    } catch (error) {
      console.error('Failed to update device:', error);
      toast.error('Gagal memperbarui perangkat');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  // Delete device
  const deleteDevice = useCallback(async (id) => {
    if (!window.confirm('Yakin ingin menghapus perangkat ini?')) return false;
    
    setLoading(true);
    try {
      await deviceAPI.delete(id);
      toast.success('Perangkat berhasil dihapus');
      await fetchDevices();
      return true;
    } catch (error) {
      console.error('Failed to delete device:', error);
      toast.error('Gagal menghapus perangkat');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  // Activate device
  const activateDevice = useCallback(async (id) => {
    setLoading(true);
    try {
      await deviceAPI.activate(id);
      toast.success('Perangkat berhasil diaktifkan');
      await fetchDevices();
      return true;
    } catch (error) {
      console.error('Failed to activate device:', error);
      toast.error('Gagal mengaktifkan perangkat');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  // Deactivate device
  const deactivateDevice = useCallback(async (id) => {
    setLoading(true);
    try {
      await deviceAPI.deactivate(id);
      toast.success('Perangkat berhasil dinonaktifkan');
      await fetchDevices();
      return true;
    } catch (error) {
      console.error('Failed to deactivate device:', error);
      toast.error('Gagal menonaktifkan perangkat');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  // Sync device
  const syncDevice = useCallback(async (id) => {
    setLoading(true);
    try {
      await deviceAPI.sync(id);
      toast.success('Sinkronisasi berhasil');
      return true;
    } catch (error) {
      console.error('Failed to sync device:', error);
      toast.error('Gagal sinkronisasi');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get device history
  const getDeviceHistory = useCallback(async (id) => {
    try {
      const response = await deviceAPI.getHistory(id);
      return response.data;
    } catch (error) {
      console.error('Failed to get device history:', error);
      toast.error('Gagal mengambil riwayat perangkat');
      return [];
    }
  }, []);

  // Get device info
  const getDeviceInfo = useCallback(async (id) => {
    try {
      const response = await monitoringAPI.getDeviceInfo(id);
      return response.data;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return null;
    }
  }, []);

  // Get device location
  const getDeviceLocation = useCallback(async (id) => {
    try {
      const response = await monitoringAPI.getLocation(id);
      return response.data;
    } catch (error) {
      console.error('Failed to get device location:', error);
      return null;
    }
  }, []);

  // Send control command
  const sendCommand = useCallback(async (id, command, data = {}) => {
    try {
      let response;
      switch (command) {
        case 'screenshot':
          response = await controlAPI.screenshot(id);
          break;
        case 'ring':
          response = await controlAPI.ring(id);
          break;
        case 'lock':
          response = await controlAPI.lock(id);
          break;
        case 'lost-mode':
          response = await controlAPI.lostMode(id);
          break;
        case 'flashlight':
          response = await controlAPI.flashlight(id, data.status);
          break;
        case 'vibrate':
          response = await controlAPI.vibrate(id, data.duration);
          break;
        case 'volume':
          response = await controlAPI.volume(id, data.level);
          break;
        case 'notification':
          response = await controlAPI.sendNotification(id, data);
          break;
        case 'sync':
          response = await controlAPI.sync(id);
          break;
        case 'refresh':
          response = await controlAPI.refresh(id);
          break;
        default:
          throw new Error('Unknown command');
      }
      
      toast.success(`Perintah ${command} berhasil dikirim`);
      return response.data;
    } catch (error) {
      console.error(`Failed to send ${command} command:`, error);
      toast.error(`Gagal mengirim perintah ${command}`);
      return null;
    }
  }, []);

  // Invite device via email
  const inviteDevice = useCallback(async (email) => {
    try {
      await deviceAPI.invite(email);
      toast.success(`Undangan berhasil dikirim ke ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast.error('Gagal mengirim undangan');
      return false;
    }
  }, []);

  const value = {
    devices,
    selectedDevice,
    loading,
    fetchDevices,
    getDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    activateDevice,
    deactivateDevice,
    syncDevice,
    getDeviceHistory,
    getDeviceInfo,
    getDeviceLocation,
    sendCommand,
    inviteDevice,
    setSelectedDevice,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};
