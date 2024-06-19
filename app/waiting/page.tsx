// app/page.tsx

import React from "react";
import Link from "next/link";

const HomePage: React.FC = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to MIKO</h1>
      <p>MIKO</p>
      <Link href="/main" legacyBehavior>
        <a
          style={{
            display: "inline-block",
            padding: "10px 20px",
            margin: "20px 0",
            backgroundColor: "#007BFF",
            color: "#FFF",
            borderRadius: "4px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Go to Main Page
        </a>
      </Link>
    </div>
  );
};

export default HomePage;
