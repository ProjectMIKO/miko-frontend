// app/main/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import NetworkGraph from "../components/NetworkGraph";
import App from "../components/App";
import styles from "../Home.module.css";
import { SocketProvider, useSocketContext } from "../components/SocketProvider";
import axios from 'axios';

const APPLICATION_SERVER_URL = process.env.NEXT_PUBLIC_MAIN_SERVER_URL || "http://localhost:8080/";

const HomeContent = () => {
  const socketContext = useSocketContext();

  if (!socketContext) {
    return <p>Error: Socket context is not available.</p>;
  }

  const { sessionId, userName, token, isConnected } = socketContext;

  const getToken = useCallback(async () => {
    if (sessionId) {
      const response = await axios.post(
        `${APPLICATION_SERVER_URL}api/openvidu/sessions/${sessionId}/connections`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data.token; // 토큰 반환
    }
    return null;
  }, [sessionId]);

  return (
    <div className={styles.container}>
      {isConnected ? (
        <div className={styles.appContainer}>
          {sessionId && userName && token ? (
            <App sessionId={sessionId} userName={userName} token={token} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      ) : (
        <p>Socket is not connected. Please check your connection.</p>
      )}
      <div className={styles.layoutContainer}>
        {sessionId && (
          <>
          <NetworkGraph sessionId={sessionId} getToken={getToken} /> 
        </>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <SocketProvider>
      <HomeContent />
    </SocketProvider>
  );
}
