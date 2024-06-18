"use client";

import React, { useRef, useState } from "react";
import ControlPanel from "./ControlPanel";
import useNetwork from "../hooks/useNetwork";
import NodeList from "./NodeList";

const NetworkGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    network,
    nodes,
    selectedNodeId,
    addNode,
    setAction,
    handleNodeClick,
    fitToScreen,
  } = useNetwork(containerRef);

  const [newNodeLabel, setNewNodeLabel] = useState<string>("");
  const [newNodeColor, setNewNodeColor] = useState<string>("#5A5A5A");

  const handleAddNode = () => {
    if (newNodeLabel) {
      addNode(newNodeLabel, newNodeColor);
      setNewNodeLabel("");
      setNewNodeColor("#5A5A5A");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <ControlPanel
        newNodeLabel={newNodeLabel}
        newNodeColor={newNodeColor}
        setNewNodeLabel={setNewNodeLabel}
        setNewNodeColor={setNewNodeColor}
        addNode={handleAddNode}
        setAction={setAction}
        fitToScreen={fitToScreen}
      />
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
      <NodeList
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
};

export default NetworkGraph;
