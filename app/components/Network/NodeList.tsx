import React from "react";
import { Node } from "../../types/types";
import styles from "./styles/NodeList.module.css";

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
    <ul className={styles.nodeList}>
      {nodes.map((node) => (
        <li
          key={node.id}
          onClick={() => onNodeClick(node.id)}
          className={`${styles.nodeItem} ${
            node.id === selectedNodeId
              ? styles.nodeItemSelected
              : styles.nodeItemNotSelected
          }`}
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
