"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export function SoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio("https://raw.githubusercontent.com/SillyTavern/SillyTavern-Content/main/assets/ambient/bedroom-cyberpunk.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Subtle background volume

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Browsers require interaction before playing audio
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio playback failed:", err);
      });
    }
  };

  return (
    <motion.button
      onClick={toggleSound}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-900/20 transition-all duration-300 group shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      title={isPlaying ? "Mute Ambient Audio" : "Play Ambient Audio"}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-cyan-400 group-hover:text-white" />
      ) : (
        <VolumeX className="w-5 h-5 text-white/50 group-hover:text-cyan-400" />
      )}
    </motion.button>
  );
}
