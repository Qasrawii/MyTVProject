import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Alert, Pressable } from 'react-native';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { VideoListItem } from './VideoListItem';
import { VideoPlayer } from './VideoPlayer';
import { Video } from '@/src/types/video';
import { useVideoData } from '@/src/hooks/useVideoData';
import { useScale } from '@/src/hooks/useScale';
import { useTextStyles } from '@/src/hooks/useTextStyles';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface VideoListProps {
  showFavoritesOnly?: boolean;
}

export function VideoList({ showFavoritesOnly = false }: VideoListProps) {
  const scale = useScale();
  const textStyles = useTextStyles();
  const styles = useVideoListStyles();

  const {
    videos,
    isLoading,
    error,
    toggleFavorite,
    isFavorite,
    getFavoriteVideos,
    retryLoading
  } = useVideoData();

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  const displayVideos = showFavoritesOnly ? getFavoriteVideos() : videos;

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setPlayingVideo(video);
  };

  const handleClosePlayer = () => {
    setPlayingVideo(null);
    setSelectedVideo(null);
  };

  const handlePlayerError = (errorMessage: string) => {
    Alert.alert(
      'Playback Error',
      errorMessage,
      [
        {
          text: 'OK',
          onPress: () => handleClosePlayer(),
        },
      ]
    );
  };

  const handleRetry = () => {
    retryLoading();
  };

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
      <ThemedView style={styles.centerContainer}>
        <View style={styles.loadingContainer}>
          <Ionicons name="play-circle" size={64 * scale} color={Colors.light.tint} />
          <ThemedText style={[textStyles.title, styles.loadingText]}>
            Loading Videos...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64 * scale} color={Colors.light.tint} />
          <ThemedText style={[textStyles.title, styles.errorTitle]}>
            Unable to Load Videos
          </ThemedText>
          <ThemedText style={[textStyles.default, styles.errorMessage]}>
            {error}
          </ThemedText>
          <Pressable style={({ pressed, focused }) => [
            styles.retryButton,
            (pressed || focused) && styles.buttonFocused,
          ]} onPress={handleRetry}>
            <Ionicons name="refresh" size={20 * scale} color="#fff" />
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  if (showFavoritesOnly && displayVideos.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64 * scale} color={Colors.light.tint} />
          <ThemedText style={[textStyles.title, styles.emptyTitle]}>
            No Favorites Yet
          </ThemedText>
          <ThemedText style={[textStyles.default, styles.emptyMessage]}>
            Add videos to your favorites by tapping the heart icon
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={[textStyles.title, styles.headerTitle]}>
          {showFavoritesOnly ? 'Favorite Videos' : 'Video Library'}
        </ThemedText>
        <ThemedText style={[textStyles.caption, styles.videoCount]}>
          {displayVideos.length} video{displayVideos.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      <FlatList
        data={displayVideos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VideoListItem
            video={item}
            onSelect={handleVideoSelect}
            isSelected={item.id === selectedVideo?.id}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}

      />
    </ThemedView>
  );
}

const useVideoListStyles = function () {
  const scale = useScale();
  const colorScheme = useColorScheme();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 20 * scale,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'light'].icon,
    },
    headerTitle: {
      fontWeight: 'bold',
      marginBottom: 4 * scale,
    },
    videoCount: {
      opacity: 0.7,
    },
    listContent: {
      paddingBottom: 20 * scale,
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
    },
    errorContainer: {
      alignItems: 'center',
      padding: 40 * scale,
      maxWidth: 300 * scale,
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
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.white,
      paddingHorizontal: 20 * scale,
      paddingVertical: 12 * scale,
      borderRadius: 8 * scale,
      gap: 8 * scale,
    },
    retryButtonText: {
      color: Colors.white,
      fontWeight: 'bold',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 40 * scale,
      maxWidth: 300 * scale,
    },
    emptyTitle: {
      marginTop: 16 * scale,
      marginBottom: 8 * scale,
      textAlign: 'center',
    },
    emptyMessage: {
      textAlign: 'center',
      opacity: 0.8,
    },
    buttonFocused: {
      backgroundColor: Colors[colorScheme ?? 'light'].primary,
    }
  });
};
