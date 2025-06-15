# CMR visionOS AR - TypeScript Edition

A fully functional visionOS-style AR interface built with TypeScript, React, and Three.js. This system provides draggable windows, functional apps, and a modern AR experience.

## 🚀 Features

### **Core AR System**
- **TypeScript-powered** with full type safety
- **Draggable windows** from title bars
- **Working window controls** (minimize, maximize, close)
- **Resizable windows** with corner handles
- **Glass-morphism UI** with backdrop blur effects
- **Static window placement** in AR space

### **Functional Apps**
- **Calculator** - Full arithmetic operations with state management
- **Notes** - Rich text editor with local storage and tagging
- **Browser** - Web navigation with bookmarks and history
- **Camera** - AR camera integration
- **YouTube** - Video streaming interface
- **Maps** - Location services

### **App Drawer**
- **Dynamic app icons** with gradient backgrounds
- **Active state highlighting**
- **Responsive design** for all screen sizes
- **Easy app switching**

## 📁 Project Structure

```
examples/
├── visionOS_ar.html          # Main AR interface
├── visionOS.css              # Interface styling
├── visionOS.ts               # Core AR TypeScript logic
├── visionOS.js               # Compiled JavaScript (auto-generated)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── components/               # React components
│   ├── AppWindow.tsx         # Window component
│   └── AppWindow.css         # Component styles
├── apps/                     # Functional applications
│   ├── calculator.tsx        # Calculator app
│   ├── notes.tsx            # Notes app
│   └── browser.tsx          # Browser app
└── README.md                # This file
```

## 🛠️ Setup & Development

### **Prerequisites**
- Node.js 16+ 
- TypeScript 5.3+
- AR-capable device (Chrome Android 81+)

### **Installation**
```bash
cd examples
npm install
```

### **Development Commands**
```bash
# Build TypeScript files
npm run build

# Watch mode for development
npm run watch

# Start development server
npm run dev

# Clean build artifacts
npm run clean
```

### **Usage**
1. Run `npm run build` to compile TypeScript
2. Open `visionOS_ar.html` in an AR-capable browser
3. Grant camera permissions
4. Tap to place app windows
5. Use the app drawer to launch applications

## 🎯 App Functionality

### **Calculator App**
- **Full arithmetic operations** (+, -, ×, ÷, %)
- **State management** with TypeScript interfaces
- **Responsive design** with hover effects
- **Error handling** for invalid operations

### **Notes App**
- **Rich text editing** with auto-save
- **Local storage** persistence
- **Tagging system** for organization
- **Search functionality** across notes
- **Note preview** with metadata

### **Browser App**
- **URL navigation** with protocol detection
- **Bookmark management** with local storage
- **Browser history** with back/forward
- **Quick links** to popular sites
- **Search integration** with Google

## 🔧 Technical Details

### **TypeScript Configuration**
- **Strict mode** enabled for type safety
- **No source maps** for clean builds
- **ES2020 target** for modern features
- **React JSX** support for components

### **React Integration**
- **Functional components** with hooks
- **TypeScript interfaces** for props
- **State management** with useState/useEffect
- **Event handling** with proper typing

### **Three.js AR Features**
- **WebXR integration** for AR support
- **Window positioning** in 3D space
- **Raycasting** for interaction
- **Iframe rendering** for app content

## 🎨 UI/UX Features

### **Window Management**
- **Drag from title bar** to move windows
- **Resize handles** in bottom-right corner
- **Minimize animation** to taskbar
- **Maximize/restore** functionality
- **Close button** with confirmation

### **Visual Design**
- **Glass-morphism effects** with backdrop blur
- **Gradient backgrounds** for app icons
- **Smooth animations** and transitions
- **Responsive layouts** for all screen sizes
- **Modern typography** with system fonts

## 🔄 State Management

### **Window State**
```typescript
interface WindowData {
    group: THREE.Group;
    appName: string;
    isDragging: boolean;
    dragOffset: THREE.Vector3;
    content: THREE.Mesh;
    iframe: HTMLIFrameElement | null;
    position: THREE.Vector3;
    size: { width: number; height: number };
    isMaximized: boolean;
}
```

### **App Configuration**
```typescript
interface AppConfig {
    id: string;
    name: string;
    icon: string;
    color: string;
    path?: string;
}
```

## 🚀 Extending the System

### **Adding New Apps**
1. Create a new `.tsx` file in `apps/` directory
2. Implement the app component with TypeScript
3. Add app configuration to the `apps` array in `visionOS.ts`
4. Update the app drawer styling if needed

### **Custom Window Features**
1. Extend the `AppWindow` component
2. Add new props to the interface
3. Implement custom event handlers
4. Update CSS for new styling

## 🌐 Browser Compatibility

- **Chrome Android 81+** (WebXR AR support)
- **Safari iOS 13+** (limited AR support)
- **Firefox Reality** (WebXR support)
- **Edge Chromium** (WebXR support)

## 📱 AR Device Support

- **ARCore-enabled Android devices**
- **ARKit-enabled iOS devices**
- **WebXR-capable VR headsets**
- **Desktop browsers** (fallback mode)

## 🔒 Security & Privacy

- **Local storage only** - no data sent to servers
- **Camera permissions** required for AR
- **CORS handling** for iframe content
- **Secure WebXR** implementation

## 🎯 Future Enhancements

- **Multi-window support** with window management
- **App store integration** for new apps
- **Gesture recognition** for AR interactions
- **Voice commands** for hands-free operation
- **Collaborative AR** for shared experiences

## 📄 License

This project is part of the CMR AR framework and is available under the MIT License. 