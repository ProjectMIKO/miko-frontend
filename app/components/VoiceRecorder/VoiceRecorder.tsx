"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./VoiceRecorder.module.css";
import { useSocket } from "../Socket/SocketContext";

interface VoiceRecorderProps {
  sessionId?: string | null;
  subscriber: any | null;
  publisher: any | null;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ sessionId, subscriber, publisher }) => {
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [audioURLs, setAudioURLs] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [recordingMode, setRecordingMode] = useState<boolean>(false); // 녹음 모드 상태
  const [silenceThreshold, setSilenceThreshold] = useState<number>(0.1); // 초기 임계값
  const [silenceDuration, setSilenceDuration] = useState<number>(3000); // 초기 침묵 시간
  const [maxRecordingDuration, setMaxRecordingDuration] =
    useState<number>(20000); // 최대 녹음 시간 (밀리초 단위)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 녹음 타임아웃

  const { socket } = useSocket();

  useEffect(() => {
    async function init() {
      try {
        console.log("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        console.log("Microphone access granted:", stream);

        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        try {
          console.log("Loading AudioWorklet module...");
          await audioContext.audioWorklet.addModule(
            new URL("./worklet-processor.js", import.meta.url).toString()
          );
          console.log("AudioWorklet module loaded successfully.");
        } catch (err) {
          console.error("Error loading AudioWorklet module:", err);
          setError("Error loading AudioWorklet module");
          return;
        }

        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        createWorkletNode(audioContext, silenceThreshold, silenceDuration);

        mediaStreamSource.connect(workletNodeRef.current!);
        workletNodeRef.current!.connect(audioContext.destination);

        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log("Data available:", event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });
            sendAudioToServer(blob);
            const url = URL.createObjectURL(blob);
            setAudioURLs((prev) => [...prev, url]);
            audioChunksRef.current = [];
            console.log("Recording saved:", url);
          }
        };
      } catch (err: any) {
        console.error("Error accessing audio stream:", err);
        handleError(err);
      }
    }

    function handleError(err: any) {
      switch (err.name) {
        case "NotAllowedError":
          setError(
            "마이크 접근이 거부되었습니다. 설정에서 마이크 접근을 허용해주세요."
          );
          break;
        case "NotFoundError":
          setError(
            "마이크가 감지되지 않았습니다. 마이크가 연결되어 있는지 확인해주세요."
          );
          break;
        case "NotReadableError":
          setError(
            "마이크를 사용할 수 없습니다. 다른 프로그램에서 사용 중인지 확인해주세요."
          );
          break;
        case "OverconstrainedError":
          setError(
            "요구된 오디오 제약 조건을 만족시키는 장치를 찾을 수 없습니다."
          );
          break;
        case "SecurityError":
          setError("보안 오류로 인해 마이크 접근이 차단되었습니다.");
          break;
        case "AbortError":
          setError("마이크 요청이 중단되었습니다. 다시 시도해주세요.");
          break;
        default:
          setError(`알 수 없는 오류가 발생했습니다: ${err.message}`);
          break;
      }
    }

    init();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ threshold: silenceThreshold });
      // console.log(`Sent threshold to worklet: ${silenceThreshold}`);
    }
  }, [silenceThreshold]);

  useEffect(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ duration: silenceDuration });
      // console.log(`Sent duration to worklet: ${silenceDuration}`);
    }
  }, [silenceDuration]);

  useEffect(() => {
    if (workletNodeRef.current) {
      if (recordingMode) {
        workletNodeRef.current.port.onmessage = (event) => {
          if (event.data.isSilent) {
            stopRecording(true);
          } else {
            startRecording();
          }
        };
      } else {
        workletNodeRef.current.port.onmessage = null;
      }
    }
  }, [recordingMode]);

  useEffect(() => {
    if (!publisher) {
        console.error("Publisher is not ready yet");
        return;
      }
      if (publisher) {
        publisher.publishAudio(recordingMode);
      }
  }, [recordingMode]);

  const createWorkletNode = (
    audioContext: AudioContext,
    threshold: number,
    duration: number
  ) => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
    }

    const workletNode = new AudioWorkletNode(
      audioContext,
      "silence-detector-processor",
      {
        processorOptions: { threshold, duration },
      }
    );

    workletNode.port.onmessage = (event) => {
      if (recordingMode) {
        if (event.data.isSilent) {
          stopRecording(true);
        } else {
          startRecording();
        }
      }
    };

    workletNodeRef.current = workletNode;
  };

  const startRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "recording"
    ) {
      mediaRecorderRef.current.start();
      setRecording(true);
      console.log("Recording started");

      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      recordingTimeoutRef.current = setTimeout(() => {
        console.log("Max recording duration reached, stopping recording...");
        stopRecording(true);
      }, maxRecordingDuration);
    }
  };

  const stopRecording = (save: boolean = false) => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      console.log("Recording stopped");

      if (save && audioChunksRef.current.length > 0) {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioURLs((prev) => [...prev, url]);
        audioChunksRef.current = [];
        console.log("Recording saved");
      } else {
        audioChunksRef.current = []; // Save false 시, 버퍼 비우기
      }
    }
  };

  const sendAudioToServer = (blob: Blob) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        console.log(arrayBuffer);
        socket.emit("stt", [sessionId, arrayBuffer]);
        console.log("sending audioData");
      } else {
        console.error("Failed to read the blob");
      }
    };
    reader.readAsArrayBuffer(blob);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSilenceThreshold(parseFloat(event.target.value));
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSilenceDuration(parseInt(event.target.value));
  };

  const toggleRecordingMode = () => {
    if (!publisher) {
      console.error("Publisher is not ready yet");
      return;
    }
    setRecordingMode((prev) => !prev);
    if (recordingMode === false) {
      publisher.publishAudio(false); 
    } else {
      publisher.publishAudio(true); 
    }
  };

  return (
    <div className={styles.container}>
      {error ? (
        <p>{error}</p>
      ) : (
        <div className={styles.controls}>
          <label>
            음성 인식 감도:
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={silenceThreshold}
              onChange={handleSliderChange}
            />
            {silenceThreshold}
          </label>
          <label>
            침묵 인식 시간 (초):
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={silenceDuration / 1000}
              onChange={(e) =>
                handleDurationChange({
                  ...e,
                  target: {
                    ...e.target,
                    value: (parseFloat(e.target.value) * 1000).toString(),
                  },
                })
              }
            />
            {silenceDuration / 1000}
          </label>
          <button onClick={toggleRecordingMode}>
            {recordingMode ? "음성인식 켜져있음" : "음성인식 꺼져있음"}
          </button>
          {recordingMode && recording && <span>음성 인식 중...</span>}          
          {/* {audioURLs.map((url, index) => (
            <audio key={index} src={url} controls />
          ))} */}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
