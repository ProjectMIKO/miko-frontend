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
    <div className={styles.nodeConversationContainer}>
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
      <div className={styles.contentContainer}>{renderContent()}</div>
    </div>
  );
};

export default NodeConversation;
