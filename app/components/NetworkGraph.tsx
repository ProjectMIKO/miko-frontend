"use client";

import React, { useRef, useState } from "react";
import ControlPanel from "./ControlPanel";
import useNetwork from "../hooks/useNetwork";
import GroupedNodeList from "./GroupedNodeList";
import NodeList from "./NodeList";

const NetworkGraph: React.FC = () => {
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

  const handleAddNode = () => {
    if (newNodeLabel && newNodeContent) {
      addNode(newNodeLabel, newNodeContent, newNodeColor);
      setNewNodeLabel("");
      setNewNodeContent("");
      setNewNodeColor("#5A5A5A");
    }
  };

  return (
    <div style={{ display: "flex" }}>
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
        }}
      >
        <div
          ref={containerRef}
          style={{
            height: "650px",
            width: "1000px",
            border: "1px solid black",
            margin: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
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
      </div>
      <NodeList
        nodes={nodes.get()}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
};

export default NetworkGraph;
