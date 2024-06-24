"use client";

import React, { useEffect, useState, useRef } from 'react';
import VoiceComponent from '../components/VoiceRecorder/VoiceRecorder';
import { SocketProvider, useSocket } from '../components/SocketContext';
import socket from '../lib/socket';

const Home: React.FC = () => {
    const { connectSocket, disconnectSocket } = useSocket();
    const [messages, setMessages] = useState<string[]>([]);
    const handleNewMessage = useRef((message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

    useEffect(() => {
        // 예제 닉네임으로 소켓 연결을 시도합니다.
        const nickname = 'testUser';
        connectSocket(nickname);
        const handleMessage = (message: string) => {
            console.log("Received message from server:", message);
            handleNewMessage.current(message);
          };

        socket.on("script", handleMessage);
        return () => {
            socket.off("script");
            disconnectSocket();
        };
    }, [connectSocket, disconnectSocket]);

    return (
        <div>
            <h1>Welcome to Voice Test</h1>
            <VoiceComponent/>
        </div>
    );
};

const WrappedHome: React.FC = () => (
    <SocketProvider>
        <Home />
    </SocketProvider>
);

export default WrappedHome;
