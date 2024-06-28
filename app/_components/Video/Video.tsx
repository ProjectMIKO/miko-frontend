import React, { useState, useEffect, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useRouter } from "next/navigation";
import styles from "./Video.module.css";
import UserVideoComponent from "./UserVideoComponent";
import { useSocket } from "../Socket/SocketContext";
import VoiceRecorder from "../VoiceRecorder/VoiceRecorder";

interface Props {
  sessionId: string;
  userName: string;
  token: string;
}

const Video: React.FC<Props> = ({ sessionId, userName, token }) => {
  const [session, setSession] = useState<any>(undefined);
  const [subscriber, setSubscriber] = useState<any>(undefined);
  const [publisher, setPublisher] = useState<any>(undefined);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>(
    {}
  );

  const { socket } = useSocket();

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

  return (
    <div>
      {session === undefined ? (
        <div>Loading...</div>
      ) : (
        <div id={styles["video-recorder-container"]}>
          <div id={styles["video-container"]}>
            <div className={`${styles["video-box"]} ${styles["local-video"]}`}>
              <video ref={localVideoRef} autoPlay={true} />
              <div className={styles.nicknameContainer}>
                <span>나</span>
              </div>
            </div>
            <div id={styles["remote-videos"]}>
              {subscribers.map((sub) => (
                <div className={styles["video-box"]} key={sub.stream.streamId}>
                  <UserVideoComponent streamManager={sub} />
                </div>
              ))}
            </div>
          </div>
          <div id={styles["recorder-container"]}>
            <VoiceRecorder
              sessionId={sessionId}
              subscriber={subscriber}
              publisher={publisher}
            />
            <button
              className={styles["leave-button"]}
              onClick={handlerLeaveSessionEvent}
            >
              Leave session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;
