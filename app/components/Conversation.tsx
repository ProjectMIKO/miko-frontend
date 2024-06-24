// app/components/Conversation.tsx
import React from "react";

interface ConversationProps {
  messages: string[];
}

const Conversation: React.FC<ConversationProps> = ({ messages }) => {
  return (
    <ul style={{ listStyleType: "none", padding: 0, width: "100%" }}>
      {messages.map((message, index) => (
        <li
          key={index}
          style={{ padding: "8px", borderBottom: "1px solid #CCC" }}
        >
          {message}
        </li>
      ))}
    </ul>
  );
};

export default Conversation;
