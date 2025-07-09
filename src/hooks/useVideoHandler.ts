import { useCallback, useRef, useEffect } from "react";
import { Platform } from "react-native";
import { useVideoPlayer } from "expo-video";
import { usePlaybackState } from "./usePlaybackState";

interface UseVideoHandlerProps {
  videoId: string;
  url: string;
  hlsUrl: string;
}

export function useVideoHandler({
  videoId,
  url,
  hlsUrl,
}: UseVideoHandlerProps) {
  const {
    playbackState,
    updatePlaybackState,
    savePlaybackPosition,
    getSavedPosition,
  } = usePlaybackState(videoId);
  const seekTimeout = useRef<NodeJS.Timeout | null>(null);
  const wasPlayingBeforeSeek = useRef<boolean>(false);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Validate video URLs on initialization
  useEffect(() => {
    if (!url && !hlsUrl) {
      updatePlaybackState({
        error: "No valid video URL provided",
        isLoading: false,
      });
      return;
    }

    if (!url || !hlsUrl) {
      console.warn("Missing either URL or HLS URL for video:", videoId);
    }
  }, [url, hlsUrl, videoId, updatePlaybackState]);

  // Create video player instance with proper error handling
  const videoSource = Platform.isTV ? hlsUrl : url;
  const player = useVideoPlayer(videoSource, (player) => {
    try {
      // Player configuration
      player.loop = false;
      player.allowsExternalPlayback = true;
      player.muted = false;
    } catch (error) {
      console.error("Error configuring player:", error);
      updatePlaybackState({
        error: "Failed to configure video player",
        isLoading: false,
      });
    }
  });

  // Set up loading timeout after player is created
  useEffect(() => {
    // Set a timeout for loading
    loadingTimeout.current = setTimeout(() => {
      if (player.status === "loading") {
        console.warn("Video loading timeout");
        updatePlaybackState({
          error: "Video took too long to load. Please try again.",
          isLoading: false,
        });
      }
    }, 30000) as any; // 30 second timeout

    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [player.status, updatePlaybackState]);

  const handlePlayPause = useCallback(() => {
    try {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
      updatePlaybackState({
        isPlaying: !player.playing,
      });
    } catch (error) {
      console.error("Error in play/pause:", error);
      updatePlaybackState({
        error: "Failed to control video playback",
      });
    }
  }, [player, updatePlaybackState]);

  const handleSeek = useCallback(
    (position: number) => {
      try {
        // Debounce seeking to prevent excessive operations
        if (seekTimeout.current) {
          clearTimeout(seekTimeout.current);
        }

        // Pause if playing
        if (player.playing) {
          player.pause();
          updatePlaybackState({
            isPlaying: false,
          });
        }

        updatePlaybackState({
          currentTime: position,
        });

        seekTimeout.current = setTimeout(() => {
          try {
            player.currentTime = position;
            savePlaybackPosition(position);
          } catch (error) {
            console.error("Error seeking to position:", error);
            updatePlaybackState({
              error: "Failed to seek to position",
            });
          }
        }, 300) as any;
      } catch (error) {
        console.error("Error in handleSeek:", error);
        updatePlaybackState({
          error: "Failed to seek in video",
        });
      }
    },
    [player, updatePlaybackState, savePlaybackPosition]
  );

  const handleSeekWithPause = useCallback(
    (position: number) => {
      // Store current playing state
      wasPlayingBeforeSeek.current = player.playing;

      // Pause if playing
      if (player.playing) {
        player.pause();
        updatePlaybackState({
          isPlaying: false,
        });
      }

      // Clear any existing seek timeout
      if (seekTimeout.current) {
        clearTimeout(seekTimeout.current);
      }

      // Update UI immediately for responsive feedback
      updatePlaybackState({
        currentTime: position,
      });

      // Debounce the actual seek operation
      seekTimeout.current = setTimeout(() => {
        player.currentTime = position;
        savePlaybackPosition(position);

        // Resume playback if it was playing before seeking
        if (wasPlayingBeforeSeek.current) {
          setTimeout(() => {
            player.play();
            updatePlaybackState({
              isPlaying: true,
            });
          }, 300); // Small delay to ensure seek is complete
        }
      }, 100) as any;
    },
    [player, updatePlaybackState, savePlaybackPosition]
  );

  const handleSeekForward = useCallback(() => {
    const newPosition = Math.min(
      playbackState.currentTime + 10,
      playbackState.duration
    );
    handleSeekWithPause(newPosition);
  }, [playbackState.currentTime, playbackState.duration, handleSeekWithPause]);

  const handleSeekBackward = useCallback(() => {
    const newPosition = Math.max(playbackState.currentTime - 10, 0);
    handleSeekWithPause(newPosition);
  }, [playbackState.currentTime, handleSeekWithPause]);

  const handleRetry = useCallback(() => {
    updatePlaybackState({
      isLoading: true,
      error: undefined,
      currentTime: 0,
      isPlaying: false,
    });

    // Clear any pending seek operations
    if (seekTimeout.current) {
      clearTimeout(seekTimeout.current);
    }

    try {
      // Try alternative URL source on retry (switch between URL and HLS)
      const isCurrentlyHLS = videoSource === hlsUrl;
      const fallbackSource = isCurrentlyHLS ? url : hlsUrl;

      // Reload the player with fallback URL
      player.replace(fallbackSource);
    } catch (error) {
      console.error("Error during retry:", error);
      updatePlaybackState({
        isLoading: false,
        error: "Failed to retry video playback",
      });
    }
  }, [player, updatePlaybackState, hlsUrl, url, videoSource]);

  // Listen to player status changes
  useEffect(() => {
    const subscription = player.addListener("statusChange", (status) => {
      // Handle different status states
      switch (status.status) {
        case "idle":
          updatePlaybackState({
            isPlaying: false,
            isLoading: false,
            error: undefined,
          });
          break;

        case "loading":
          // Only show loading if we're actually loading a new video
          const isActuallyLoading = player.currentTime === 0 || !player.playing;
          updatePlaybackState({
            isLoading: isActuallyLoading,
            error: undefined,
          });
          break;

        case "readyToPlay":
          // Clear loading timeout when video is ready
          if (loadingTimeout.current) {
            clearTimeout(loadingTimeout.current);
          }
          updatePlaybackState({
            isLoading: false,
            duration: player.duration || 0,
            error: undefined,
          });
          break;

        case "error":
          const errorMessage =
            typeof status.error === "string"
              ? status.error
              : status.error?.message || "Video playback error occurred";
          console.error("Video playback error:", errorMessage);
          updatePlaybackState({
            isLoading: false,
            isPlaying: false,
            error: errorMessage,
          });
          break;

        default:
          // Update basic playback state for other statuses
          updatePlaybackState({
            isPlaying: player.playing,
            duration: player.duration || 0,
            currentTime: player.currentTime || 0,
          });
      }
    });

    return () => subscription.remove();
  }, [player, updatePlaybackState]);

  // Set up periodic progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (player.playing) {
        const currentTime = player.currentTime || 0;
        updatePlaybackState({
          currentTime,
        });

        // Save progress every 10 seconds
        if (Math.floor(currentTime) % 10 === 0) {
          savePlaybackPosition(currentTime);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, updatePlaybackState, savePlaybackPosition]);

  // Load saved position when player is ready
  useEffect(() => {
    if (player.status === "readyToPlay") {
      try {
        const savedPosition = getSavedPosition();
        if (savedPosition > 0) {
          // Use setTimeout to ensure the player is fully ready
          setTimeout(() => {
            try {
              player.currentTime = savedPosition;
            } catch (error) {
              console.warn("Failed to set saved position:", error);
            }
          }, 200);
        }
        updatePlaybackState({
          isLoading: false,
        });
      } catch (error) {
        console.error("Error loading saved position:", error);
        updatePlaybackState({
          isLoading: false,
        });
      }
    }
  }, [player.status, getSavedPosition, updatePlaybackState, player]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (seekTimeout.current) {
        clearTimeout(seekTimeout.current);
      }
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  return {
    player,
    playbackState,
    updatePlaybackState,
    handlePlayPause,
    handleSeek,
    handleSeekForward,
    handleSeekBackward,
    handleRetry,
  };
}
