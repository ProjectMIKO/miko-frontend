"use client";

import React, { useEffect, useState } from "react";
import NetworkGraph from "../components/NetworkGraph";
import App from "../components/App";
import VoiceRecorder from "../components/VoiceRecorder/VoiceRecorder";
import styles from "../Home.module.css";
import { useSocket } from '../components/SocketContext';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasEnteredRoom, setHasEnteredRoom] = useState(false);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("sessionId");
    const storedUserName = sessionStorage.getItem("userName");
    const storedToken = sessionStorage.getItem("token");

    if (isConnected) {
      console.log('Socket is connected!');

      if (!hasEnteredRoom && storedSessionId) {
        socket.emit('enter_room', [storedSessionId, () => {
          console.log('Entered room:', storedSessionId);
          setHasEnteredRoom(true); // Update the state to prevent re-entering the room
        }]);
      }
    } else {
      console.log('Socket is not connected.');
    }

    if (storedSessionId && storedUserName && storedToken) {
      setSessionId(storedSessionId);
      setUserName(storedUserName);
      setToken(storedToken);
    } else {
      // 세션 정보가 없으면 대기 페이지로 이동
      window.location.href = "/waiting";
    }

    // 예시: 서버에서 메시지 수신
    socket.on('script', (message: string) => {
      console.log('Received message from server:', message);
    });

    socket.on('welcome', (nickname, memberCount) => {
      console.log(`Welcome ${nickname}, there are ${memberCount} members in the room`);
    });

    return () => {
      socket.off('script');
      socket.off('entered_room');
      socket.off('welcome');
    };
  }, [socket, isConnected]);

  return (
    <div className={styles.container}>
      {isConnected ? (
        <div className={styles.appContainer}>
          {sessionId && userName && token ? (
            <App sessionId={sessionId} userName={userName} token={token} />
          ) : (
            <p>Loading...</p>
          )}
          <VoiceRecorder />
        </div>
      ) : (
        <p>Socket is not connected. Please check your connection.</p>
      )}
      <div className={styles.networkGraphContainer}>
        <NetworkGraph />
      </div>
    </div>
  );
}
