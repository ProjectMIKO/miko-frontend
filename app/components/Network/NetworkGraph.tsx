"use client";

import React, { useRef, useEffect } from "react";
import useNetwork from "../../hooks/useNetwork";

interface Props {
  containerRef: React.RefObject<HTMLDivElement>;
  selectedNodeId: number | null;
  handleNodeClick: (nodeId: number | null) => void;
}

const NetworkGraph: React.FC<Props> = ({
  containerRef,
  selectedNodeId,
  handleNodeClick,
}) => {
  const { network, nodes, edges } = useNetwork(containerRef);

  useEffect(() => {
    if (network) {
      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          handleNodeClick(nodeId);
        } else {
          handleNodeClick(null); // 수정된 부분
        }
      });
    }
  }, [network, handleNodeClick]);

  return (
    <div
      ref={containerRef}
      style={{
        border: "1px solid #CCC",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        height: "100%",
      }}
      onClick={() => {
        if (selectedNodeId !== null) {
          handleNodeClick(selectedNodeId);
        }
      }}
    />
  );
};

export default NetworkGraph;
