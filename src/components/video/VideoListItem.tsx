import React from 'react';
import { StyleSheet, Pressable, Image, View, Platform } from 'react-native';
import { ThemedText } from '@/src/components/ThemedText';
import { VideoListItemProps } from '@/src/types/video';
import { useScale } from '@/src/hooks/useScale';
import { useTextStyles } from '@/src/hooks/useTextStyles';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';

export function VideoListItem({
  video,
  onSelect,
  isSelected,
  isFavorite = false,
  onToggleFavorite
}: VideoListItemProps) {
  const scale = useScale();
  const textStyles = useTextStyles();
  const colorScheme = useColorScheme();
  const styles = useVideoListItemStyles();

  const handlePress = () => {
    onSelect(video);
  };

  const handleFavoritePress = () => {
    onToggleFavorite?.(video.id);
  };

  return (
    <Pressable
      style={({ pressed, focused }) => [
        styles.container,
        isSelected && styles.selected,
        (pressed || focused) && styles.focused,
      ]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>{video.duration}</ThemedText>
          </View>
          {isFavorite && (
            <View style={styles.favoriteIcon}>
              <Ionicons name="heart" size={16 * scale} color={Colors.light.primary} />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <ThemedText
            style={[textStyles.subtitle, styles.title]}
            numberOfLines={2}
          >
            {video.title}
          </ThemedText>
          <ThemedText
            style={[textStyles.caption, styles.category]}
            numberOfLines={1}
          >
            {video.category}
          </ThemedText>
          <ThemedText
            style={[textStyles.caption, styles.description]}
            numberOfLines={3}
          >
            {video.description}
          </ThemedText>
        </View>

        {onToggleFavorite && (
          <Pressable
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24 * scale}
              color={isFavorite ? Colors.light.primary : Colors[colorScheme ?? 'light'].text}
            />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const useVideoListItemStyles = function () {
  const scale = useScale();
  const colorScheme = useColorScheme();

  return StyleSheet.create({
    container: {
      marginVertical: 8 * scale,
      marginHorizontal: 16 * scale,
      borderRadius: 12 * scale,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderWidth: 2,
      borderColor: 'transparent',
      ...Platform.select({
        android: {
          elevation: 2,
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }),
    },
    selected: {
      borderColor: Colors.light.primary,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
    },
    focused: {
      borderColor: Colors.light.primary,
      transform: [{ scale: 1.02 }],
      ...Platform.select({
        android: {
          elevation: 8,
        },
        ios: {
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
      }),
    },
    content: {
      flexDirection: 'row',
      padding: 12 * scale,
      alignItems: 'flex-start',
    },
    thumbnailContainer: {
      position: 'relative',
      marginRight: 12 * scale,
    },
    thumbnail: {
      width: 120 * scale,
      height: 68 * scale,
      borderRadius: 8 * scale,
      backgroundColor: Colors[colorScheme ?? 'light'].icon,
    },
    durationBadge: {
      position: 'absolute',
      bottom: 4 * scale,
      right: 4 * scale,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingHorizontal: 6 * scale,
      paddingVertical: 2 * scale,
      borderRadius: 4 * scale,
    },
    durationText: {
      fontSize: 10 * scale,
      color: '#fff',
      fontWeight: 'bold',
    },
    favoriteIcon: {
      position: 'absolute',
      top: 4 * scale,
      right: 4 * scale,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12 * scale,
      width: 24 * scale,
      height: 24 * scale,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 4 * scale,
    },
    category: {
      color: Colors.light.primary,
      fontWeight: '600',
      marginBottom: 4 * scale,
    },
    description: {
      opacity: 0.8,
      lineHeight: 16 * scale,
    },
    favoriteButton: {
      padding: 8 * scale,
      marginLeft: 8 * scale,
    },
  });
};
