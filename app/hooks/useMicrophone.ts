import { useState, useRef, useEffect } from "react";
import { handleMicrophoneError } from "../../utils/voiceErrorHandler";

const useMicrophone = (silenceThreshold: number, silenceDuration: number, recordingMode: boolean) => {
  const [error, setError] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

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

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
            const url = URL.createObjectURL(blob);
            audioChunksRef.current = [];
            console.log("Recording saved:", url);
          }
        };
      } catch (err: any) {
        console.error("Error accessing audio stream:", err);
        handleMicrophoneError(err, setError);
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

    const workletNode = new AudioWorkletNode(audioContext, "silence-detector-processor", {
      processorOptions: { threshold, duration },
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "recording") {
      mediaRecorderRef.current.start();
      console.log("Recording started");
    }
  };

  const stopRecording = (save: boolean = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      console.log("Recording stopped");
    }
  };

  return { error, startRecording, stopRecording, mediaRecorderRef, audioChunksRef };
};

export default useMicrophone;
