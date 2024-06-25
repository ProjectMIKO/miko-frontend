"use client";

import React, { useState } from "react";
import Head from "next/head";
import styles from "../styles/Page.module.css";

const Page = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab1":
        return <div>탭 1의 내용</div>;
      case "tab2":
        return <div>탭 2의 내용</div>;
      case "tab3":
        return <div>탭 3의 내용</div>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>회의 결과 화면</title>
        <meta name="description" content="회의 결과를 표시하는 화면" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>MIKO</header>

      <main className={styles.main}>
        <section className={styles.left}>노드 그래프 영역</section>
        <section className={styles.right}>
          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab("tab1")}
              className={`${styles.tabButton} ${
                activeTab === "tab1" ? styles.activeTab : ""
              }`}
            >
              그룹
            </button>
            <button
              onClick={() => setActiveTab("tab2")}
              className={`${styles.tabButton} ${
                activeTab === "tab2" ? styles.activeTab : ""
              }`}
            >
              키워드 요약
            </button>
            <button
              onClick={() => setActiveTab("tab3")}
              className={`${styles.tabButton} ${
                activeTab === "tab3" ? styles.activeTab : ""
              }`}
            >
              음성 기록
            </button>
          </div>
          <div className={styles.tabContent}>{renderTabContent()}</div>
        </section>
      </main>

      <footer className={styles.footer}>
        <audio controls>
          <source src="/audio/sample.mp3" type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      </footer>
    </div>
  );
};

export default Page;
