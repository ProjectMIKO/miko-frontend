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
    const handleSummarize = (data: { _id: string; keyword: string; subject: string; conversationIds: [] }) => {
      setNextNodeId(data._id);
      setNewNodeLabel(data.keyword);
      setNewNodeContent(data.subject);
      console.log("subtitle", data);
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
    const handleConnect = (data: { _id: string; vertex1: number; vertex2: number; action: string }) => {
      const newEdge: Edge = {
        id: data._id,
        from: data.vertex1,
        to: data.vertex2,
      };

      if (!edges.get(newEdge.id)) {
        edges.add(newEdge);
      };
    };

    socket.on("edge", handleConnect);

    return () => {
      socket.off("edge", handleConnect);
    };
  }, [socket, edges]);

  useEffect(() => {
    const handledDisConnect = (data: { _id: string; vertex1: number; vertex2: number; action: string }) => {
      if (edges.get(data._id)) {
        edges.remove(data._id);
      } else {
        console.log(`Edge with id ${data._id} already exists`);
      }
    };
    socket.on("del_edge", handledDisConnect);

    return () => {
      socket.off("del_edge", handledDisConnect);
    };
  }, [socket, edges]);

  useEffect(() => {
    const handleVertexBatch = (data: any[]) => {
      for (const item of data) {
        const newNode = {
          id: item._id,
          label: item.keyword,
          content: item.subject,
        };
        addNode(newNode.id, newNode.label, newNode.content, "#5A5A5A");
      }
    };

    socket.on("vertexBatch", handleVertexBatch);

    return () => {
      socket.off("vertexBatch", handleVertexBatch);
    };
  }, [socket, addNode]);

  useEffect(() => {
    const handleEdgeBatch = (data: any[]) => {
      for (const item of data) {
        const newEdge: Edge = {
          id: item._id,
          from: item.vertex1,
          to: item.vertex2,
        };
        if (!edges.get(newEdge.id)) {
          edges.add(newEdge);
        }
      }
    };

    socket.on("edgeBatch", handleEdgeBatch);

    return () => {
      socket.off("edgeBatch", handleEdgeBatch);
    };
  }, [socket, edges]);

  return { newNodeLabel, newNodeContent, nextNodeId, setNewNodeLabel, setNewNodeContent };
};

export default useSocketHandlers;
