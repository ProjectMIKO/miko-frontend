"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const WaitingPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    // 세션이 없는 경우 로그인 페이지로 리디렉션
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Waiting Page</h1>
      <div style={styles.profile}>
        <Image
          src={session.user?.image || "/default-profile.png"}
          alt="Profile Picture"
          width={50}
          height={50}
        />
        <div style={styles.userInfo}>
          <p>Name: {session.user?.name}</p>
          <p>Email: {session.user?.email}</p>
        </div>
      </div>
      <button
        style={styles.mainPageButton}
        onClick={() => router.push("/main")}
      >
        회의 참가
      </button>
      <button style={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  userInfo: {
    marginLeft: "20px",
  },
  mainPageButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#FFF",
    marginBottom: "10px",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#FF0000",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#FFF",
  },
};

export default WaitingPage;
