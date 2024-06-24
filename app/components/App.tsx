import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import styles from "./App.module.css";
import UserVideoComponent from "./UserVideoComponent";
import { useSocket } from "../components/SocketContext";

interface Props {
  sessionId: string;
  userName: string;
  token: string;
}

const App: React.FC<Props> = ({ sessionId, userName, token }) => {
  const [session, setSession] = useState<any>(undefined);
  const [subscriber, setSubscriber] = useState<any>(undefined);
  const [publisher, setPublisher] = useState<any>(undefined);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>(
    {}
  );

  const { socket, disconnectSocket } = useSocket();

  const handlerJoinSessionEvent = () => {
    console.log("Join session");
  };

  const handlerLeaveSessionEvent = () => {
    console.log("Leave session");
    session.disconnect();
    session.unsubscribe(subscriber);
    setSession(undefined);
    setSubscribers([]);
    socket.disconnect();
  };

  const handlerErrorEvent = (error: any) => {
    console.log("Error in session", error);
  };

  const initializeSession = async (token: string) => {
    const openvidu = new OpenVidu();
    const mySession = openvidu.initSession();

    mySession.on("streamCreated", (event: any) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      setSubscriber(subscriber);
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
        <div id={styles.session}>
          <div id={styles["video-container"]}>
            <div id={styles["local-video"]}>
              <video ref={localVideoRef} autoPlay={true} />
            </div>
            <div id={styles["remote-videos"]}>
              {subscribers.map((sub) => (
                <UserVideoComponent
                  key={sub.stream.streamId}
                  streamManager={sub}
                />
              ))}
            </div>
          </div>
          <button
            className={styles["leave-button"]}
            onClick={handlerLeaveSessionEvent}
          >
            Leave session
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
