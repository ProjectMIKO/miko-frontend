import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSocket } from "./Socket/SocketContext";

interface SocketContextProps {
  sessionId: string | null;
  userName: string | null;
  token: string | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasEnteredRoom, setHasEnteredRoom] = useState(false);
  const { socket, isConnected, connectSocket } = useSocket();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const storedSessionId = query.get("sessionId");
    const storedUserName = query.get("userName");
    const storedToken = query.get("token");

    if (storedUserName) {
      connectSocket(storedUserName);
    }

    if (isConnected) {
      console.log("Socket is connected!");

      if (!hasEnteredRoom && sessionId) {
        socket.emit("enter_room", sessionId);

        socket.on("entered_room", () => {
          console.log("Entered room:", storedSessionId);
          setHasEnteredRoom(true); // Update the state to prevent re-entering the room
        });
      }
    } else {
      console.log("Socket is not connected.");
    }

    if (storedSessionId && storedUserName && storedToken) {
      setSessionId(storedSessionId);
      setUserName(storedUserName);
      setToken(storedToken);
    } else {
      // 세션 정보가 없으면 대기 페이지로 이동
      window.location.href = "/waiting";
    }

    socket.on("welcome", (nickname, memberCount) => {
      console.log(
        `Welcome ${nickname}, there are ${memberCount} members in the room`
      );
    });

    return () => {
      socket.off("welcome");
      socket.off("entered_room");
    };
  }, [socket, isConnected, hasEnteredRoom, sessionId]);

  return (
    <SocketContext.Provider value={{ sessionId, userName, token, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);