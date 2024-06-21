// waiting/page.tsx
"use client"; // 클라이언트 컴포넌트로 설정

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSocket } from "../components/SocketContext";


const APPLICATION_SERVER_URL = process.env.NEXT_PUBLIC_OPENVIDU_URL;

const WaitingPage: React.FC = () => {
  const { socket, connectSocket } = useSocket();
  const [mySessionId, setMySessionId] = useState<string>("SessionE");
  const [myUserName, setMyUserName] = useState<string>(
    "OpenVidu_User_" + Math.floor(Math.random() * 100)
  );
  const router = useRouter();

  const handleChangeSessionId = (e: ChangeEvent<HTMLInputElement>) => {
    setMySessionId(e.target.value);
  };

  const handleChangeUserName = (e: ChangeEvent<HTMLInputElement>) => {
    setMyUserName(e.target.value);
  };

  const joinSession = async (event: FormEvent) => {
    event.preventDefault();
    if (mySessionId && myUserName) {
      console.log("Joining session with ID:", mySessionId);
      try {
        const token = await getToken();
        console.log("Token received:", token);
        sessionStorage.setItem("sessionId", mySessionId);
        sessionStorage.setItem("userName", myUserName);
        sessionStorage.setItem("token", token);
        
        connectSocket();

        router.push("/main");
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
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to MIKO</h1>
      <p>MIKO</p>
      <div id="join">
        <div id="join-dialog">
          <h1>비디오 세션에 참가하기</h1>
          <form onSubmit={joinSession}>
            <p>
              <label>참가자: </label>
              <input
                type="text"
                id="userName"
                value={myUserName}
                onChange={handleChangeUserName}
                required
              />
            </p>
            <p>
              <label>세션: </label>
              <input
                type="text"
                id="sessionId"
                value={mySessionId}
                onChange={handleChangeSessionId}
                required
              />
            </p>
            <p>
              <input name="commit" type="submit" value="참가" />
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
