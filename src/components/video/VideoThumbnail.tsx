import React from 'react';
import { StyleSheet, Pressable, Image, View } from 'react-native';
import { ThemedText } from '@/src/components/ThemedText';
import { Video } from '@/src/types/video';
import { useScale } from '@/src/hooks/useScale';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface VideoThumbnailProps {
    video: Video;
    onSelect: (video: Video) => void;
    onFocus?: (video: Video) => void;
    isSelected: boolean;
    isFavorite?: boolean;
}

export function VideoThumbnail({
    video,
    onSelect,
    onFocus,
    isSelected,
    isFavorite = false,
}: VideoThumbnailProps) {
    const scale = useScale();
    const styles = useVideoThumbnailStyles();

    const handlePress = () => {
        onSelect(video);
    };

    return (
        <View
            style={styles.container}

            accessibilityRole="button"
            accessibilityLabel={`Play ${video.title}`}
            accessibilityHint={`Video duration: ${video.duration}. ${isFavorite ? 'Remove from' : 'Add to'} favorites.`}
        >
            <Pressable
                onPress={handlePress}
                onFocus={() => {
                    onFocus?.(video);
                }}
                style={({ pressed, focused }) => [
                    styles.thumbnailContainer,
                    isSelected && styles.selected,
                    (pressed || focused) && styles.focused,
                ]}>
                <Image
                    source={{ uri: video.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                <View style={styles.durationBadge}>
                    <ThemedText style={styles.durationText}>{video.duration}</ThemedText>
                </View>

                <View
                    style={styles.favoriteButton}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={16 * scale}
                        color={isFavorite ? "#ff4757" : "white"}
                    />
                </View>

            </Pressable>

            <View style={styles.titleContainer}>
                <ThemedText
                    numberOfLines={2}
                    style={styles.titleText}
                >
                    {video.title}
                </ThemedText>
            </View>
        </View>
    );
}

const useVideoThumbnailStyles = function () {
    const scale = useScale();
    const colorScheme = useColorScheme();

    return StyleSheet.create({
        container: {
            marginVertical: 8 * scale,
            width: 230 * scale,
            marginHorizontal: 8 * scale,

        },
        selected: {
            transform: [{ scale: 1.02 }],
            borderColor: Colors[colorScheme ?? 'light'].primary,
        },
        focused: {
            transform: [{ scale: 1.08 }],
            borderColor: Colors[colorScheme ?? 'light'].primary,
            shadowOpacity: 0.3,
            shadowRadius: 12 * scale,
        },
        thumbnailContainer: {
            width: '100%',
            height: 130 * scale,
            borderRadius: 12 * scale,
            position: 'relative',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 4 * scale,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8 * scale,
            elevation: 8,
            borderWidth: 2,
            borderColor: 'transparent',
            overflow: 'hidden',
        },
        thumbnail: {
            width: '100%',
            height: '100%',
            borderRadius: 12 * scale,
        },
        gradientOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 12 * scale,
        },
        playIconOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 12 * scale,
        },
        durationBadge: {
            position: 'absolute',
            bottom: 8 * scale,
            right: 8 * scale,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            paddingHorizontal: 8 * scale,
            paddingVertical: 4 * scale,
            borderRadius: 6 * scale,
        },
        durationText: {
            color: '#fff',
            fontSize: 10 * scale,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        favoriteButton: {
            position: 'absolute',
            top: 8 * scale,
            right: 8 * scale,
            width: 28 * scale,
            height: 28 * scale,
            borderRadius: 14 * scale,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
        },
        favoriteButtonFocused: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            transform: [{ scale: 1.1 }],
        },
        focusBorder: {
            position: 'absolute',
            top: -3 * scale,
            left: -3 * scale,
            right: -3 * scale,
            bottom: -3 * scale,
            borderWidth: 3 * scale,
            borderColor: Colors[colorScheme ?? 'light'].primary,
            borderRadius: 15 * scale,
        },
        titleContainer: {
            paddingHorizontal: 4 * scale,
            paddingVertical: 8 * scale,
            minHeight: 40 * scale,
        },
        titleText: {
            fontSize: 12 * scale,
            fontWeight: '600',
            lineHeight: 16 * scale,
            color: Colors[colorScheme ?? 'light'].text,
            textAlign: 'left',
        },
        // Legacy styles - keeping for compatibility
        infoContainer: {
            padding: 8 * scale,
            minHeight: 60 * scale,
        },
        title: {
            fontWeight: '600',
            marginBottom: 2 * scale,
            lineHeight: 16 * scale,
            fontSize: 13 * scale,
        },
        category: {
            color: Colors[colorScheme ?? 'light'].tint,
            marginBottom: 4 * scale,
            fontWeight: '500',
            fontSize: 11 * scale,
        },
        description: {
            opacity: 0.7,
            lineHeight: 14 * scale,
            fontSize: 11 * scale,
        },
    });
};
