// app/result/page.tsx
"use client";

import React, { useState } from "react";
import Head from "next/head";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import AudioPlayer from "../components/AudioPlayer";
import styles from "./Page.module.css";

const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab1":
        return (
          <div>
            올해 초부터 캘리포니아 농부성 협력기관 한 곳으로부터 의뢰를 받아서
            캘리포니아 한인 농부들에게 제공할 여러 가지 문서를 번역해 왔습니다.
            작년에 우연한 계기로 서류를 번역해 드렸던 한인분이 적극 추천해
            주셔서 본의 아니게 농업 분야 서류를 번역하게 되었네요. 덕분에
            우수농산물관리제도(Good Agricultural Practices)라든가
            식품안전계획(Food Safety Plan)과 같은 용어에 친숙해졌습니다. 우물 안
            개구리처럼 사는 저에게는 새로운 세상이 신기하고 재밌습니다. :-)
            (나중에 타지역 한인 농부들도 참고하도록 웹에다 올릴 계획이고 정부
            공개 자료를 이해하기 쉽도록 정리한 내용이니) 기밀을 유지하지 않아도
            되는 문서라 한 문장 골라서 분석합니다. 신문 기사나 책처럼 정제되지
            않은, 실생활에서 사용하는 문장이라 보시면 되겠습니다. 농장에서
            사용하는 물은 1년에 한 번 수질 검사를 해야 하는데, 샘플 채취 방법을
            설명하는 문장입니다. Sentence All samples shall be properly labeled
            in order to ensure that the results can be traced back to the
            location from which it was collected. Words & Expressions shall -
            해야 한다 (의무) label - 라벨을 붙이다 ensure - 보장하다 properly -
            적절히 in order to - ~하기 위하여 trace - 추적하다 trace back to -
            ~까지 거슬러 올라가다, ~까지 거슬러 추적하다 collect - 수집하다,
            채집하다 Structure A: You label this book. You shall label all
            samples. You shall properly label all samples. All samples shall be
            properly labeled (by you). B: Exercise ensures my health. I exercise
            in order to ensure my health. I exercise in order to ensure that I
            can be healthy. C = A + B: All samples shall be properly labeled in
            order to ensure that S + V. D: We can trace the results. We can
            trace the results back to the location. The results can be traced
            back to the location. E: You collected it from the location. It was
            collected from the location. F = D + E The results can be traced
            back to the location from which it was collected from the location.
            = The results can be traced back to the location which it was
            collected from the location. = The results can be traced back to the
            location where it was collected from the location. G = C + F All
            samples shall be properly labeled in order to ensure that the
            results can be traced back to the location from which it was
            collected. Grammar to study 수동태, 관계대명사, 관계부사, 부정사
            부사적 용법 *보시면 맨날 같은 문법이 반복되죠? 기본 원리만 익혀
            놓으시면 그 다음부터는 재활용입니다! Composition Exercises 문장이
            길어 외우기는 번거롭네요(저 완전 게을러요^^;;). 대신 다음 문장을
            영작해 보면 어떨까요? 위에서 사용한 표현을 그대로 쓰시면 됩니다.
            관계사도 하나 폼나게 추가! 최초의(first) 소프트웨어 버그는 1947년
            컴퓨터 안에서 발견된 나방(moth)으로 거슬러 올라갑니다. 최초의
            소프트웨어 버그는 / 거슬러 추적될 수 있습니다 / 나방까지 / 컴퓨터
            안에서 발견된 / 1947년에 Books to recommend: Peopleware: Productive
            Projects and Teams (3rd Edition) [Kindle Edition] 피플웨어 번역서가
            출간되었습니다. 번역서를 읽으신 후에 원서에 도전해 보셔도
            좋겠습니다. 영어는 조금 어렵습니다^^;; You may also like: 긴 문장
            보기, 영어 문장 구조 분석 전화 영어, 쪽팔려 가며 익힌 생존 팁 6가지
            골수팬 1,000명: 개인 창작자는 골수팬 1,000명만 있으면 먹고 산다!올해
            초부터 캘리포니아 농부성 협력기관 한 곳으로부터 의뢰를 받아서
            캘리포니아 한인 농부들에게 제공할 여러 가지 문서를 번역해 왔습니다.
            작년에 우연한 계기로 서류를 번역해 드렸던 한인분이 적극 추천해
            주셔서 본의 아니게 농업 분야 서류를 번역하게 되었네요. 덕분에
            우수농산물관리제도(Good Agricultural Practices)라든가
            식품안전계획(Food Safety Plan)과 같은 용어에 친숙해졌습니다. 우물 안
            개구리처럼 사는 저에게는 새로운 세상이 신기하고 재밌습니다. :-)
            (나중에 타지역 한인 농부들도 참고하도록 웹에다 올릴 계획이고 정부
            공개 자료를 이해하기 쉽도록 정리한 내용이니) 기밀을 유지하지 않아도
            되는 문서라 한 문장 골라서 분석합니다. 신문 기사나 책처럼 정제되지
            않은, 실생활에서 사용하는 문장이라 보시면 되겠습니다. 농장에서
            사용하는 물은 1년에 한 번 수질 검사를 해야 하는데, 샘플 채취 방법을
            설명하는 문장입니다. Sentence All samples shall be properly labeled
            in order to ensure that the results can be traced back to the
            location from which it was collected. Words & Expressions shall -
            해야 한다 (의무) label - 라벨을 붙이다 ensure - 보장하다 properly -
            적절히 in order to - ~하기 위하여 trace - 추적하다 trace back to -
            ~까지 거슬러 올라가다, ~까지 거슬러 추적하다 collect - 수집하다,
            채집하다 Structure A: You label this book. You shall label all
            samples. You shall properly label all samples. All samples shall be
            properly labeled (by you). B: Exercise ensures my health. I exercise
            in order to ensure my health. I exercise in order to ensure that I
            can be healthy. C = A + B: All samples shall be properly labeled in
            order to ensure that S + V. D: We can trace the results. We can
            trace the results back to the location. The results can be traced
            back to the location. E: You collected it from the location. It was
            collected from the location. F = D + E The results can be traced
            back to the location from which it was collected from the location.
            = The results can be traced back to the location which it was
            collected from the location. = The results can be traced back to the
            location where it was collected from the location. G = C + F All
            samples shall be properly labeled in order to ensure that the
            results can be traced back to the location from which it was
            collected. Grammar to study 수동태, 관계대명사, 관계부사, 부정사
            부사적 용법 *보시면 맨날 같은 문법이 반복되죠? 기본 원리만 익혀
            놓으시면 그 다음부터는 재활용입니다! Composition Exercises 문장이
            길어 외우기는 번거롭네요(저 완전 게을러요^^;;). 대신 다음 문장을
            영작해 보면 어떨까요? 위에서 사용한 표현을 그대로 쓰시면 됩니다.
            관계사도 하나 폼나게 추가! 최초의(first) 소프트웨어 버그는 1947년
            컴퓨터 안에서 발견된 나방(moth)으로 거슬러 올라갑니다. 최초의
            소프트웨어 버그는 / 거슬러 추적될 수 있습니다 / 나방까지 / 컴퓨터
            안에서 발견된 / 1947년에 Books to recommend: Peopleware: Productive
            Projects and Teams (3rd Edition) [Kindle Edition] 피플웨어 번역서가
            출간되었습니다. 번역서를 읽으신 후에 원서에 도전해 보셔도
            좋겠습니다. 영어는 조금 어렵습니다^^;; You may also like: 긴 문장
            보기, 영어 문장 구조 분석 전화 영어, 쪽팔려 가며 익힌 생존 팁 6가지
            골수팬 1,000명: 개인 창작자는 골수팬 1,000명만 있으면 먹고 산다!
          </div>
        );
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
