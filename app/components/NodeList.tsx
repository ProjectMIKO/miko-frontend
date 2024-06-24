// app/components/NodeList.tsx
import React from "react";
import { Node } from "../../types/types";

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
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {nodes.map((node) => (
        <li
          key={node.id}
          onClick={() => onNodeClick(node.id)}
          style={{
            cursor: "pointer",
            padding: "8px",
            backgroundColor: node.id === selectedNodeId ? "#96A0FE" : "#FFF",
            color: node.id === selectedNodeId ? "#FFF" : "#333",
            border:
              node.id === selectedNodeId
                ? "1px solid #96A0FE"
                : "1px solid #CCC",
            borderRadius: "4px",
            marginBottom: "5px",
            transition: "background-color 0.3s, color 0.3s",
          }}
        >
          <strong>ID:</strong> {node.id} <br />
          <strong>Label:</strong> {node.label} <br />
          <strong>Content:</strong>
          <div dangerouslySetInnerHTML={{ __html: node.content }} />
        </li>
      ))}
    </ul>
  );
};

export default NodeList;
