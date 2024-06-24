"use client";

import React from "react";
import NetworkGraph from "../components/NetworkGraph";
import App from "../components/App";
import VoiceRecorder from "../components/VoiceRecorder/VoiceRecorder";
import styles from "../Home.module.css";
import { SocketProvider, useSocketContext } from "../components/SocketProvider";

const HomeContent = () => {
  const socketContext = useSocketContext();

  if (!socketContext) {
    return <p>Error: Socket context is not available.</p>;
  }

  const { sessionId, userName, token, isConnected } = socketContext;

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
            <NetworkGraph sessionId={sessionId} />
            <VoiceRecorder sessionId={sessionId} />
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
