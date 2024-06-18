import { useState, useEffect, useCallback } from "react";
import { Network, DataSet, IdType } from "vis-network/standalone";
import { Node, Edge } from "../types/types";

const useNetwork = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [network, setNetwork] = useState<Network | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [nextNodeId, setNextNodeId] = useState<number>(1);
  const [nextEdgeId, setNextEdgeId] = useState<number>(1);
  const [action, setAction] = useState<string | null>(null);
  const [tempEdgeFrom, setTempEdgeFrom] = useState<number | null>(null);

  const handleNodeClick = useCallback(
    (nodeId: number) => {
      if (action === "connect") {
        if (tempEdgeFrom === null) {
          setTempEdgeFrom(nodeId);
        } else {
          const newEdge: Edge = {
            id: nextEdgeId,
            from: tempEdgeFrom,
            to: nodeId,
          };
          setEdges((prevEdges) => [...prevEdges, newEdge]);
          setTempEdgeFrom(null);
          setNextEdgeId(nextEdgeId + 1);
          setAction(null);
        }
      } else if (action === "disconnect") {
        if (tempEdgeFrom === null) {
          setTempEdgeFrom(nodeId);
        } else {
          const edgeToRemove = edges.find(
            (edge) =>
              (edge.from === tempEdgeFrom && edge.to === nodeId) ||
              (edge.from === nodeId && edge.to === tempEdgeFrom)
          );
          if (edgeToRemove) {
            setEdges((prevEdges) =>
              prevEdges.filter((edge) => edge.id !== edgeToRemove.id)
            );
          }
          setTempEdgeFrom(null);
          setAction(null);
        }
      } else {
        setSelectedNodeId(nodeId);
      }
    },
    [action, edges, nextEdgeId, tempEdgeFrom]
  );

  useEffect(() => {
    if (containerRef.current && !network) {
      const data = {
        nodes: new DataSet<Node>([]),
        edges: new DataSet<Edge>([]),
      };
      const options = {
        nodes: {
          shape: "circle",
          size: 30,
          font: {
            vadjust: -20,
          },
          labelHighlightBold: true,
        },
        physics: {
          enabled: true,
          stabilization: false,
          minVelocity: 0.75,
          solver: "forceAtlas2Based",
          forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 200,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 1,
          },
          boundingBox: {
            left: -300,
            right: 300,
            top: -300,
            bottom: 300,
          },
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true,
        },
      };
      const net = new Network(containerRef.current, data, options);
      setNetwork(net);

      net.on("click", (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          handleNodeClick(nodeId);
        } else {
          setSelectedNodeId(null);
        }
      });
    }
  }, [containerRef, network, handleNodeClick]);

  useEffect(() => {
    if (network) {
      network.setData({
        nodes: new DataSet<Node>(
          nodes.map((node) => ({
            ...node,
            color: node.id === selectedNodeId ? "#0CC95B" : node.color,
          }))
        ),
        edges: new DataSet<Edge>(edges),
      });
    }
  }, [network, nodes, edges, selectedNodeId]);

  const addNode = (label: string, color: string) => {
    const newNode: Node = {
      id: nextNodeId,
      label,
      color,
    };
    setNodes([...nodes, newNode]);
    setNextNodeId(nextNodeId + 1);
  };

  const fitToScreen = () => {
    if (network) {
      network.fit({
        animation: {
          duration: 1000,
          easingFunction: "easeInOutQuad",
        },
      });
    }
  };

  return {
    network,
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    addNode,
    setAction,
    handleNodeClick,
    fitToScreen,
  };
};

export default useNetwork;
