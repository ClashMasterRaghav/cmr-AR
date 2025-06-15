# CMR-AR - Windows 7 Style AR Apps

A TypeScript-based Augmented Reality application that creates Windows 7-style floating windows in AR space.

## Features

- **Windows 7 Style UI**: App windows with draggable headers, resize handles, and close buttons
- **Media Player**: Video playback from local textures
- **YouTube Player**: Embedded YouTube iframe support
- **AR Controls**: Separate app control panel for creating new windows
- **Touch & Controller Support**: Full interaction support for both touch and XR controllers

## Architecture

The application is built with TypeScript and uses a modular architecture:

- `ar_core.ts`: Core AR functionality and Three.js setup
- `window_manager.ts`: Manages Windows 7-style app windows
- `media_player.ts`: Video playback functionality
- `youtube_player.ts`: YouTube iframe integration
- `app_control.ts`: App control panel UI
- `interaction_manager.ts`: User interaction handling
- `types.ts`: TypeScript type definitions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript files:
   ```bash
   npm run build
   ```

3. Start the development server:
   ```bash
   npm run serve
   ```

4. Open `http://localhost:8000/examples/ar_web.html` in a WebXR-capable browser

## Development

- **Watch mode**: `npm run watch` - Automatically rebuilds on file changes
- **Development mode**: `npm run dev` - Builds and starts server

## Requirements

- WebXR-capable browser (Chrome on Android recommended)
- AR-capable device
- Local web server (for video texture loading)

## File Structure

```
├── examples/
│   ├── src/           # TypeScript source files
│   ├── dist/          # Compiled JavaScript files
│   ├── textures/      # Video and texture assets
│   └── ar_web.html    # Main HTML file
├── build/             # Three.js library files
└── package.json       # Dependencies and scripts
```