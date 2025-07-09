import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/src/components/ThemedText';
import { useScale } from '@/src/hooks/useScale';
import { Colors } from '@/src/constants/Colors';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (position: number) => void;
  isFocused?: boolean;
}

export function ProgressBar({ currentTime, duration, onSeek, isFocused = false }: ProgressBarProps) {
  const scale = useScale();
  const styles = useProgressBarStyles();

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event: any) => {
    if (duration > 0) {
      const { locationX } = event.nativeEvent;
      const barWidth = 400 * scale;
      const seekPosition = (locationX / barWidth) * duration;
      onSeek(Math.max(0, Math.min(duration, seekPosition)));
    }
  };

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <View style={styles.timeContainer}>
        <ThemedText style={styles.timeText}>
          {formatTime(currentTime)}
        </ThemedText>
        <ThemedText style={styles.timeText}>
          {formatTime(duration)}
        </ThemedText>
      </View>

      <Pressable
        style={styles.progressContainer}
        onPress={handleSeek}
      >
        <View style={[styles.progressTrack, isFocused && styles.focusedProgressTrack]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` },
              isFocused && styles.focusedProgressFill
            ]}
          />
          {isFocused && (
            <View
              style={[
                styles.progressThumb,
                { left: `${Math.max(0, progressPercentage)}%` }
              ]}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
}

const useProgressBarStyles = function () {
  const scale = useScale();

  return StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 0,
    },
    focusedContainer: {
      paddingVertical: 16 * scale,
      paddingHorizontal: 20 * scale,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12 * scale,
    },
    timeText: {
      color: Colors.white,
      fontWeight: '600',
      fontSize: 14 * scale,
    },
    progressContainer: {
      height: 24 * scale,
      justifyContent: 'center',
      paddingVertical: 10 * scale,
    },
    progressTrack: {
      height: 4 * scale,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderRadius: 2 * scale,
      position: 'relative',
    },
    focusedProgressTrack: {
      height: 6 * scale,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    progressFill: {
      height: '100%',
      backgroundColor: Colors.dark.primary,
      borderRadius: 2 * scale,
    },
    focusedProgressFill: {
      backgroundColor: Colors.white,
    },
    progressThumb: {
      position: 'absolute',
      width: 16 * scale,
      height: 16 * scale,
      backgroundColor: Colors.white,
      borderRadius: 8 * scale,
      top: -6 * scale,
      marginLeft: -8 * scale,
      borderWidth: 2,
      borderColor: Colors.dark.primary,
    },
    instructionContainer: {
      marginTop: 8 * scale,
      alignItems: 'center',
    },
    instructionText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12 * scale,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
};
