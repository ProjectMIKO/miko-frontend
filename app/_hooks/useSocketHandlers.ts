// useSocketHandlers.ts
import { useEffect, useCallback, useState } from "react";
import { useSocket } from "../_components/Socket/SocketContext";
import { Edge } from "../_types/types";
import { DataSet } from "vis-network";

const useSocketHandlers = (
  edges: DataSet<Edge>,
  addNode: (id: any, label: string, content: string, color: string) => void
) => {
  const { socket } = useSocket();
  const [nextNodeId, setNextNodeId] = useState<string>("");
  const [newNodeLabel, setNewNodeLabel] = useState<string>("");
  const [newNodeContent, setNewNodeContent] = useState<string>("");

  const handleAddNode = useCallback(
    (id: any) => {
      addNode(id, newNodeLabel, newNodeContent, "#5A5A5A");
      setNextNodeId("");
      setNewNodeLabel("");
      setNewNodeContent("");
    },
    [newNodeLabel, newNodeContent, addNode]
  );

  useEffect(() => {
    const handleSummarize = (data: { contentId: string; keyword: string; subject: string; conversationIds: [] }) => {
        setNextNodeId(data.contentId);
      setNewNodeLabel(data.keyword);
      setNewNodeContent(data.subject);
      console.log("subtitle", data.subject);
    };

    socket.on("vertex", handleSummarize);

    return () => {
      socket.off("vertex", handleSummarize);
    };
  }, [socket]);

  useEffect(() => {
    if (newNodeLabel && newNodeContent) {
      handleAddNode(nextNodeId);
    }
  }, [newNodeLabel, newNodeContent, nextNodeId, handleAddNode]);

  useEffect(() => {
    const handleConnect = (data: { contentId: string; vertex1: number; vertex2: number; action: string }) => {
      console.log(data);
      const newEdge: Edge = {
        id: data.contentId,
        from: data.vertex1,
        to: data.vertex2,
      };

      if (!edges.get(newEdge.id)) {
        edges.add(newEdge);
      } else {
        console.log(`Edge with id ${newEdge.id} already exists`);
      }
    };

    socket.on("edge", handleConnect);

    return () => {
      socket.off("edge", handleConnect);
    };
  }, [socket, edges]);

  return { newNodeLabel, newNodeContent, nextNodeId, setNewNodeLabel, setNewNodeContent };
};

export default useSocketHandlers;