import React, { useEffect, useRef } from 'react';

interface VideoComponentProps {
  selectedVideoDeviceId: string | null;
  selectedAudioDeviceId: string | null;
}

const VideoComponent: React.FC<VideoComponentProps> = ({ selectedVideoDeviceId, selectedAudioDeviceId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCameraStream = async (videoDeviceId: string | null, audioDeviceId: string | null) => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      if (videoDeviceId === 'off' && audioDeviceId === 'off') {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoDeviceId && videoDeviceId !== 'off' ? { deviceId: { exact: videoDeviceId } } : false,
          audio: audioDeviceId && audioDeviceId !== 'off' ? { deviceId: { exact: audioDeviceId } } : false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices: ", err);
      }
    };

    getCameraStream(selectedVideoDeviceId, selectedAudioDeviceId);
  }, [selectedVideoDeviceId, selectedAudioDeviceId]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <video ref={videoRef} width="640" height="480" autoPlay style={{ border: '1px solid black' }}></video>
    </div>
  );
};

export default VideoComponent;
