// app/main/page.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import NetworkGraph from "../components/NetworkGraph";
import App from "../components/App";
import styles from "../Home.module.css";
import { SocketProvider, useSocketContext } from "../components/SocketProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import SharingRoom from "../components/sharingRoom";

const APPLICATION_SERVER_URL =
  process.env.NEXT_PUBLIC_MAIN_SERVER_URL || "http://localhost:8080/";

const HomeContent: React.FC = () => {
  const socketContext = useSocketContext();

  const [roomLink, setRoomLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!socketContext) {
    return <p>Error: Socket context is not available.</p>;
  }

  const { sessionId, userName, token, isConnected } = socketContext;

  const getToken = async () => {
    if (sessionId) {
      const response = await axios.post(
        `${APPLICATION_SERVER_URL}api/openvidu/sessions/${sessionId}/connections`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data.token;
    }
    return null;
  };

  const handleSharingRoom = async () => {
    try {
      const token = await getToken();
      if (sessionId) {
        const link = `${
          window.location.origin
        }/main?sessionId=${encodeURIComponent(
          sessionId
        )}&userName=${encodeURIComponent("guest1")}&token=${encodeURIComponent(
          token
        )}`;
        setRoomLink(link);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error generating room link:", error);
    }
  };

  return (
    <div className={styles.container}>
      {/* header */}
      {/* <Header>MIKO</Header> */}

      {/* main */}
      {/* video chat */}
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

      {/* keyword map */}
      <div className={styles.mainContainer}>
        {sessionId && <NetworkGraph sessionId={sessionId} />}
      </div>

      {/* footer */}

      <Footer>
        <button onClick={handleSharingRoom}>Sharing a room</button>
      </Footer>

      {/* modal */}
      <SharingRoom
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomLink={roomLink}
      />
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
