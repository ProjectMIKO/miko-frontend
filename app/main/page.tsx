"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import NetworkGraph from "../_components/Network/NetworkGraph";
import ControlPanel from "../_components/Network/ControlPanel";
import GroupedNodeList from "../_components/Network/GroupedNodeList";
import NodeConversation from "../_components/Network/NodeConversation";
import Video from "../_components/Video/Video";
import styles from "./Main.module.css";
import { RoomSocketProvider, RoomuseSocketContext } from "../_components/Socket/SocketProvider";
import Header from "../_components/common/Header";
import Footer from "../_components/common/Footer";
import axios from "axios";
import useNetwork from "../_hooks/useNetwork";
import { useSocket } from "../_components/Socket/SocketContext";
import SharingRoom from "../_components/sharingRoom";
import { VideoProvider, useVideoContext } from "../_components/Video/VideoContext";
import VoiceRecorder from "../_components/VoiceRecorder/VoiceRecorder";
import useSocketHandlers from "../_hooks/useSocketHandlers";

const APPLICATION_SERVER_URL =
  process.env.NEXT_PUBLIC_MAIN_SERVER_URL || "http://localhost:8080/";

const HomeContent: React.FC = () => {
  const socketContext = RoomuseSocketContext();
  const { socket } = useSocket();
  const { publisher, subscriber } = useVideoContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // 훅들을 조건부 호출에서 벗어나게 수정
  const { sessionId, userName, token, isConnected } = socketContext || {};

  const {
    nodes,
    edges,
    selectedNodeId,
    addNode,
    setAction,
    handleNodeClick,
    fitToScreen,
  } = useNetwork(containerRef, socket, sessionId);

  const [controlNodeLabel, setControlNodeLabel] = useState<string>("");
  const [controlNodeContent, setControlNodeContent] = useState<string>("");
  const [controlNodeColor, setControlNodeColor] = useState<string>("#5A5A5A");
  const [roomLink, setRoomLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextId, setNextId] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);

  useSocketHandlers(edges, addNode);

  const handleAddNode = useCallback(
    (id: any) => {
      addNode(id, controlNodeLabel, controlNodeContent, controlNodeColor);
      setNextId("");
      setControlNodeLabel("");
      setControlNodeContent("");
      setControlNodeColor("#5A5A5A");
    },
    [controlNodeLabel, controlNodeContent, controlNodeColor, addNode]
  );

  useEffect(() => {
    if (controlNodeLabel && controlNodeContent) {
      handleAddNode(nextId);
    }
  }, [controlNodeLabel, controlNodeContent, nextId, handleAddNode]);

  const handleKeyword = () => {
    socket.emit("summarize", socketContext?.sessionId);
  };

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

  // 그룹 리스트 토글 함수
  const toggleList = () => {
    setIsListOpen(!isListOpen);
    console.log(isListOpen);
  };

  if (!socketContext) {
    return <p>Error: Socket context is not available.</p>;
  }

  return (
    <div className={styles.container}>
      <Header>MIKO</Header>
      <div className={styles.mainContainer}>
        <div className={styles.networkGraphContainer}>
          <NetworkGraph
              containerRef={containerRef}
              selectedNodeId={selectedNodeId}
              handleNodeClick={handleNodeClick}
              socket={socket}
          />
        </div>

        <div className={styles.appContainer}>
          {isConnected ? (
              <>
                <div className={styles.appContainer}>
                  {sessionId && userName && token ? (
                      <Video
                          sessionId={sessionId}
                          userName={userName}
                          token={token}
                      />
                  ) : (
                      <p>Loading...</p>
                  )}
                </div>
              </>
          ) : (
              <p>Socket is not connected. Please check your connection.</p>
          )}
        </div>
        <div className={styles.nodeConversationWrapper}>
          <NodeConversation
              nodes={nodes.get()}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
          />
        </div>
        <div className={`${styles.groupedNodeListWrapper} ${isListOpen ? styles.open : ''}`}>
          <GroupedNodeList
              nodes={nodes.get()}
              edges={edges.get()}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
          />
          <button className={styles.groupedNodeListButton} onClick={toggleList}>
          </button>
        </div>
      </div>
      <Footer>
        <div className={styles.footerComponents}>
          <button onClick={handleSharingRoom}>Sharing a room</button>
          <ControlPanel
              newNodeLabel={controlNodeLabel}
              newNodeContent={controlNodeContent}
            newNodeColor={controlNodeColor}
            setNewNodeLabel={setControlNodeLabel}
            setNewNodeContent={setControlNodeContent}
            setNewNodeColor={setControlNodeColor}
            addNode={handleAddNode}
            setAction={setAction}
            fitToScreen={fitToScreen}
          />
          {sessionId && (
            <VoiceRecorder
              sessionId={sessionId}
              publisher={publisher}
              subscriber={subscriber}
            />
          )}
          <button className={styles.keywordButton} onClick={handleKeyword}>
            keyword
          </button>
          <button onClick={handleLeaveSession}>Leave Session</button>
        </div>
      </Footer>
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
    <RoomSocketProvider>
      <VideoProvider>
        <HomeContent />
      </VideoProvider>
    </RoomSocketProvider>
  );
}
