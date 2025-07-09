# MyTV Project - TV-Optimized Video Streaming App

A comprehensive TV app built with Expo and React Native that provides an intuitive video streaming experience optimized for TV platforms (Android TV, Apple TV, and more).

![Apple TV screen shot](https://github.com/douglowder/examples/assets/6577821/a881466f-a7a0-4c66-b1fc-33235c466997)
![Android TV screen shot](https://github.com/douglowder/examples/assets/6577821/815c8e01-8275-4cc1-bd57-b9c8bce1fb02)

## 🎥 Features

### Core Functionality
- **Video Library**: Browse a curated collection of sample videos with thumbnails and metadata
- **Adaptive Streaming**: Support for HLS (HTTP Live Streaming) and standard MP4 playback
- **TV-Optimized Navigation**: Full remote control support with focus management
- **Favorites System**: Mark videos as favorites for quick access
- **Playback Resume**: Automatically resumes videos from where you left off
- **Subtitle Support**: Toggle subtitles on compatible videos

### TV-Specific Features
- **Remote Control Navigation**: Navigate using D-pad (Up, Down, Left, Right, Select)
- **Focus Management**: Visual feedback for focused elements
- **Back Button Support**: Android TV back button handling
- **Seek Controls**: 10-second forward/backward seeking
- **Auto-hide Controls**: Player controls automatically hide during playback

### User Experience
- **Loading States**: Clear loading indicators during video loading
- **Error Handling**: Comprehensive error messages with retry functionality
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Dark/Light Theme**: Automatic theme switching based on system preferences

## 🛠 Technology Stack

### Core Technologies
- **Expo**: Development platform and build system
- **React Native**: Cross-platform mobile framework
- **React Native TV**: TV platform support (react-native-tvos)
- **TypeScript**: Type-safe development

### Key Libraries
- **react-native-video**: Video playback with HLS/DASH support
- **expo-router**: File-based navigation system
- **expo-font**: Custom font loading
- **@expo/vector-icons**: Icon library

### TV-Specific Libraries
- **@react-native-tvos/config-tv**: TV platform configuration
- **react-native-tvos**: TV-optimized React Native build

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android TV testing)
- Xcode (for Apple TV testing, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyTVProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Running on TV Platforms

#### Android TV
1. **Using Android TV Emulator**
   ```bash
   npm run android
   ```
   - Open Android Studio
   - Create an Android TV AVD (Android Virtual Device)
   - Run the emulator
   - The app will automatically install and launch

2. **Using Physical Android TV Device**
   - Enable Developer Options on your Android TV
   - Enable USB Debugging
   - Connect via USB or use wireless debugging
   - Run `npm run android`

#### Apple TV (macOS only)
1. **Using tvOS Simulator**
   ```bash
   npm run ios
   ```
   - Xcode will open the tvOS Simulator
   - The app will automatically install and launch

### Testing with Expo Go
While not TV-optimized, you can test basic functionality:
```bash
npm start
```
Scan the QR code with Expo Go app on your mobile device.

## 📱 App Structure

### Navigation Structure
```
├── Home Tab - Welcome screen with app overview
├── Videos Tab - Main video library
├── Favorites Tab - Favorited videos
├── Explore Tab - Additional features and info
└── TV Focus Demo - TV navigation demonstration
```

### Key Components

#### Video Components
- **VideoList**: Main video browsing interface
- **VideoListItem**: Individual video thumbnail with metadata
- **VideoPlayer**: Full-screen video player with controls

#### Navigation Components
- **TabBarIcon**: TV-optimized tab icons
- **Themed Components**: Dark/light theme support

### Data Management
- **Video Data**: JSON-based video library (`data/videos.json`)
- **Playback State**: Resume functionality with position tracking
- **Favorites**: Local storage of user preferences

## 🎮 TV Remote Control Guide

### Navigation
- **D-Pad**: Navigate between UI elements
- **Select/OK**: Activate focused element
- **Back**: Return to previous screen or exit player
- **Menu**: Access additional options (platform-dependent)

### Video Player Controls
- **Select/OK**: Play/Pause toggle
- **Left/Right**: Seek backward/forward (10 seconds)
- **Up/Down**: Volume control (platform-dependent)
- **Back**: Exit video player
- **Menu**: Show/hide controls

## 🔧 Configuration

### Environment Variables
The app uses `EXPO_TV=1` environment variable to enable TV-specific features:
```bash
EXPO_TV=1 expo start
```

### TV-Specific Settings
TV configurations are handled in:
- `app.json`: TV icons and metadata
- `@react-native-tvos/config-tv`: TV platform optimizations

## Deploy

Deploy on all platforms with Expo Application Services (EAS).

- Deploy the website: `npx eas-cli deploy` — [Learn more](https://docs.expo.dev/eas/hosting/get-started/)
- Deploy on iOS and Android using: `npx eas-cli build` — [Learn more](https://expo.dev/eas)

## TV specific file extensions

This project includes an [example Metro configuration](./metro.config.js) that allows Metro to resolve application source files with TV-specific code, indicated by specific file extensions (`*.ios.tv.tsx`, `*.android.tv.tsx`, `*.tv.tsx`). The [ExternalLink](./components/ExternalLink.tsx) component makes use of this by having a [separate TV source file](./components/ExternalLink.tv.tsx) that avoids importing packages that don't exist on Apple TV.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/learn): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
