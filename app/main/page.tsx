"use client";

import React, { useEffect, useRef, useState } from "react";
import NetworkGraph from "../components/NetworkGraph";
import App from "../components/App";
import styles from "../Home.module.css";
import { useSocket } from '../components/SocketContext';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const { socket, isConnected } = useSocket();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const maxRecordingDuration = 5000; // 5 seconds
  const silenceDuration = 2000; // 2 seconds of silence to stop recording

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("sessionId");
    const storedUserName = sessionStorage.getItem("userName");
    const storedToken = sessionStorage.getItem("token");

    if (isConnected) {
      console.log('Socket is connected!');
      init();
    } else {
      console.log('Socket is not connected.');
    }

    if (storedSessionId && storedUserName && storedToken) {
      setSessionId(storedSessionId);
      setUserName(storedUserName);
      setToken(storedToken);
    } else {
      // 세션 정보가 없으면 대기 페이지로 이동
      window.location.href = "/waiting";
    }

    // 예시: 서버에서 메시지 수신
    socket.on('message', (message: string) => {
      console.log('Received message from server:', message);
    });

    return () => {
      socket.off('message');
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [socket, isConnected]);

  const setupAudioContext = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(2048, 1, 1);

    mediaStreamSource.connect(processor);
    processor.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    mediaStreamSourceRef.current = mediaStreamSource;
    processorRef.current = processor;
  };

  const startMonitoring = (stream: MediaStream) => {
    if (!processorRef.current) return;

    processorRef.current.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const isSilent = !input.some(sample => Math.abs(sample) > 0.1); // 임계값 조정 가능

      if (isSilent && isRecordingRef.current) {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, silenceDuration);
      } else if (!isSilent && !isRecordingRef.current) {
        startRecording(stream);
      } else if (!isSilent && isRecordingRef.current) {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      }
    };
  };

  const startRecording = (stream: MediaStream) => {
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
      recordedChunksRef.current = [];
      sendAudioToServer(blob);
    };

    mediaRecorder.start();
    isRecordingRef.current = true;
    console.log('Recording started');

    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording();
    }, maxRecordingDuration);

    mediaRecorderRef.current = mediaRecorder;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;
      console.log('Recording stopped');
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    }
  };

  const sendAudioToServer = (blob: Blob) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const arrayBuffer = event.target?.result;
      if (arrayBuffer) {
        socket.emit('audioData', arrayBuffer);
        console.log("sending audioData");
      }
    };
    reader.readAsArrayBuffer(blob);
  };

  const init = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAudioContext(stream);
      startMonitoring(stream);
    } catch (err) {
      console.error('Error accessing audio stream: ', err);
    }
  };

  return (
    <div className={styles.container}>
      {isConnected ? (
        <div className={styles.appContainer}>
          {sessionId && userName && token ? (
            <App sessionId={sessionId} userName={userName} token={token} />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      ) : (
        <p>Socket is not connected. Please check your connection.</p>
      )}
      <div className={styles.networkGraphContainer}>
        <NetworkGraph />
      </div>
    </div>
  );
}
