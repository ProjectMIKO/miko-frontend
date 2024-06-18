"use client";

import React from "react";

interface ControlPanelProps {
  newNodeLabel: string;
  newNodeColor: string;
  setNewNodeLabel: (value: string) => void;
  setNewNodeColor: (value: string) => void;
  addNode: () => void;
  setAction: (action: string | null) => void;
  fitToScreen: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  newNodeLabel,
  newNodeColor,
  setNewNodeLabel,
  setNewNodeColor,
  addNode,
  setAction,
  fitToScreen,
}) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        value={newNodeLabel}
        onChange={(e) => setNewNodeLabel(e.target.value)}
        placeholder="New node label"
      />
      <input
        type="color"
        value={newNodeColor}
        onChange={(e) => setNewNodeColor(e.target.value)}
        placeholder="New node color"
      />
      <button onClick={addNode}>Add Node</button>
      <br />
      <button onClick={() => setAction("connect")}>Connect Nodes</button>
      <button onClick={() => setAction("disconnect")}>Disconnect Nodes</button>
      <br />
      <button onClick={fitToScreen}>Fit to Screen</button>
    </div>
  );
};

export default ControlPanel;
