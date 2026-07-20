import React, { createContext, useState, useEffect, useContext } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const connectSocket = async () => {
    try {
      await socketService.connect();
      setConnected(true);
      setError(null);
    } catch (err) {
      console.error('Socket connection error:', err);
      setError(err.message);
      setConnected(false);
    }
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setConnected(false);
  };

  const on = (event, callback) => {
    socketService.on(event, callback);
  };

  const off = (event, callback) => {
    socketService.off(event, callback);
  };

  const emit = (event, data) => {
    socketService.emit(event, data);
  };

  const value = {
    connected,
    error,
    on,
    off,
    emit,
    connect: connectSocket,
    disconnect: disconnectSocket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
