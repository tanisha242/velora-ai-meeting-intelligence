'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';

interface AudioPlayerProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  audioUrl?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTime,
  duration,
  onSeek,
  onTimeUpdate,
  isPlaying,
  setIsPlaying,
  audioUrl = '/sample-meeting.wav'
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync playback rate to audio element
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Sync external seek command into HTML5 audio currentTime
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Sync play/pause external trigger
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback error or autoplay prevented:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    onSeek(val);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration || 600, currentTime + seconds));
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    onSeek(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const audioSrc = audioUrl || '/sample-meeting.wav';

  return (
    <div className="bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] rounded-2xl p-4 md:p-5 shadow-xs">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      <div className="flex flex-col gap-3">
        {/* Scrubber Range Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#6F4B3E] dark:text-[#C59A83] w-12 text-right font-semibold">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 group">
            <input
              type="range"
              min={0}
              max={duration || 600}
              step={0.1}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-2 bg-[#F1EEE7] dark:bg-[#2A2722] rounded-lg appearance-none cursor-pointer accent-[#6F4B3E] dark:accent-[#C59A83] focus:outline-none"
            />
          </div>
          <span className="text-xs font-mono text-[#969087] w-12 font-medium">
            {formatTime(duration || 600)}
          </span>
        </div>

        {/* Playback Control Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSkip(-15)}
              className="p-2 rounded-xl text-[#6F6A62] dark:text-[#B7B0A5] hover:text-[#171717] dark:hover:text-[#F4F0E8] hover:bg-[#F1EEE7] dark:hover:bg-[#2A2722] transition-colors"
              title="Skip backward 15 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-[#6F4B3E] hover:bg-[#5A3C31] text-white flex items-center justify-center shadow-xs transition-all transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play Audio'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => handleSkip(15)}
              className="p-2 rounded-xl text-[#6F6A62] dark:text-[#B7B0A5] hover:text-[#171717] dark:hover:text-[#F4F0E8] hover:bg-[#F1EEE7] dark:hover:bg-[#2A2722] transition-colors"
              title="Skip forward 15 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 ml-2 text-xs text-[#6F4B3E] dark:text-[#C59A83] bg-[#6F4B3E]/10 dark:bg-[#C59A83]/15 px-2.5 py-1 rounded-lg border border-[#6F4B3E]/20 dark:border-[#C59A83]/20 font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#6F4B3E] dark:text-[#C59A83]" />
              <span>Interactive Sync</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Speed Selector */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#6F6A62] dark:text-[#B7B0A5] hidden sm:inline font-medium">Speed:</span>
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="bg-[#F7F5F0] dark:bg-[#171614] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#6F4B3E]"
              >
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2.0x</option>
              </select>
            </div>

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-[#6F6A62] dark:text-[#B7B0A5] hover:text-[#171717] dark:hover:text-[#F4F0E8] transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#A65A54]" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 bg-[#F1EEE7] dark:bg-[#2A2722] rounded-lg appearance-none cursor-pointer accent-[#6F4B3E] dark:accent-[#C59A83]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
