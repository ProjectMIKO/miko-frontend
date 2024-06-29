"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import socket from '../../_lib/socket';

interface SocketContextProps {
  socket: Socket;
  isConnected: boolean;
  connectSocket: (nickname: string) => void;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a MainSocketProvider');
  }
  return context;
};

export const MainSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log("connected");
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log("disconnected");
    });

    socket.on('error', (error) => {
      console.error('Error from server:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
    };
  }, []);

  const connectSocket = (nickname: string) => {
    socket.auth = { nickname };
    socket.connect();
  };

  const disconnectSocket = () => {
    socket.emit('disconnecting');
    socket.disconnect();
  };
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
