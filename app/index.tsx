import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, FlatList, View, Dimensions, Pressable, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { VideoPlayer } from '@/src/components/video/VideoPlayer';
import { VideoThumbnail } from '@/src/components/video/VideoThumbnail';
import { useVideoData } from '@/src/hooks/useVideoData';
import { useScale } from '@/src/hooks/useScale';
import { useTextStyles } from '@/src/hooks/useTextStyles';
import { Video } from '@/src/types/video';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const scale = useScale();
  const textStyles = useTextStyles();
  const colorScheme = useColorScheme();
  const styles = useHomeScreenStyles();

  const { videos, isLoading, error, toggleFavorite, isFavorite, retryLoading } = useVideoData();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [focusedVideo, setFocusedVideo] = useState<Video | null>(null);
  const flatListRef = useRef<FlatList<Video>>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroContentFade = useRef(new Animated.Value(0)).current;

  const heroVideo = focusedVideo || videos.find(video => video.hero) || videos[0];
  const thumbnailVideos = videos;

  const handleVideoSelect = useCallback((video: Video) => {
    setSelectedVideo(video);
    setPlayingVideo(video);
  }, []);

  const handleVideoFocus = useCallback((video: Video) => {
    setFocusedVideo(video);

    const focusedIndex = thumbnailVideos.findIndex(v => v.id === video.id);
    if (focusedIndex !== -1 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: focusedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } catch {
        const itemWidth = 168 * scale;
        const padding = 24 * scale;
        const offset = focusedIndex * itemWidth - (screenWidth / 2) + (itemWidth / 2) + padding;
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, offset),
          animated: true,
        });
      }
    }
  }, [thumbnailVideos, scale]);

  const handleClosePlayer = useCallback(() => {
    setPlayingVideo(null);
    setSelectedVideo(null);
  }, []);

  const handlePlayerError = useCallback((errorMessage: string) => {
    setPlayingVideo(null);
    setSelectedVideo(null);
  }, []);

  useEffect(() => {
    if (videos.length > 0 && !focusedVideo) {
      const initialVideo = videos.find(video => video.hero) || videos[0];
      setFocusedVideo(initialVideo);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heroContentFade, {
          toValue: 1,
          duration: 1000,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [videos, focusedVideo, fadeAnim, heroContentFade]);

  if (playingVideo) {
    return (
      <VideoPlayer
        video={playingVideo}
        onClose={handleClosePlayer}
        onError={handlePlayerError}
      />
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.loadingContainer}>
            <Ionicons name="tv" size={64 * scale} color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={[textStyles.title, styles.loadingText]}>
              Loading Your Entertainment
            </ThemedText>
            <ThemedText style={[textStyles.default, styles.loadingSubtext]}>
              Preparing your personalized video experience...
            </ThemedText>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64 * scale} color="#ff4757" />
            <ThemedText style={[textStyles.title, styles.errorTitle]}>
              Oops! Something went wrong
            </ThemedText>
            <ThemedText style={[textStyles.default, styles.errorMessage]}>
              {error}
            </ThemedText>
            <Pressable
              style={({ pressed, focused }) => [
                styles.retryButton,
                (pressed || focused) && styles.buttonFocused,
              ]}
              onPress={retryLoading}
            >
              <Ionicons name="refresh" size={16 * scale} color={Colors.black} />
              <ThemedText style={styles.retryButtonText}>TRY AGAIN</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.heroBackgroundContainer, { opacity: fadeAnim }]}>
        <Image
          style={styles.heroBackgroundImage}
          source={{ uri: heroVideo?.hero || heroVideo?.thumbnail }}
          resizeMode="cover"
        />
      </Animated.View>

      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.bottomGradient}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.leftGradient}
      />

      {heroVideo && (
        <Animated.View style={[styles.heroContainer, { opacity: heroContentFade }]}>
          <View style={styles.topHeader}>
            <ThemedText style={[textStyles.largeTitle, styles.logoText]}>
              {heroVideo.title.toUpperCase()}
            </ThemedText>

          </View>

          <View style={styles.heroContent}>

            <View style={styles.movieDescription}>
              <ThemedText numberOfLines={3} style={styles.descriptionText}>
                {heroVideo.description}
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Runtime</ThemedText>
              <ThemedText style={styles.metaValue}>{heroVideo.duration}</ThemedText>
            </View>
            {heroVideo.starring && (
              <View style={styles.metaRow}>
                <ThemedText style={styles.metaLabel}>Starring</ThemedText>
                <ThemedText numberOfLines={1} style={styles.metaValue}>{heroVideo.starring}</ThemedText>
              </View>
            )}
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed, focused }) => [
                  styles.playButton,
                  (pressed || focused) && styles.buttonFocused,
                ]}
                onPress={() => handleVideoSelect(heroVideo)}
              >
                <Ionicons name="play" size={16 * scale} color="#000" />
                <ThemedText style={styles.playButtonText}>PLAY</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed, focused }) => [
                  styles.myListButton,
                  (pressed || focused) && styles.buttonFocused,
                ]}
                onPress={() => toggleFavorite(heroVideo.id)}
              >
                <Ionicons
                  name={isFavorite(heroVideo.id) ? "heart" : "heart-outline"}
                  size={16 * scale}
                  color={Colors.black}
                  style={styles.buttonIcon}
                />
                <ThemedText style={styles.myListText}>
                  {isFavorite(heroVideo.id) ? 'Remove From List' : 'Add to List'}
                </ThemedText>
              </Pressable>

            </View>
          </View>

          <View  >
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>New</ThemedText>
            </View>
            <FlatList<Video>
              ref={flatListRef}
              data={thumbnailVideos}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <VideoThumbnail
                  video={item}
                  onSelect={handleVideoSelect}
                  onFocus={handleVideoFocus}
                  isSelected={item.id === selectedVideo?.id}
                  isFavorite={isFavorite(item.id)}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false}
              decelerationRate={0.85}
              scrollEventThrottle={16}
              initialNumToRender={8}
              maxToRenderPerBatch={4}
              windowSize={5}
              getItemLayout={(data, index) => ({
                length: 230 * scale,
                offset: 230 * scale * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                });
              }}
            />
          </View>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const useHomeScreenStyles = function () {
  const scale = useScale();
  const colorScheme = useColorScheme();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    heroBackgroundContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
    },
    heroBackgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
    },
    bottomGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '70%',
      zIndex: 1,
    },
    leftGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '60%',
      height: '100%',
      zIndex: 1,
    },
    focused: {
      backgroundColor: Colors[colorScheme ?? 'light'].primary,
    },
    buttonFocused: {
      backgroundColor: Colors[colorScheme ?? 'light'].primary,
      transform: [{ scale: 1.05 }],
    },
    textFocused: {
      color: Colors.black,
    },
    heroContainer: {
      flex: 1,
      zIndex: 2,
      padding: 32 * scale,
      paddingTop: 24 * scale,
      justifyContent: 'space-between',
    },
    topHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16 * scale,
    },
    logoText: {
      fontSize: 32 * scale,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'light'].primary,
      letterSpacing: 2,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    myListButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: 16 * scale,
      paddingVertical: 8 * scale,
      borderRadius: 6 * scale,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(10px)',
    },
    buttonIcon: {
      marginRight: 6 * scale,
    },
    myListText: {
      color: Colors.black,
      fontSize: 12 * scale,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    heroContent: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 12 * scale,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8 * scale,
    },
    metaLabel: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 14 * scale,
      fontWeight: '500',
      minWidth: 80 * scale,
    },
    metaValue: {
      color: 'white',
      fontSize: 14 * scale,
      fontWeight: '600',
      flex: 1,
      maxWidth: screenWidth * 0.4,

    },
    movieDescription: {
      marginBottom: 12 * scale,
      maxWidth: screenWidth * 0.4,

    },
    descriptionText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 16 * scale,
      lineHeight: 24 * scale,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 16 * scale,
      marginVertical: 6 * scale,

    },
    playButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      paddingHorizontal: 16 * scale,
      paddingVertical: 8 * scale,
      borderRadius: 6 * scale,
      borderWidth: 1,
      borderColor: Colors.white,
      backdropFilter: 'blur(10px)',
    },
    playButtonText: {
      color: '#000',
      fontSize: 12 * scale,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    infoButton: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: 20 * scale,
      paddingVertical: 12 * scale,
      borderRadius: 6 * scale,
      alignItems: 'center',
      gap: 8 * scale,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    infoButtonText: {
      color: 'white',
      fontSize: 14 * scale,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16 * scale,
    },
    sectionTitle: {
      color: 'white',
      fontSize: 20 * scale,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    navigationHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8 * scale,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12 * scale,
      paddingVertical: 6 * scale,
      borderRadius: 16 * scale,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    hintText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 12 * scale,
      fontWeight: '500',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 40 * scale,
    },
    loadingText: {
      marginTop: 16 * scale,
      textAlign: 'center',
      color: Colors[colorScheme ?? 'light'].text,
    },
    loadingSubtext: {
      marginTop: 8 * scale,
      textAlign: 'center',
      opacity: 0.7,
      fontSize: 14 * scale,
    },
    loadingDots: {
      flexDirection: 'row',
      gap: 8 * scale,
      marginTop: 16 * scale,
    },
    dot: {
      width: 8 * scale,
      height: 8 * scale,
      borderRadius: 4 * scale,
      backgroundColor: Colors[colorScheme ?? 'light'].tint,
    },
    dot1: {
      opacity: 0.8,
    },
    dot2: {
      opacity: 0.6,
    },
    dot3: {
      opacity: 0.4,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      paddingHorizontal: 20 * scale,
      paddingVertical: 12 * scale,
      borderRadius: 8 * scale,
      marginTop: 24 * scale,
      gap: 8 * scale,
    },
    retryButtonText: {
      color: Colors.black,
      fontSize: 14 * scale,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    errorContainer: {
      alignItems: 'center',
      padding: 40 * scale,
      maxWidth: 400 * scale,
    },
    errorTitle: {
      marginTop: 16 * scale,
      marginBottom: 8 * scale,
      textAlign: 'center',
    },
    errorMessage: {
      textAlign: 'center',
      opacity: 0.7,
    },
  });
};
