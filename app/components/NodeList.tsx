import React from "react";
import { Node } from "../types/types";

interface NodeListProps {
  nodes: Node[];
  selectedNodeId: number | null;
  onNodeClick: (nodeId: number) => void;
}

const NodeList: React.FC<NodeListProps> = ({
  nodes,
  selectedNodeId,
  onNodeClick,
}) => {
  return (
    <div
      style={{
        width: "300px",
        margin: "20px",
        border: "1px solid black",
        padding: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3>Node List</h3>
      <ul>
        {nodes.map((node) => (
          <li
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            style={{
              cursor: "pointer",
              padding: "5px",
              backgroundColor: node.id === selectedNodeId ? "#0CC95B" : "#FFF",
              color: node.id === selectedNodeId ? "#FFF" : "#000",
              border:
                node.id === selectedNodeId
                  ? "1px solid #0CC95B"
                  : "1px solid #CCC",
              marginBottom: "5px",
            }}
          >
            {node.id}: {node.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NodeList;
