import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { OpenVidu } from 'openvidu-browser';
import styles from './App.module.css'; // CSS 모듈을 사용하는 경우
import UserVideoComponent from './UserVideoComponent';

const APPLICATION_SERVER_URL = process.env.NEXT_PUBLIC_OPENVIDU_URL; // 서버 URL 확인

const App: React.FC = () => {
    const [mySessionId, setMySessionId] = useState<string>('SessionE');
    const [myUserName, setMyUserName] = useState<string>('OpenVidu_User_' + Math.floor(Math.random() * 100));
    const [token, setToken] = useState<string | undefined>(undefined);
    const [session, setSession] = useState<any>(undefined);
    const [subscriber, setSubscriber] = useState<any>(undefined);
    const [publisher, setPublisher] = useState<any>(undefined);
    const [subscribers, setSubscribers] = useState<any[]>([]);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

    const handlerJoinSessionEvent = () => {
        console.log('Join session');
    };

    const handlerLeaveSessionEvent = () => {
        console.log('Leave session');
        setSession(undefined);
        session.disconnect();
        session.unsubscribe(subscriber);
        setSubscribers([]);
        // if (publisher) {
        //     publisher.stream.getMediaStream().getTracks().forEach((track: any) => track.stop());
        //     setPublisher(undefined);
        // }
    };

    const handlerErrorEvent = (error: any) => {
        console.log('Error in session', error);
    };

    const handleChangeSessionId = (e: ChangeEvent<HTMLInputElement>) => {
        setMySessionId(e.target.value);
    };

    const handleChangeUserName = (e: ChangeEvent<HTMLInputElement>) => {
        setMyUserName(e.target.value);
    };

    const joinSession = async (event: FormEvent) => {
        event.preventDefault();
        if (mySessionId && myUserName) {
            console.log('Joining session with ID:', mySessionId);
            const token = await getToken();
            console.log('Token received:', token);
            setToken(token);
            initializeSession(token);
        }
    };

    const initializeSession = async (token: string) => {
        const openvidu = new OpenVidu();
        const mySession = openvidu.initSession();

        mySession.on('streamCreated', (event: any) => {
            const subscriber = mySession.subscribe(event.stream, undefined);
            setSubscriber(subscriber);
            setSubscribers(prevSubscribers => [...prevSubscribers, subscriber]); 
        });

        mySession.on('streamDestroyed', (event: any) => {
            setSubscribers(prevSubscribers => prevSubscribers.filter(sub => sub !== event.stream.streamManager));
        });

        mySession.on('exception', (exception: any) => {
            console.warn(exception);
        });

        setSession(mySession);

        try {
            await mySession.connect(token, { clientData: myUserName });

            const publisher = openvidu.initPublisher(undefined, {
                audioSource: undefined,
                videoSource: undefined,
                publishAudio: true,
                publishVideo: true,
                resolution: '640x480',
                frameRate: 30,
                insertMode: 'APPEND',
                mirror: false
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
        subscribers.forEach((subscriber) => {
            if (remoteVideoRefs.current[subscriber.stream.streamId] && subscriber.stream.stream) {
                subscriber.addVideoElement(remoteVideoRefs.current[subscriber.stream.streamId]);
            }
        });
    }, [subscribers]);

    const getToken = async () => {
        try {
            const sessionId = await createSession(mySessionId);
            const token = await createToken(sessionId);
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
        }
    };

    const createSession = async (sessionId: string) => {
        try {
            const response = await axios.post(`${APPLICATION_SERVER_URL}api/sessions`, { customSessionId: sessionId }, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Session created with ID:', response.data);
            return response.data; // 세션 ID
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    };

    const createToken = async (sessionId: string) => {
        try {
            const response = await axios.post(`${APPLICATION_SERVER_URL}api/sessions/${sessionId}/connections`, {}, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Token created:', response.data);
            return response.data; // 토큰
        } catch (error) {
            console.error('Error creating token:', error);
            throw error;
        }
    };

    return (
        <div>
            {session === undefined ? (
                <div id="join">
                    <div id="join-dialog">
                        <h1>비디오 세션에 참가하기</h1>
                        <form onSubmit={joinSession}>
                            <p>
                                <label>참가자: </label>
                                <input
                                    type="text"
                                    id="userName"
                                    value={myUserName}
                                    onChange={handleChangeUserName}
                                    required
                                />
                            </p>
                            <p>
                                <label>세션: </label>
                                <input
                                    type="text"
                                    id="sessionId"
                                    value={mySessionId}
                                    onChange={handleChangeSessionId}
                                    required
                                />
                            </p>
                            <p>
                                <input name="commit" type="submit" value="참가" />
                            </p>
                        </form>
                    </div>
                </div>
            ) : (
                <div id={styles.session}>
                    <div id={styles['video-container']}>
                        <div id={styles['local-video']}>
                            <video ref={localVideoRef} autoPlay={true} />
                        </div>
                        <div id={styles['remote-videos']}>
                            {subscribers.map((sub) => (
                                <UserVideoComponent
                                    key={sub.stream.streamId}
                                    streamManager={sub}
                                />
                            ))}
                        </div>
                    </div>
                    <button className={styles['leave-button']} onClick={handlerLeaveSessionEvent}>Leave session</button>
                </div>
            )}
        </div>
    );
};

export default App;
