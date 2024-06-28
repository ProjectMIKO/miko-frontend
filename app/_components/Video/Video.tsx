import React, { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useRouter } from "next/navigation";
import styles from "./Video.module.css";
import UserVideoComponent from "./UserVideoComponent";
import { useSocket } from "../Socket/SocketContext";
import { useVideoContext } from "../Video/VideoContext";

interface Props {
  sessionId: string;
  userName: string;
  token: string;
}

const Video: React.FC<Props> = ({ sessionId, userName, token }) => {
  const [session, setSession] = useState<any>(undefined);
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>(
    {}
  );

  const { socket } = useSocket();
  const { publisher, subscriber, setPublisher, setSubscriber } =
    useVideoContext();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const handlerJoinSessionEvent = () => {
    console.log("Join session");
  };

  const handlerLeaveSessionEvent = () => {
    console.log("Leave session");
    if (session) {
      session.disconnect();
      session.unsubscribe(subscriber);
      setSession(undefined);
      setSubscribers([]);
      socket.disconnect();
      router.push("/result");
    }
  };

  const handlerErrorEvent = (error: any) => {
    console.log("Error in session", error);
  };

  const initializeSession = async (token: string) => {
    const openvidu = new OpenVidu();
    const mySession = openvidu.initSession();

    mySession.on("streamCreated", (event: any) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]);
    });

    mySession.on("streamDestroyed", (event: any) => {
      setSubscribers((prevSubscribers) =>
        prevSubscribers.filter((sub) => sub !== event.stream.streamManager)
      );
    });

    mySession.on("exception", (exception: any) => {
      console.warn(exception);
    });

    setSession(mySession);

    try {
      await mySession.connect(token, { clientData: userName });

      const publisher = openvidu.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });

      mySession.publish(publisher);
      setPublisher(publisher);

      if (localVideoRef.current) {
        publisher.addVideoElement(localVideoRef.current);
      }

      handlerJoinSessionEvent();
    } catch (error) {
      handlerErrorEvent(error);
    }
  };

  useEffect(() => {
    if (token) {
      initializeSession(token);
    }
  }, [token]);

  useEffect(() => {
    subscribers.forEach((subscriber) => {
      if (
        remoteVideoRefs.current[subscriber.stream.streamId] &&
        subscriber.stream.stream
      ) {
        subscriber.addVideoElement(
          remoteVideoRefs.current[subscriber.stream.streamId]
        );
      }
    });
  }, [subscribers]);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(subscribers.length / 5)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const getVisibleSubscribers = () => {
    const start = currentPage * 5;
    return subscribers.slice(start, start + 5);
  };

  return (
    <div id={styles["video-container"]}>
      <div className={styles["navigation-buttons"]}>
        <button
          className={styles["nav-button"]}
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          &lt;
        </button>
        <button
          className={styles["nav-button"]}
          onClick={handleNextPage}
          disabled={currentPage >= Math.ceil(subscribers.length / 5) - 1}
        >
          &gt;
        </button>
      </div>
      <div id={styles["video-wrapper"]}>
        <div id={styles["local-video"]}>
          <video ref={localVideoRef} autoPlay={true} />
          <div className={styles.nicknameContainer}>
            <span>{userName}</span>
          </div>
        </div>
        {getVisibleSubscribers().map((sub) => (
          <div key={sub.stream.streamId} id={styles["remote-videos"]}>
            <UserVideoComponent streamManager={sub} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Video;