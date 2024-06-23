// components/TabNavigation.tsx
"use client";

import React, { useState } from "react";
import NetworkGraph from "./NetworkGraph";
import Conversation from "./Conversation"; // 이 컴포넌트는 각 탭에 맞게 생성해야 합니다.

const TabNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState("network");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
        <button onClick={() => setActiveTab("network")} style={{ margin: "0 10px" }}>
          Network
        </button>
        <button onClick={() => setActiveTab("conversation")} style={{ margin: "0 10px" }}>
          Conversation
        </button>
      </div>
      <div>
        {activeTab === "network" && <NetworkGraph />}
        {activeTab === "conversation" && <Conversation />}
      </div>
    </div>
  );
};

export default TabNavigation;
