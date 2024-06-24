import React, { useState, useEffect, useRef } from "react";
import NodeList from "./NodeList";
import Conversation from "./Conversation";
import styles from "../Home.module.css";
import { Node } from "../../types/types";
import { useSocket } from "../components/SocketContext";

interface NodeConversationProps {
  nodes: Node[];
  selectedNodeId: number | null;
  onNodeClick: (nodeId: number) => void;
}

const NodeConversation: React.FC<NodeConversationProps> = ({
  nodes,
  selectedNodeId,
  onNodeClick,
}) => {
  const [activeTab, setActiveTab] = useState<string>("nodes");
  const [messages, setMessages] = useState<string[]>([]);
  const { socket } = useSocket();
  const handleNewMessage = useRef((message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  });

  useEffect(() => {
    const handleMessage = (message: string) => {
      console.log("Received message from server:", message);
      handleNewMessage.current(message);
    };

    socket.on("script", handleMessage);

    return () => {
      socket.off("script", handleMessage);
    };
  }, [socket]);

  const renderContent = () => {
    switch (activeTab) {
      case "nodes":
        return (
          <div className={styles.tabContent}>
            <NodeList
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onNodeClick={onNodeClick}
            />
          </div>
        );
      case "conversation":
        return (
          <div className={styles.tabContent}>
            <Conversation messages={messages} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: "600px", // 넓이를 600px로 조정
        margin: "5px",
        border: "1px solid #CCC",
        padding: "0px 10px 10px 10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#F9F9F9",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div className={styles.tabContainer}>
        <button
          className={activeTab === "nodes" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("nodes")}
        >
          Node List
        </button>
        <button
          className={
            activeTab === "conversation" ? styles.activeTab : styles.tab
          }
          onClick={() => setActiveTab("conversation")}
        >
          Conversation
        </button>
      </div>
      <div style={{ flexGrow: 1 }}>{renderContent()}</div>
    </div>
  );
};

export default NodeConversation;
