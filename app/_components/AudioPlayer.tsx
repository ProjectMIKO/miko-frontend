import React, { useEffect, useState, useRef } from "react";
import styles from "../styles/AudioPlayer.module.css";

interface AudioPlayerProps {
  meetingId: string;
  seekTime: number | null;
  onTimeUpdate: (currentTime: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  meetingId,
  seekTime,
  onTimeUpdate,
}) => {
  const [audioSrc, setAudioSrc] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await fetch(
          `https://miko-dev-a7d3f7eaf040.herokuapp.com/api/meeting/${meetingId}/record`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (error) {
        console.error("Error fetching audio: ", error);
      }
    };

    fetchAudio();
  }, [meetingId]);

  useEffect(() => {
    if (seekTime !== null && audioRef.current) {
      audioRef.current.currentTime = seekTime;
      audioRef.current.play();
    }
  }, [seekTime]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        onTimeUpdate(audioRef.current.currentTime);
      }
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [onTimeUpdate]);

  return (
    <>
      {audioSrc ? (
        <audio controls className={styles.audio} ref={audioRef}>
          <source src={audioSrc} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <div className={styles.loader}></div>
      )}
    </>
  );
};

export default AudioPlayer;
