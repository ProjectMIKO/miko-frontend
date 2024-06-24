"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSocket } from "../components/SocketContext";
import Image from 'next/image';
import logo from '../../public/MIKO_LOGO_Square.png';

const APPLICATION_SERVER_URL = process.env.NEXT_PUBLIC_MAIN_SERVER_URL || "http://localhost:8080/";

const WaitingPage: React.FC = () => {
  const { data: session } = useSession();
  const { socket, connectSocket, isConnected } = useSocket();
  const [mySessionId, setMySessionId] = useState<string>("방 제목을 입력하세요.");
  const [myUserName, setMyUserName] = useState<string>("");
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

  const joinSession = async (event: FormEvent) => {
    event.preventDefault();
    if (mySessionId && myUserName) {
      console.log("Joining session with ID:", mySessionId);
      try {
        const token = await getToken();
        console.log("Token received:", token);
        console.log("myusername", myUserName);
        sessionStorage.setItem("sessionId", mySessionId);
        sessionStorage.setItem("userName", myUserName);
        sessionStorage.setItem("token", token);
        connectSocket(myUserName);

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

      return () => {
        socket.off('welcome');
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
    <div style={styles.container}>
      <div style={styles.card}>
        <Image src={logo} alt="MIKO Logo" width={100} height={100} style={styles.logo}/>
        <h1 style={styles.title}>Welcome to MIKO</h1>
        <div id="join">
          <div id="join-dialog">
            {session ? (
              <div>
                <p style={styles.info}><span style={styles.bold}>{session.user?.name}</span>님 반갑습니다!</p>
              </div>
            ) : (
              <p style={styles.info}>Not logged in</p>
            )}
            <form onSubmit={joinSession} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>이름</label>
                <input
                  type="text"
                  id="userName"
                  value={myUserName}
                  onChange={handleChangeUserName}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>방 제목</label>
                <input
                  type="text"
                  id="sessionId"
                  placeholder={mySessionId}
                  onChange={handleChangeSessionId}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <input name="commit" type="submit" value="Join" style={styles.button} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#d3bff2', // 배경색 설정
    margin: '0', // margin reset
    fontFamily: 'Arial, sans-serif', // 폰트 설정
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px', // 더 둥근 모서리
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)', // 그림자 수정
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px', // 최대 너비 설정
  },
  title: {
    fontSize: '28px', // 더 큰 폰트 크기
    marginBottom: '20px',
    color: '#333', // 더 진한 글자 색
  },
  heading: {
    fontSize: '22px',
    color: '#555',
    marginBottom: '20px',
  },
  info: {
    fontSize: '16px',
    color: '#777',
    marginBottom: '10px',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formGroup: {
    width: '100%',
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '10px 15px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#357ae8',
  }
};

export default WaitingPage;
