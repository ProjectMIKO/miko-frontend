import React from "react";

interface ConversationProps {
  messages: string[];
}

const Conversation: React.FC<ConversationProps> = ({ messages }) => {
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
        maxHeight: "650px",
        overflowY: "auto",
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

export default Conversation;
