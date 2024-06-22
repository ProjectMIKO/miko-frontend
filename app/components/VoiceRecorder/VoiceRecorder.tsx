"use client";

import { useEffect, useState, useRef } from 'react';
import styles from './VoiceRecorder.module.css';
import { useSocket } from '../SocketContext';

const VoiceRecorder = () => {
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [audioURLs, setAudioURLs] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [recordingMode, setRecordingMode] = useState<boolean>(false);
  const [silenceThreshold, setSilenceThreshold] = useState<number>(0.1);
  const [silenceDuration, setSilenceDuration] = useState<number>(3000);
  const [maxRecordingDuration, setMaxRecordingDuration] = useState<number>(20000);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket } = useSocket();

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;

        try {
          await audioContext.audioWorklet.addModule(new URL('./worklet-processor.js', import.meta.url).toString());
        } catch (err) {
          console.error('Error loading AudioWorklet module:', err);
          setError('Error loading AudioWorklet module');
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
          }
        };

        mediaRecorderRef.current.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            convertToWav(blob).then((wavBlob) => {
              sendAudioToServer(wavBlob);
              const url = URL.createObjectURL(wavBlob);
              setAudioURLs(prev => [...prev, url]);
            });
            audioChunksRef.current = [];
          }
        };
      } catch (err: any) {
        handleError(err);
      }
    }

    function handleError(err: any) {
      switch (err.name) {
        case 'NotAllowedError':
          setError('마이크 접근이 거부되었습니다. 설정에서 마이크 접근을 허용해주세요.');
          break;
        case 'NotFoundError':
          setError('마이크가 감지되지 않았습니다. 마이크가 연결되어 있는지 확인해주세요.');
          break;
        case 'NotReadableError':
          setError('마이크를 사용할 수 없습니다. 다른 프로그램에서 사용 중인지 확인해주세요.');
          break;
        case 'OverconstrainedError':
          setError('요구된 오디오 제약 조건을 만족시키는 장치를 찾을 수 없습니다.');
          break;
        case 'SecurityError':
          setError('보안 오류로 인해 마이크 접근이 차단되었습니다.');
          break;
        case 'AbortError':
          setError('마이크 요청이 중단되었습니다. 다시 시도해주세요.');
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
    }
  }, [silenceThreshold]);

  useEffect(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ duration: silenceDuration });
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

  const createWorkletNode = (audioContext: AudioContext, threshold: number, duration: number) => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
    }

    const workletNode = new AudioWorkletNode(audioContext, 'silence-detector-processor', {
      processorOptions: { threshold, duration }
    });

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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
      mediaRecorderRef.current.start();
      setRecording(true);

      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording(true);
      }, maxRecordingDuration);
    }
  };

  const stopRecording = (save: boolean = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);

      if (save && audioChunksRef.current.length > 0) {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        convertToWav(blob).then((wavBlob) => {
          const url = URL.createObjectURL(wavBlob);
          setAudioURLs(prev => [...prev, url]);
        });
        audioChunksRef.current = [];
      } else {
        audioChunksRef.current = [];
      }
    }
  };

  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBuffer = encodeWAV(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const encodeWAV = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.getChannelData(0);
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sendAudioToServer = (blob: Blob) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const base64String = event.target?.result as string;
      if (base64String) {
        socket.emit('stt', { file: base64String });
      }
    };
    reader.readAsDataURL(blob);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSilenceThreshold(parseFloat(event.target.value));
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSilenceDuration(parseInt(event.target.value));
  };

  const toggleRecordingMode = () => {
    setRecordingMode(prev => !prev);
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
                    onChange={e => handleDurationChange({
                      ...e,
                      target: {
                        ...e.target,
                        value: (parseFloat(e.target.value) * 1000).toString()
                      }
                    })}
                />
                {silenceDuration / 1000}
              </label>
              <button onClick={toggleRecordingMode}>{recordingMode ? '음성인식 켜져있음' : '음성인식 꺼져있음'}</button>
              {recordingMode && recording && <p>음성 인식 중...</p>}
              {audioURLs.map((url, index) => (
                  <div key={index} className={styles.audioContainer}>
                    <audio src={url} controls />
                    <a href={url} download={`recording_${index + 1}.wav`}>
                      <button>Download</button>
                    </a>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

export default VoiceRecorder;
