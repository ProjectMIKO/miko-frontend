"use client";

import NetworkGraph from "../components/NetworkGraph";
import App from "../components/App";
import styles from "../Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.appContainer}>
        <App />
      </div>
      <div className={styles.networkGraphContainer}>
        <NetworkGraph />
      </div>
    </div>
  );
}
