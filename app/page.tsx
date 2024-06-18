"use client";

import NetworkGraph from "./components/NetworkGraph";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <NetworkGraph />
      </div>
    </div>
  );
}
