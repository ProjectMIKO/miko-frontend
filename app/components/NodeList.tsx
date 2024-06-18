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
        margin: "5px",
        border: "1px solid #CCC",
        padding: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#F9F9F9",
        maxHeight: "650px", // 최대 높이 설정
        overflowY: "auto", // 수직 스크롤 추가
      }}
    >
      <h3 style={{ textAlign: "center", color: "#333" }}>Key Words</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {nodes.map((node) => (
          <li
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            style={{
              cursor: "pointer",
              padding: "10px",
              backgroundColor: node.id === selectedNodeId ? "#0CC95B" : "#FFF",
              color: node.id === selectedNodeId ? "#FFF" : "#000",
              border: "1px solid #CCC",
              borderRadius: "4px",
              marginBottom: "10px",
              boxShadow:
                node.id === selectedNodeId
                  ? "0 0 10px rgba(0, 255, 94, 0.5)"
                  : "none",
              transition: "background-color 0.3s, color 0.3s, box-shadow 0.3s",
            }}
            data-selected={node.id === selectedNodeId ? "true" : "false"}
          >
            <div style={{ marginBottom: "5px" }}>
              <strong>ID:</strong> {node.id}
            </div>
            <div style={{ marginBottom: "5px" }}>
              <strong>Label:</strong> {node.label}
            </div>
            <div>
              <strong>Content:</strong> {node.content}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NodeList;
