"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import ControlPanel from "./ControlPanel";
import useNetwork from "../hooks/useNetwork";
import GroupedNodeList from "./GroupedNodeList";
import NodeConversation from "./NodeConversation";
import { useSocket } from "../components/SocketContext";
import { Node } from "../../types/types";
import SharingRoom from "./sharingRoom";
import axios from "axios";

interface Props {
  sessionId: string;
}

const APPLICATION_SERVER_URL =
  process.env.NEXT_PUBLIC_MAIN_SERVER_URL || "http://localhost:8080/";

const NetworkGraph: React.FC<Props> = ({ sessionId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    selectedNodeId,
    addNode,
    setAction,
    handleNodeClick,
    fitToScreen,
  } = useNetwork(containerRef);

  const [newNodeLabel, setNewNodeLabel] = useState<string>("");
  const [newNodeContent, setNewNodeContent] = useState<string>("");
  const [newNodeColor, setNewNodeColor] = useState<string>("#5A5A5A");

  const { socket } = useSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomLink, setRoomLink] = useState("");

  const handleAddNode = useCallback(() => {
    addNode(newNodeLabel, newNodeContent, newNodeColor);
    setNewNodeLabel("");
    setNewNodeContent("");
    setNewNodeColor("#5A5A5A");
  }, [newNodeLabel, newNodeContent, newNodeColor, addNode]);

  useEffect(() => {
    const handleSummarize = (data: { keyword: string; subtitle: string }) => {
      setNewNodeLabel(data.keyword);
      setNewNodeContent(data.subtitle);
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

  const handleKeyword = () => {
    socket.emit("summarize", sessionId);
  };

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

  const handleSharingRoom = async () => {
    const token = await getToken();
    const link = `${window.location.origin}/main?sessionId=${encodeURIComponent(
      sessionId
    )}&userName=${encodeURIComponent("guest1")}&token=${encodeURIComponent(
      token
    )}`;
    setRoomLink(link);
    setIsModalOpen(true);
  };

  return (
    <div
      style={{ display: "flex", flexGrow: 1, width: "100%", height: "650px" }}
    >
      <GroupedNodeList
        nodes={nodes.get()}
        edges={edges.get()}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          position: "relative",
          flexGrow: 1,
          height: "100%" /* 전체 높이를 사용 */,
        }}
      >
        <div
          ref={containerRef}
          style={{
            height: "100%" /* 부모 컨테이너의 높이에 맞춤 */,
            width: "100%",
            border: "1px solid black",
            margin: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            flexGrow: 1,
          }}
          onClick={() => {
            if (selectedNodeId !== null) {
              handleNodeClick(selectedNodeId);
            }
          }}
        />
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
        <button
          style={{
            position: "absolute",
            right: "170px",
            bottom: "20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleKeyword}
        >
          keyword
        </button>
        <button
          style={{
            position: "absolute",
            right: "25px",
            bottom: "20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleSharingRoom}
        >
          Sharing a room
        </button>
      </div>
      <NodeConversation
        nodes={nodes.get() as Node[]}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
      />
      <SharingRoom
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomLink={roomLink}
      />
    </div>
  );
};

export default NetworkGraph;
