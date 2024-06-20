// main/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import NetworkGraph from "../components/NetworkGraph";
import STTComponent from '../components/STTComponent';
import App from "../components/App";
import styles from "../Home.module.css";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("sessionId");
    const storedUserName = sessionStorage.getItem("userName");
    const storedToken = sessionStorage.getItem("token");

    if (storedSessionId && storedUserName && storedToken) {
      setSessionId(storedSessionId);
      setUserName(storedUserName);
      setToken(storedToken);
    } else {
      // 세션 정보가 없으면 대기 페이지로 이동
      window.location.href = "/waiting";
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.appContainer}>
        {sessionId && userName && token ? (
          <App sessionId={sessionId} userName={userName} token={token} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className={styles.networkGraphContainer}>
        <NetworkGraph />
      </div>
    </div>
  );
}
