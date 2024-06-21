import React, { useState, useEffect } from "react";
import { Node, Edge } from "../../types/types";

interface GroupedNodeListProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: number | null;
  onNodeClick: (nodeId: number) => void;
}

const GroupedNodeList: React.FC<GroupedNodeListProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
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
      <h3 style={{ textAlign: "center", color: "#333" }}>Grouped Keys</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {Object.keys(groupedNodes).map((groupId) => (
          <li key={groupId}>
            <div
              onClick={() => toggleGroup(Number(groupId))}
              style={{
                cursor: "pointer",
                padding: "10px",
                backgroundColor: expandedGroups[Number(groupId)]
                  ? "#96A0FE"
                  : "#FFF",
                color: expandedGroups[Number(groupId)] ? "#FFF" : "#96A0FE",
                border: "1px solid #CCC",
                borderRadius: "4px",
                marginBottom: "5px",
                transition: "background-color 0.3s, color 0.3s",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              aria-expanded={expandedGroups[Number(groupId)]}
            >
              <span>Group {groupId}</span>
              <span>{expandedGroups[Number(groupId)] ? "-" : "+"}</span>
            </div>
            {expandedGroups[Number(groupId)] && (
              <ul
                style={{
                  listStyleType: "none",
                  padding: "0 10px",
                  margin: 0,
                  transition: "max-height 0.3s",
                }}
              >
                {groupedNodes[Number(groupId)].map((node) => (
                  <li
                    key={node.id}
                    onClick={() => onNodeClick(node.id)}
                    style={{
                      cursor: "pointer",
                      padding: "8px",
                      backgroundColor:
                        node.id === selectedNodeId ? "#96A0FE" : "#FFF",
                      color: node.id === selectedNodeId ? "#FFF" : "#333",
                      border:
                        node.id === selectedNodeId
                          ? "1px solid #96A0FE"
                          : "1px solid #CCC",
                      borderRadius: "4px",
                      marginBottom: "5px",
                      transition: "background-color 0.3s, color 0.3s",
                    }}
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
