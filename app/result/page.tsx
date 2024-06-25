import React from "react";
import Head from "next/head";
import styles from "../styles/Page.module.css";

const Page = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>회의 결과 화면</title>
        <meta name="description" content="회의 결과를 표시하는 화면" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>MIKO</header>

      <main className={styles.main}>
        <section className={styles.left}>왼쪽 영역</section>
        <section className={styles.right}>오른쪽 영역</section>
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
