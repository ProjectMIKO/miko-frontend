"use client";

import React, { useRef, useState } from "react";
import ControlPanel from "./ControlPanel";
import useNetwork from "../hooks/useNetwork";

const NetworkGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    network,
    selectedNodeId,
    addNode,
    setAction,
    handleNodeClick,
    fitToScreen,
  } = useNetwork(containerRef);

  const [newNodeLabel, setNewNodeLabel] = useState<string>("");
  const [newNodeColor, setNewNodeColor] = useState<string>("#97C2FC");

  const handleAddNode = () => {
    if (newNodeLabel) {
      addNode(newNodeLabel, newNodeColor);
      setNewNodeLabel("");
      setNewNodeColor("#97C2FC");
    }
  };

  return (
    <div>
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
          margin: "20px auto",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
        onClick={() => {
          if (selectedNodeId !== null) {
            handleNodeClick(selectedNodeId);
          }
        }}
      />
    </div>
  );
};

export default NetworkGraph;
