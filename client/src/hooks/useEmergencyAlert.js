import { useEffect, useRef } from 'react';
import useSocketEvent from './useSocket';

// Professional, distinct alert sound
const ALERT_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const useEmergencyAlert = () => {
  const audioRef = useRef(new Audio(ALERT_SOUND_URL));

  // The backend emits 'emergency:new' when a crisis is reported
  useSocketEvent('emergency:new', (emergency) => {
    console.log('📢 Emergency Alert triggering for:', emergency.title);
    
    // Play alert sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(err => {
        console.warn('Audio playback was blocked by the browser. Interaction required.');
      });
    }
  });

  return null;
};

export default useEmergencyAlert;
