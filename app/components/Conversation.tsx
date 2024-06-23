import React, { useEffect, useState, useRef } from "react";
import { useSocket } from '../components/SocketContext';


const NodeList: React.FC = () => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState<string[]>([]);
    const handleNewMessage = useRef((message: string) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });

    useEffect(() => {
        const handleMessage = (message: string) => {
            console.log('Received message from server:', message);
            handleNewMessage.current(message);
          };
    
        socket.on('script', (message: string) => {
            console.log('Received message from server:', message);
            handleMessage(message);
        });

        return () => {
            socket.off('script', handleMessage);
        };
    }, [socket]);

    return (
        <div
            style={{
                width: "300px",
                margin: "5px",
                border: "1px solid #CCC",
                padding: "10px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                fontFamily: "Arial, sans-serif",
                backgroundColor: "#F9F9F9",
                maxHeight: "650px", // 최대 높이 설정
                overflowY: "auto", // 수직 스크롤 추가
            }}
        >
            <h3 style={{ textAlign: "center", color: "#333" }}>Conversation</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {messages.map((message, index) => (
                    <li
                        key={index}
                        style={{
                            cursor: "pointer",
                            padding: "10px",
                            border: "1px solid #CCC",
                            borderRadius: "4px",
                            marginBottom: "10px",
                            transition: "background-color 0.3s, color 0.3s, box-shadow 0.3s",
                        }}
                    >
                        {message}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NodeList;
