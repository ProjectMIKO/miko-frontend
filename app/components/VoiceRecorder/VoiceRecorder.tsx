"use client";

import { useState, useEffect, useRef } from "react";
import useMicrophone from "../../hooks/useMicrophone";
import SettingsSlider from "./SettingSlider";
import styles from "./VoiceRecorder.module.css";
import { useSocket } from "../Socket/SocketContext";

interface VoiceRecorderProps {
  sessionId?: string | null;
  subscriber: any | null;
  publisher: any | null;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ sessionId, subscriber, publisher }) => {
  const [recordingMode, setRecordingMode] = useState<boolean>(false);
  const [silenceThreshold, setSilenceThreshold] = useState<number>(0.1);
  const [silenceDuration, setSilenceDuration] = useState<number>(3000);
  const { error, startRecording, stopRecording, mediaRecorderRef, audioChunksRef } = useMicrophone(
    silenceThreshold,
    silenceDuration,
    recordingMode
  );

  const { socket } = useSocket();
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 녹음 타임아웃
  const [maxRecordingDuration, setMaxRecordingDuration] = useState<number>(20000); // 최대 녹음 시간 (밀리초 단위)

  useEffect(() => {
    if (!publisher) {
      console.error("Publisher is not ready yet");
      return;
    }
    if (publisher) {
      publisher.publishAudio(recordingMode);
    }
  }, [recordingMode]);

  useEffect(() => {
    if (recordingMode) {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      recordingTimeoutRef.current = setTimeout(() => {
        console.log("Max recording duration reached, stopping recording...");
        stopRecording(true);
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          sendAudioToServer(blob);
          audioChunksRef.current = [];
        }
      }, maxRecordingDuration);
    }
  }, [recordingMode]);

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
  };

  return (
    <div className={styles.container}>
      {error ? (
        <p>{error}</p>
      ) : (
        <div className={styles.controls}>
          <SettingsSlider
            label="음성 인식 감도:"
            min={0.01}
            max={1}
            step={0.01}
            value={silenceThreshold}
            onChange={handleSliderChange}
          />
          <SettingsSlider
            label="침묵 인식 시간 (초):"
            min={0}
            max={5}
            step={0.5}
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
          <button onClick={toggleRecordingMode}>
            {recordingMode ? "음성인식 켜져있음" : "음성인식 꺼져있음"}
          </button>
          {recordingMode && <span>음성 인식 중...</span>}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
