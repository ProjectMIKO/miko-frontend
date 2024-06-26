"use client";

import React, { useState } from "react";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import AudioPlayer from "../components/AudioPlayer";
import styles from "./Page.module.css";

const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab1":
        return <div></div>;
      case "tab2":
        return <div>탭 2의 내용</div>;
      case "tab3":
        return (
          <div>
            태리: 흥국이 들어와 있었네 청우형은?
            <br />
            <br />
            흥국: 어 청우형 조금 늦는다고 했어.
            <br />
            <br />
            태리: 그럼 일단 아이디어 회의 먼저 하고있자. 좋은 아이디어가 있어?
            <br />
            <br />
            흥국: 음성채팅방 같은 거 만들면 어떨까? 실시간으로 AI가 채팅에서
            키워드를 따와서 키워드 플로우 같은 걸 볼 수 있게 하는 거지.
            <br />
            <br />
            태리: 키워드 관리하는 거면 차라리 회의 쪽으로 만드는 게 낫지 않아
            회의록을 자동으로 만들어주는 거지.
            <br />
            <br />
            흥국: 좋은데? 그러면 Meeting In, Keyword Out 어때. 미코.
            <br />
            <br />
            태리: 괜찮은데?
            <br />
            <br />
            태리: 그러면 이 프로젝트를 구성하는 데에 어떤 기술적어려움이 있을까?
            <br />
            <br />
            흥국: 일단 자연어 처리가 프로세스를 많이 잡아 먹을거라 메인 서버에서
            구현하기 힘들것 같아. 그리고 클라이언트끼리 연결할 때 sfu로 구현하면
            메인서버에 부하가 좀 많이 걸릴 거야.
            <br />
            <br />
            태리: 그럼 각각의 작은 서비스로 나누어 개발하자! 마치 마이크로
            서비스 아키텍처 처럼 말이야!
            <br />
            <br />
            태리: 내가 노드 연결하고있을게
            <br />
            <br />
            청우: (입장) 어 미안 조금 늦었네
            <br />
            <br />
            태리: 괜찮아 형!그러면 청우형이 키워드 맵으로 맥락파악하고 있을래?
            그동안 점심 메뉴 고르자
            <br />
            <br />
            흥국: 국밥 땡기는데 국밥 어때?
            <br />
            <br />
            태리: 나쁘지 않은데?
            <br />
            <br />
            흥국: 그러면 점심은 태평소국밥 먹는걸로 하자.
            <br />
            <br />
            청우: 나도 국밥 좋아. <br />
            <br />
            청우: 아, 그런데 키워드 맵으로 너희가 했던 이야기 얼추 파악했어
            흐름이 한눈에 보여서 좋네.
            <br />
            클라이언트끼리 연결하는건 내가 Openvidu로 할 줄 알아. 내가 할게.
            <br />
            <br />
            태리: 그러면 그 문제는 청우형이 해결하고 자연어 처리는 내가 파이썬
            서버에서 언어 모델을 직접 돌려서 해결해볼게.
            <br />
            <br />
            흥국: 음.. 그러면 좋겠다.
            <br />
            <br />
            태리: 그러면 여기서 회의 이쯤 마칠까?
            <br />
            <br />
            청우: 좋아! 그런데 미코 진짜 편하다 한눈에 보여
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Header>MIKO</Header>
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

      <Footer>
        <AudioPlayer />
      </Footer>
    </div>
  );
};

export default Page;
