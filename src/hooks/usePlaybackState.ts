import { useState, useEffect, useRef, useCallback } from "react";
import { PlaybackState } from "@/src/types/video";

interface PlaybackPosition {
  videoId: string;
  position: number;
  timestamp: number;
}

export function usePlaybackState(videoId: string) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: true,
  });

  const playbackPositions = useRef<Map<string, PlaybackPosition>>(new Map());

  useEffect(() => {
    const savedPosition = playbackPositions.current.get(videoId);
    if (savedPosition) {
      const isRecent =
        Date.now() - savedPosition.timestamp < 24 * 60 * 60 * 1000;
      if (isRecent) {
        setPlaybackState((prev) => ({
          ...prev,
          currentTime: savedPosition.position,
        }));
      }
    }
  }, [videoId]);

  const updatePlaybackState = useCallback((updates: Partial<PlaybackState>) => {
    setPlaybackState((prev) => ({ ...prev, ...updates }));
  }, []);

  const savePlaybackPosition = useCallback(
    (position: number) => {
      if (position > 30) {
        playbackPositions.current.set(videoId, {
          videoId,
          position,
          timestamp: Date.now(),
        });
      }
    },
    [videoId]
  );

  const clearPlaybackPosition = useCallback(() => {
    playbackPositions.current.delete(videoId);
  }, [videoId]);

  const getSavedPosition = useCallback((): number => {
    const savedPosition = playbackPositions.current.get(videoId);
    if (savedPosition) {
      const isRecent =
        Date.now() - savedPosition.timestamp < 24 * 60 * 60 * 1000;
      return isRecent ? savedPosition.position : 0;
    }
    return 0;
  }, [videoId]);

  return {
    playbackState,
    updatePlaybackState,
    savePlaybackPosition,
    clearPlaybackPosition,
    getSavedPosition,
  };
}
