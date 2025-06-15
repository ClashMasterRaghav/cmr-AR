import * as THREE from 'three';

export interface AppWindow {
    id: string;
    title: string;
    type: 'mediaPlayer' | 'youtube';
    position: THREE.Vector3;
    size: { width: number; height: number };
    isSelected: boolean;
    isDragging: boolean;
    isResizing: boolean;
    mesh: THREE.Group;
    headerMesh: THREE.Mesh;
    contentMesh: THREE.Mesh;
    resizeHandleMesh: THREE.Mesh;
    closeButtonMesh: THREE.Mesh;
}

export interface AppControl {
    show(): void;
    hide(): void;
    createMediaPlayer(): void;
    createYouTube(): void;
}

export interface InteractionState {
    isPlacingWindow: boolean;
    isDraggingWindow: boolean;
    isResizingWindow: boolean;
    selectedWindow: AppWindow | null;
    dragOffset: THREE.Vector3;
    initialSize: { width: number; height: number };
    initialPosition: THREE.Vector3;
}

export interface ARCore {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controller: THREE.XRTargetRaySpace;
    controllerGrip: THREE.XRGripSpace;
    isARMode: boolean;
    init(): Promise<void>;
    render(): void;
    animate(): void;
}

export interface WindowManager {
    windows: AppWindow[];
    createWindow(type: 'mediaPlayer' | 'youtube', position: THREE.Vector3): AppWindow;
    selectWindow(window: AppWindow): void;
    deselectAll(): void;
    deleteWindow(window: AppWindow): void;
    updateWindowPositions(): void;
}

export interface MediaPlayer {
    videoElement: HTMLVideoElement;
    texture: THREE.VideoTexture;
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
    play(): void;
    pause(): void;
    toggleMute(): void;
    seek(time: number): void;
    updateTexture(): void;
}

export interface YouTubePlayer {
    iframeElement: HTMLIFrameElement;
    texture: THREE.CanvasTexture;
    url: string;
    updateTexture(): void;
} 