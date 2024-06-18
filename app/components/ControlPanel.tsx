import React from "react";

interface ControlPanelProps {
  newNodeLabel: string;
  newNodeContent: string;
  newNodeColor: string;
  setNewNodeLabel: (label: string) => void;
  setNewNodeContent: (content: string) => void;
  setNewNodeColor: (color: string) => void;
  addNode: () => void;
  setAction: (action: string) => void;
  fitToScreen: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  newNodeLabel,
  newNodeContent,
  newNodeColor,
  setNewNodeLabel,
  setNewNodeContent,
  setNewNodeColor,
  addNode,
  setAction,
  fitToScreen,
}) => {
  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Node Label"
          value={newNodeLabel}
          onChange={(e) => setNewNodeLabel(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Node Content"
          value={newNodeContent}
          onChange={(e) => setNewNodeContent(e.target.value)}
        />
      </div>
      <div>
        <input
          type="color"
          value={newNodeColor}
          onChange={(e) => setNewNodeColor(e.target.value)}
        />
      </div>
      <button onClick={addNode}>Add Node</button>
      <button onClick={() => setAction("connect")}>Connect</button>
      <button onClick={() => setAction("disconnect")}>Disconnect</button>
      <button onClick={fitToScreen}>Fit to Screen</button>
    </div>
  );
};

export default ControlPanel;
