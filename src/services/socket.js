import io from 'socket.io-client';
import { auth } from './firebase';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  async connect() {
    if (this.socket?.connected) return;

    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('authenticate', { userId: auth.currentUser?.uid });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Device events
    this.socket.on('device:online', (data) => {
      this.emitEvent('device:online', data);
    });

    this.socket.on('device:offline', (data) => {
      this.emitEvent('device:offline', data);
    });

    this.socket.on('device:status', (data) => {
      this.emitEvent('device:status', data);
    });

    this.socket.on('device:new', (data) => {
      this.emitEvent('device:new', data);
    });

    this.socket.on('device:updated', (data) => {
      this.emitEvent('device:updated', data);
    });

    // Monitoring events
    this.socket.on('monitoring:screenshot', (data) => {
      this.emitEvent('monitoring:screenshot', data);
    });

    this.socket.on('monitoring:location', (data) => {
      this.emitEvent('monitoring:location', data);
    });

    this.socket.on('monitoring:activity', (data) => {
      this.emitEvent('monitoring:activity', data);
    });

    // Control events
    this.socket.on('control:result', (data) => {
      this.emitEvent('control:result', data);
    });

    // Notification events
    this.socket.on('notification:new', (data) => {
      this.emitEvent('notification:new', data);
    });
  }

  emitEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
