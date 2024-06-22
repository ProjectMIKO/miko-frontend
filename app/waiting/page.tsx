"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSocket } from "../components/SocketContext";


const APPLICATION_SERVER_URL = process.env.NEXT_PUBLIC_OPENVIDU_URL;

const WaitingPage: React.FC = () => {
  const { data: session } = useSession();
  const { socket, connectSocket, isConnected } = useSocket();
  const [mySessionId, setMySessionId] = useState<string>("SessionE");
  const [myUserName, setMyUserName] = useState<string>(
    session?.user?.name || "OpenVidu_User_" + Math.floor(Math.random() * 100)
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

  useEffect(() => {
    if (isConnected) {
      socket.on('welcome', (nickname, memberCount) => {
        console.log(`Welcome ${nickname}, there are ${memberCount} members in the room`);
      });

      socket.on('entered_room', () => {
        console.log('Entered room event received');
      });

      return () => {
        socket.off('welcome');
        socket.off('entered_room');
      };
    }
  }, [isConnected, socket]);

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
          {session ? (
            <div>
              <p>로그인한 사용자: {session.user?.name}</p>
              <p>이메일: {session.user?.email}</p>
            </div>
          ) : (
            <p>로그인되지 않았습니다.</p>
          )}
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
