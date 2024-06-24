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
          <NodeList
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onNodeClick={onNodeClick}
          />
        );
      case "conversation":
        return <Conversation messages={messages} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: "300px",
        margin: "5px",
        border: "1px solid #CCC",
        padding: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#F9F9F9",
        height: "100%",
        overflowY: "auto",
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
      {renderContent()}
    </div>
  );
};

export default NodeConversation;
