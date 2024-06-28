"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import NetworkGraph from "../_components/Network/NetworkGraph";
import ControlPanel from "../_components/Network/ControlPanel";
import GroupedNodeList from "../_components/Network/GroupedNodeList";
import NodeConversation from "../_components/Network/NodeConversation";
import Video from "../_components/Video/Video";
import styles from "./Main.module.css";
import {
  SocketProvider,
  useSocketContext,
} from "../_components/Socket/SocketProvider";
import Header from "../_components/common/Header";
import Footer from "../_components/common/Footer";
import axios from "axios";
import useNetwork from "../_hooks/useNetwork";
import { useSocket } from "../_components/Socket/SocketContext";
import SharingRoom from "../_components/sharingRoom";
import { Edge } from "../_types/types";
import { VideoProvider, useVideoContext } from "../_components/Video/VideoContext";
import VoiceRecorder from "../_components/VoiceRecorder/VoiceRecorder";

const APPLICATION_SERVER_URL =
  process.env.NEXT_PUBLIC_MAIN_SERVER_URL || "http://localhost:8080/";

const VoiceContent: React.FC<{ sessionId: string | null }> = ({ sessionId }) => {
  const { publisher, subscriber } = useVideoContext();
  return <VoiceRecorder sessionId={sessionId} publisher={publisher} subscriber={subscriber} />;
};

const HomeContent: React.FC = () => {
  const socketContext = useSocketContext();
  const { socket } = useSocket();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!socketContext) {
    return <p>Error: Socket context is not available.</p>;
  }

  const { sessionId, userName, token, isConnected } = socketContext;

  const {
    nodes,
    edges,
    selectedNodeId,
    addNode,
    setAction,
    handleNodeClick,
    fitToScreen,
    nextEdgeId,
    setNextEdgeId,
  } = useNetwork(containerRef, socket, sessionId);

  const [newNodeLabel, setNewNodeLabel] = useState<string>("");
  const [newNodeContent, setNewNodeContent] = useState<string>("");
  const [newNodeColor, setNewNodeColor] = useState<string>("#5A5A5A");
  const [roomLink, setRoomLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddNode = useCallback(() => {
    addNode(newNodeLabel, newNodeContent, newNodeColor);
    setNewNodeLabel("");
    setNewNodeContent("");
    setNewNodeColor("#5A5A5A");
  }, [newNodeLabel, newNodeContent, newNodeColor, addNode]);

  useEffect(() => {
    const handleSummarize = (data: { keyword: string; subtitle: string }) => {
      setNewNodeLabel(data.keyword);
      setNewNodeContent(data.subtitle.replace(/\n/g, "<br>"));
      console.log("subtitle", data.subtitle);
    };

    socket.on("summarize", handleSummarize);

    return () => {
      socket.off("summarize", handleSummarize);
    };
  }, [socket]);

  useEffect(() => {
    if (newNodeLabel && newNodeContent) {
      handleAddNode();
    }
  }, [newNodeLabel, newNodeContent, handleAddNode]);

  useEffect(() => {
    const handleConnect = (data: {id: string, vertex1: number, vertex2: number, action: string}) => {
      setNextEdgeId(nextEdgeId + 1);
      const newEdge: Edge = {
        id: nextEdgeId,
        from: data.vertex1,
        to: data.vertex2,
      };
      edges.add(newEdge);
    }
    socket.on("edge", handleConnect);
  }, [socket]);

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
        const link = `${window.location.origin
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
      <Header>MIKO</Header>

      {/* main */}
      {/* video chat */}
      {isConnected ? (
        <VideoProvider>
          <div className={styles.appContainer}>
            {sessionId && userName && token ? (
              <Video sessionId={sessionId} userName={userName} token={token} />
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <VoiceContent sessionId={sessionId} />
        </VideoProvider>
      ) : (
        <p>Socket is not connected. Please check your connection.</p>
      )}

      {/* keyword map */}
      <div className={styles.mainContainer}>
        <div style={{ display: "flex", width: "100%", height: "60vh" }}>
          <GroupedNodeList
            className={styles.groupedNodeListWrapper}
            nodes={nodes.get()}
            edges={edges.get()}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
          />
          <div style={{ flex: 8 }}>
            <NetworkGraph
              containerRef={containerRef}
              selectedNodeId={selectedNodeId}
              handleNodeClick={handleNodeClick}
              socket={socket}
            />
            <div style={{ display: "flex" }}>
              <ControlPanel
                newNodeLabel={newNodeLabel}
                newNodeContent={newNodeContent}
                newNodeColor={newNodeColor}
                setNewNodeLabel={setNewNodeLabel}
                setNewNodeContent={setNewNodeContent}
                setNewNodeColor={setNewNodeColor}
                addNode={handleAddNode}
                setAction={setAction}
                fitToScreen={fitToScreen}
              />
              <button className={styles.keywordButton} onClick={handleKeyword}>
                keyword
              </button>
            </div>
          </div>
          <NodeConversation
            className={styles.nodeConversationWrapper}
            nodes={nodes.get()}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
          />
        </div>
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
