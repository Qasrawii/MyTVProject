import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable, Platform, BackHandler, TVEventHandler } from 'react-native';
import { VideoView } from 'expo-video';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { ProgressBar } from './ProgressBar';
import { VideoPlayerProps } from '@/src/types/video';
import { useScale } from '@/src/hooks/useScale';
import { useTextStyles } from '@/src/hooks/useTextStyles';
import { useVideoHandler } from '@/src/hooks/useVideoHandler';
import { Colors } from '@/src/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export function VideoPlayer({ video, onClose, onError }: VideoPlayerProps) {
    const scale = useScale();
    const textStyles = useTextStyles();
    const styles = useVideoPlayerStyles();

    const {
        player,
        playbackState,
        handlePlayPause,
        handleSeek,
        handleSeekForward,
        handleSeekBackward,
        handleRetry,
    } = useVideoHandler({
        videoId: video.id,
        url: video.url,
        hlsUrl: video.hlsUrl,
    });

    const [showControls, setShowControls] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [focusedControl, setFocusedControl] = useState<'back' | 'seekBackward' | 'playPause' | 'seekForward' | 'progress' | null>('playPause');
    const hideControlsTimeout = useRef<number | null>(null);

    const showControlsWithTimer = useCallback(() => {
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        hideControlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    }, []);

    const handleTVRemoteKey = useCallback((evt: any) => {
        const { eventType, eventKeyAction } = evt;

        if (eventKeyAction === 1) { // Key press (not release)
            switch (eventType) {
                case 'playPause':
                case 'select':
                    if (focusedControl === 'back') {
                        onClose();
                    } else if (focusedControl === 'playPause') {
                        handlePlayPause();
                    } else if (focusedControl === 'seekBackward') {
                        handleSeekBackward();
                    } else if (focusedControl === 'seekForward') {
                        handleSeekForward();
                    } else if (focusedControl === 'progress') {
                        // Progress bar is focused, don't auto-play/pause
                    }
                    showControlsWithTimer();
                    break;

                case 'left':
                    if (focusedControl === 'progress') {
                        // Handle seek backward in progress bar
                        const newTime = Math.max(0, playbackState.currentTime - 10);
                        handleSeek(newTime);
                    } else {
                        // Navigate between controls
                        const controls = ['back', 'seekBackward', 'playPause', 'seekForward'];
                        const currentIndex = controls.indexOf(focusedControl as string);
                        const newIndex = Math.max(0, currentIndex - 1);
                        setFocusedControl(controls[newIndex] as any);
                    }
                    showControlsWithTimer();
                    break;

                case 'right':
                    if (focusedControl === 'progress') {
                        // Handle seek forward in progress bar
                        const newTime = Math.min(playbackState.duration, playbackState.currentTime + 10);
                        handleSeek(newTime);
                    } else {
                        // Navigate between controls
                        const controls = ['back', 'seekBackward', 'playPause', 'seekForward'];
                        const currentIndex = controls.indexOf(focusedControl as string);
                        const newIndex = Math.min(controls.length - 1, currentIndex + 1);
                        setFocusedControl(controls[newIndex] as any);
                    }
                    showControlsWithTimer();
                    break;

                case 'up':
                    if (focusedControl === 'progress') {
                        setFocusedControl('playPause');
                    } else {
                        setFocusedControl('back');
                    }
                    showControlsWithTimer();
                    break;

                case 'down':
                    if (focusedControl !== 'progress') {
                        setFocusedControl('progress');
                    }
                    showControlsWithTimer();
                    break;

                case 'menu':
                case 'back':
                    onClose();
                    break;

                default:
                    showControlsWithTimer();
                    break;
            }
        }
    }, [focusedControl, handlePlayPause, handleSeekBackward, handleSeekForward, handleSeek, playbackState.currentTime, playbackState.duration, onClose, showControlsWithTimer]);

    useEffect(() => {
        if (Platform.OS === 'android') {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                onClose();
                return true;
            });
            return () => backHandler.remove();
        }
    }, [onClose]);

    useEffect(() => {
        const subscription = TVEventHandler.addListener(handleTVRemoteKey);

        return () => {
            subscription?.remove();
        };
    }, [handleTVRemoteKey]);

    useEffect(() => {
        return () => {
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
        };
    }, []);

    const handleTryAgain = async () => {
        setIsRetrying(true);
        try {
            handleRetry();
            setIsRetrying(false);
        } catch (error) {
            setIsRetrying(false);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            console.error('Retry failed:', errorMessage);
            onError(errorMessage);
        }
    };

    if (playbackState.error && !isRetrying) {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64 * scale} color={Colors.light.tint} />
                    <ThemedText style={[textStyles.title, styles.errorTitle]}>
                        Playback Error
                    </ThemedText>
                    <ThemedText style={[textStyles.body, styles.errorMessage]}>
                        {playbackState.error}
                    </ThemedText>
                    <ThemedText style={[textStyles.caption, styles.debugInfo]}>
                        Video ID: {video.id} | Source: {Platform.isTV ? 'HLS' : 'MP4'}
                    </ThemedText>
                    <View style={styles.errorButtons}>
                        <Pressable style={({ pressed, focused }) => [
                            styles.retryButton,
                            (pressed || focused) && styles.buttonFocused,
                        ]}
                            onPress={handleTryAgain}>
                            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
                        </Pressable>
                        <Pressable style={({ pressed, focused }) => [
                            styles.closeButton,
                            (pressed || focused) && styles.buttonFocused,
                        ]}
                            onPress={onClose}>
                            <ThemedText style={styles.buttonText}>Close</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <Pressable style={styles.videoContainer} onPress={showControlsWithTimer}>
                <VideoView
                    player={player}
                    style={styles.video}
                    allowsFullscreen
                    nativeControls={false}
                    focusable={false}
                    allowsPictureInPicture
                    contentFit="contain"
                />

                {showControls && (
                    <View style={styles.controlsOverlay}>
                        <View style={styles.topControls}>
                            <Pressable
                                style={[
                                    styles.controlButton,
                                    focusedControl === 'back' && styles.focusedControlButton
                                ]}
                                onPress={onClose}>
                                <Ionicons name="arrow-back" size={24 * scale} color="white" />
                            </Pressable>
                            <ThemedText style={styles.videoTitle} numberOfLines={1}>
                                {video.title}
                            </ThemedText>
                        </View>

                        <View style={styles.centerControls}>
                            <Pressable
                                style={[
                                    styles.controlButton,
                                    focusedControl === 'seekBackward' && styles.focusedControlButton
                                ]}
                                onPress={handleSeekBackward}>
                                <Ionicons name="play-back" size={32 * scale} color="white" />
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.playButton,
                                    focusedControl === 'playPause' && styles.focusedPlayButton
                                ]}
                                onPress={handlePlayPause}>
                                <Ionicons
                                    name={playbackState.isPlaying ? "pause" : "play"}
                                    size={48 * scale}
                                    color="white"
                                />
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.controlButton,
                                    focusedControl === 'seekForward' && styles.focusedControlButton
                                ]}
                                onPress={handleSeekForward}>
                                <Ionicons name="play-forward" size={32 * scale} color="white" />
                            </Pressable>
                        </View>

                        <View style={styles.bottomControls}>
                            <ProgressBar
                                currentTime={playbackState.currentTime}
                                duration={playbackState.duration}
                                onSeek={handleSeek}
                                isFocused={focusedControl === 'progress'}
                            />
                        </View>
                    </View>
                )}

                {playbackState.isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
                    </View>
                )}
            </Pressable>

        </ThemedView>
    );
}

const useVideoPlayerStyles = () => {
    const scale = useScale();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'black',
        },
        videoContainer: {
            flex: 1,
        },
        video: {
            flex: 1,
        },
        controlsOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            paddingVertical: 40 * scale,
            paddingHorizontal: 20 * scale,
        },
        topControls: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        centerControls: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 40 * scale,
        },
        bottomControls: {
            gap: 16 * scale,
        },
        controlButton: {
            padding: 12 * scale,
            borderRadius: 8 * scale,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
        focusedControlButton: {
            backgroundColor: Colors.dark.primary,
            borderWidth: 2,
            borderColor: 'white',
            transform: [{ scale: 1.1 }],
        },
        playButton: {
            padding: 20 * scale,
            borderRadius: 50 * scale,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        focusedPlayButton: {
            backgroundColor: Colors.dark.primary,
            borderWidth: 3,
            borderColor: 'white',
            transform: [{ scale: 1.15 }],
        },
        videoTitle: {
            flex: 1,
            marginLeft: 16 * scale,
            fontSize: 18 * scale,
            fontWeight: 'bold',
            color: 'white',
        },
        loadingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        loadingText: {
            color: 'white',
            fontSize: 16 * scale,
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20 * scale,
        },
        errorTitle: {
            marginTop: 16 * scale,
            marginBottom: 8 * scale,
            textAlign: 'center',
        },
        errorMessage: {
            textAlign: 'center',
            marginBottom: 24 * scale,
            opacity: 0.8,
        },
        debugInfo: {
            textAlign: 'center',
            marginBottom: 16 * scale,
            opacity: 0.6,
            fontSize: 12 * scale,
        },
        errorButtons: {
            flexDirection: 'row',
            gap: 16 * scale,
        },
        retryButton: {
            backgroundColor: Colors.white,
            paddingHorizontal: 24 * scale,
            paddingVertical: 12 * scale,
            borderRadius: 8 * scale,
        },
        closeButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingHorizontal: 24 * scale,
            paddingVertical: 12 * scale,
            borderRadius: 8 * scale,
        },
        buttonText: {
            color: Colors.black,
            fontWeight: 'bold',
            fontSize: 16 * scale,
        },
        buttonFocused: {
            backgroundColor: Colors.dark.primary,
        }
    });
};