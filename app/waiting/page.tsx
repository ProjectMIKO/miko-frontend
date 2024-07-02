"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import logo from "../../public/MIKO_LOGO_Square.png";
import styles from "./Waiting.module.css";
import WaitingVideoComponent from "./WaitingVideoComponent";

const APPLICATION_SERVER_URL =
  process.env.NEXT_PUBLIC_MAIN_SERVER_URL || "http://localhost:8080/";

const WaitingPage: React.FC = () => {
  const { data: session } = useSession();
  const [mySessionId, setMySessionId] = useState<string>("방 제목을 입력하세요.");
  const [myUserName, setMyUserName] = useState<string>("");
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string | null>(null);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (session?.user?.name) {
      setMyUserName(session.user.name);
    } else {
      setMyUserName("OpenVidu_User_" + Math.floor(Math.random() * 100));
    }
  }, [session]);

  const handleChangeSessionId = (e: ChangeEvent<HTMLInputElement>) => {
    setMySessionId(e.target.value);
  };

  const handleChangeUserName = (e: ChangeEvent<HTMLInputElement>) => {
    setMyUserName(e.target.value);
  };

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      setVideoDevices(videoDevices);
      setAudioDevices(audioDevices);
      if (videoDevices.length > 0) {
        setSelectedVideoDeviceId(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0) {
        setSelectedAudioDeviceId(audioDevices[0].deviceId);
      }
    };

    getDevices();
  }, []);

  const joinSession = async (event: FormEvent) => {
    event.preventDefault();
    if (mySessionId && myUserName) {
      console.log("Joining session with ID:", mySessionId);
      try {
        const token = await getToken();
        console.log("Token received:", token);

        const url = `/meetingRoom?sessionId=${encodeURIComponent(
          mySessionId
        )}&userName=${encodeURIComponent(
          myUserName
        )}&token=${encodeURIComponent(token)}`;

        router.push(url);
      } catch (error) {
        console.error("Error joining session:", error);
      }
    }
  };

  const getToken = async () => {
    const sessionId = await createSession(mySessionId);
    const token = await createToken(sessionId);
    return token;
  };

  const createSession = async (sessionId: string) => {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}api/openvidu/sessions`,
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data.sessionId; // 세션 ID
  };

  const createToken = async (sessionId: string) => {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}api/openvidu/sessions/${sessionId}/connections`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data.token; // 토큰
  };

  return (
    
    <div className={styles.container}>
      <WaitingVideoComponent 
        selectedVideoDeviceId={selectedVideoDeviceId} 
        selectedAudioDeviceId={selectedAudioDeviceId}
      />
      <div className={styles.card}>
        <Image
          src={logo}
          alt="MIKO Logo"
          width={100}
          height={100}
          className={styles.logo}
        />
        <h1 className={styles.title}>Welcome to MIKO</h1>
        <div id="join">
          <div id="join-dialog">
            {session ? (
              <div>
                <p className={styles.info}>
                  <span className={styles.bold}>{session.user?.name}</span>님
                  반갑습니다!
                </p>
              </div>
            ) : (
              <p className={styles.info}>Not logged in</p>
            )}
            <form onSubmit={joinSession} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>이름</label>
                <input
                  type="text"
                  id="userName"
                  value={myUserName}
                  onChange={handleChangeUserName}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>방 제목</label>
                <input
                  type="text"
                  id="sessionId"
                  placeholder={mySessionId}
                  onChange={handleChangeSessionId}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>비디오 장치</label>
                <select
                  id="videoDevice"
                  onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
                  value={selectedVideoDeviceId || ""}
                  className={styles.input}
                >
                  <option value="off">끄기</option>
                  {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>오디오 장치</label>
                <select
                  id="audioDevice"
                  onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
                  value={selectedAudioDeviceId || ""}
                  className={styles.input}
                >
                  <option value="off">끄기</option>
                  {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <input
                  name="commit"
                  type="submit"
                  value="Join"
                  className={styles.button}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
