# MyTV Project - React Native TV Streaming App

A modern React Native TV application built with Expo that delivers an immersive video streaming experience optimized for TV platforms including Android TV and Apple TV. This project showcases TV-specific development patterns, focus management, and responsive video playback.

## 🚀 How to Run and Test the App

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (for Android TV testing)
- **Xcode** (for Apple TV testing, macOS only)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/Qasrawii/MyTVProject.git
   cd MyTVProject
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   # The project automatically sets EXPO_TV=1 for TV optimization
   ```

### Running on TV Emulators

#### Android TV Emulator

1. **Set up Android TV AVD in Android Studio**
   ```bash
   # Open Android Studio
   # Go to Tools → AVD Manager → Create Virtual Device
   # Select TV tab → Choose "Android TV (1080p)" or "Android TV (4K)"
   # Download a system image (API 28+ recommended)
   # Create and start the emulator
   ```

2. **Run the app on Android TV**
   ```bash
   npm run android
   # or manually with Expo TV flag
   EXPO_TV=1 expo run:android
   ```

#### Apple TV Simulator (macOS only)

1. **Run on tvOS Simulator**
   ```bash
   npm run ios
   # or manually with Expo TV flag
   EXPO_TV=1 expo run:ios
   ```

### Testing on Physical Devices

#### Android TV Device
```bash
# Enable Developer Options and USB Debugging on your Android TV
# Connect via USB or enable wireless debugging
npm run android
```

#### Apple TV Device
```bash
# Connect Apple TV and Mac to the same network
# Enable Remote Login on Apple TV (Settings → Remotes and Devices → Remote App and Devices)
# Run through Xcode or use wireless debugging
npm run ios
```

#### Demo Video
*A demo video showcasing the app's TV navigation, focus management, and video playback features would be available here.*

## 🛠 Libraries and Tools Used

### Core Technologies
- **[Expo](https://expo.dev/)** `v53.0.16` - Development platform and build system
- **[react-native-tvos](https://github.com/react-native-tvos/react-native-tvos)** `v0.79.5-0` - TV-optimized React Native fork
- **[TypeScript](https://www.typescriptlang.org/)** `v5.8.3` - Type-safe development

### Navigation and Routing
- **[expo-router](https://docs.expo.dev/router/introduction/)** `v5.1.2` - File-based navigation system
- **Focus Management**: Built-in Expo TV focus handling (no third-party libraries needed)

### Video Playback Libraries
- **[expo-video](https://docs.expo.dev/versions/latest/sdk/video/)** `v2.2.2` - Primary video player with HLS support

### TV-Specific Libraries
- **[@react-native-tvos/config-tv](https://github.com/react-native-tvos/config-tv)** `v0.1.1` - TV platform configuration
- **Built-in TV Remote Support** - Native TV remote control event handling
- **Platform Detection** - Automatic TV/mobile platform detection

### UI and Animations
- **[@expo/vector-icons](https://docs.expo.dev/guides/icons/)** `v14.0.2` - Icon library
- **[expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** `v14.1.5` - Gradient backgrounds

## 🎯 Key Features

### Core Functionality
- **Video Library**: Browse curated video collection with thumbnails and metadata
- **Adaptive Streaming**: HLS for TV platforms.

### TV-Optimized Features
- **Remote Control Navigation**: Full D-pad support (Up/Down/Left/Right/Select)
- **Focus Management**: Visual feedback with scaling animations for focused elements
- **Auto-hide Controls**: Player controls fade after 3 seconds of inactivity
- **Seek Controls**: 10-second forward/backward seeking via remote

## 🚧 Development Challenges and Solutions

### The Focus Management Challenge

**The Problem**: Focus management was by far the biggest technical challenge in developing this TV app. TV platforms require precise control over which UI elements can receive focus and how users navigate between them using a remote control. Unlike touch interfaces, TV navigation is entirely sequential and requires careful consideration of focus flow.

**What I Tried Initially**: I attempted to use several third-party libraries for focus control, having previously built custom focus management solutions:

- **`react-tv-navigation`** - did not find it
- **`@noriginmedia/react-spatial-navigation`** - Good concept but didn't integrate well with React Native

- **Custom Focus Management** - My previous approach using manual focus tracking

**The Solution - Expo's Built-in Focus Management**:

Eventually, I switched to Expo's built-in TV focus management, which leverages React Native's native focus system:

```typescript
// Expo's elegant built-in focus management
<Pressable
  style={({ pressed, focused }) => [
    styles.button,
    focused && styles.buttonFocused, // Automatic focus detection
  ]}
  onFocus={() => {
    onFocus?.(video); // Optional focus callback
  }}
  onPress={handlePress}
>
  <ThemedText>Play Video</ThemedText>
</Pressable>
```

**Why Expo's Approach Works Better**:

1. **Native Integration**: Direct integration with platform TV APIs (tvOS and Android TV)
2. **Consistent Behavior**: Same focus logic across all TV platforms
3. **Better Performance**: Optimized for TV hardware constraints and large lists
4. **Zero Configuration**: Works out of the box with sensible defaults
5. **Maintenance**: Officially supported and regularly updated
6. **Debugging**: Better debugging tools and error messages

```typescript
// Example of advanced focus handling in VideoThumbnail component
<Pressable
  onPress={handlePress}
  onFocus={() => onFocus?.(video)}
  style={({ pressed, focused }) => [
    styles.thumbnailContainer,
    isSelected && styles.selected,
    (pressed || focused) && styles.focused, // Visual feedback
  ]}
>
```



## 🎮 TV Remote Control Guide

### Navigation
- **D-Pad**: Navigate between UI elements
- **Select/OK**: Activate focused element or play/pause video
- **Back**: Return to previous screen or exit player
- **Menu**: Access additional options (platform-dependent)

### Video Player Controls
- **Left/Right**: 10-second backward/forward seeking
- **Up/Down**: Navigate between player control elements
- **Select**: Play/pause toggle
- **Back/Menu**: Exit video player

## 🏗 Project Structure

```
MyTVProject/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with tab navigation
│   └── index.tsx                # Home screen with hero video
├── src/
│   ├── components/
│   │   ├── video/
│   │   │   ├── VideoPlayer.tsx   # Full-screen video player with TV controls
│   │   │   ├── VideoList.tsx     # Video library with grid layout
│   │   │   ├── VideoThumbnail.tsx # Individual video thumbnails
│   │   │   ├── VideoListItem.tsx # List view video items
│   │   │   └── ProgressBar.tsx   # Custom progress bar with TV focus
│   │   ├── ThemedText.tsx        # Theme-aware text component
│   │   └── ThemedView.tsx        # Theme-aware view component
│   ├── hooks/
│   │   ├── useVideoHandler.ts    # Video playback logic and controls
│   │   ├── usePlaybackState.ts   # Playback state management
│   │   ├── useVideoData.ts       # Video data and favorites management
│   │   ├── useScale.ts          # TV-optimized UI scaling
│   │   └── useTextStyles.ts     # Responsive text styles
│   ├── types/
│   │   └── video.ts             # TypeScript interfaces
│   ├── constants/
│   │   ├── Colors.ts            # Theme colors
│   │   └── TextStyles.ts        # Text style constants
│   ├── assets/
│   │   ├── images/              # App images and splash screens
│   │   ├── fonts/               # Custom fonts
│   │   └── tv_icons/            # TV platform specific icons
│   └── data/
│       └── videos.json          # Sample video data
├── metro.config.js              # TV file extension support
├── app.json                     # Expo TV configuration
└── package.json                 # Dependencies and scripts
```



## 📱 Cross-Platform Compatibility

This app is designed to work across multiple platforms:
- **Android TV** (Android 7.0+)
- **Apple TV** (tvOS 13.0+)


----
**Built with ❤️ for the big screen experience**