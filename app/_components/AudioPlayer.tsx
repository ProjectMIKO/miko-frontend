import React, { useEffect, useState } from "react";
import styles from "../styles/AudioPlayer.module.css";

interface AudioPlayerProps {
  meetingId: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ meetingId }) => {
  const [audioSrc, setAudioSrc] = useState("");

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

  return (
    <>
      {audioSrc ? (
        <audio controls className={styles.audio}>
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
