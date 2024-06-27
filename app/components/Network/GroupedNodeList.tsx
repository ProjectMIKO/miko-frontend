import React, { useState, useEffect } from "react";
import { Node, Edge } from "../../types/types";
import styles from "./GroupedNodeList.module.css";

interface GroupedNodeListProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: number | null;
  onNodeClick: (nodeId: number) => void;
  className?: string;
}

const GroupedNodeList: React.FC<GroupedNodeListProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  className,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: number]: boolean;
  }>({});
  const [groupedNodes, setGroupedNodes] = useState<{ [key: number]: Node[] }>(
    {}
  );

  const toggleGroup = (groupId: number) => {
    setExpandedGroups({
      ...expandedGroups,
      [groupId]: !expandedGroups[groupId],
    });
  };

  const getConnectedNodes = (nodeId: number, edges: Edge[]): Set<number> => {
    const connectedNodes = new Set<number>();
    const stack = [nodeId];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current && !connectedNodes.has(current)) {
        connectedNodes.add(current);
        edges.forEach((edge) => {
          if (edge.from === current && !connectedNodes.has(edge.to)) {
            stack.push(edge.to);
          } else if (edge.to === current && !connectedNodes.has(edge.from)) {
            stack.push(edge.from);
          }
        });
      }
    }

    return connectedNodes;
  };

  useEffect(() => {
    const groups: { [key: number]: Node[] } = {};
    const nodeGroupMap = new Map<number, number>();
    let nextGroupId = 1;

    nodes.forEach((node) => {
      if (!nodeGroupMap.has(node.id)) {
        const connectedNodes = Array.from(getConnectedNodes(node.id, edges));
        if (connectedNodes.length > 1) {
          const groupId = nextGroupId++;
          connectedNodes.forEach((connectedNodeId) => {
            nodeGroupMap.set(connectedNodeId, groupId);
          });
          groups[groupId] = connectedNodes.map(
            (id) => nodes.find((n) => n.id === id)!
          );
        }
      }
    });

    setGroupedNodes(groups);
  }, [nodes, edges]);

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.heading}>그룹</h3>
      <ul className={styles.groupList}>
        {Object.keys(groupedNodes).map((groupId) => (
          <li key={groupId}>
            <div
              onClick={() => toggleGroup(Number(groupId))}
              className={`${styles.groupHeader} ${
                expandedGroups[Number(groupId)] ? styles.groupHeaderExpanded : ""
              }`}
              aria-expanded={expandedGroups[Number(groupId)]}
            >
              <span>Group {groupId}</span>
              <span>{expandedGroups[Number(groupId)] ? "-" : "+"}</span>
            </div>
            {expandedGroups[Number(groupId)] && (
              <ul className={styles.nodeList}>
                {groupedNodes[Number(groupId)].map((node) => (
                  <li
                    key={node.id}
                    onClick={() => onNodeClick(node.id)}
                    className={`${styles.nodeItem} ${
                      node.id === selectedNodeId ? styles.nodeItemSelected : ""
                    }`}
                    data-selected={
                      node.id === selectedNodeId ? "true" : "false"
                    }
                  >
                    {node.label}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupedNodeList;
