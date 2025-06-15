import * as THREE from 'three';
import { AppControl } from './types';
import { WindowManagerImpl } from './window_manager';
import { ARCoreImpl } from './ar_core';

export class AppControlImpl implements AppControl {
    private controlElement: HTMLElement;
    private mediaPlayerBtn: HTMLButtonElement;
    private youtubeBtn: HTMLButtonElement;
    private windowManager: WindowManagerImpl;
    private arCore: ARCoreImpl;

    constructor(windowManager: WindowManagerImpl, arCore: ARCoreImpl) {
        this.windowManager = windowManager;
        this.arCore = arCore;
        this.controlElement = document.getElementById('appControl') as HTMLElement;
        this.mediaPlayerBtn = document.getElementById('mediaPlayerBtn') as HTMLButtonElement;
        this.youtubeBtn = document.getElementById('youtubeBtn') as HTMLButtonElement;
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.mediaPlayerBtn.addEventListener('click', () => {
            this.createMediaPlayer();
        });

        this.youtubeBtn.addEventListener('click', () => {
            this.createYouTube();
        });
    }

    public show(): void {
        if (this.controlElement) {
            this.controlElement.style.display = 'block';
        }
    }

    public hide(): void {
        if (this.controlElement) {
            this.controlElement.style.display = 'none';
        }
    }

    public createMediaPlayer(): void {
        // Create window in front of camera
        const position = this.getPositionInFrontOfCamera();
        this.windowManager.createWindow('mediaPlayer', position);
        console.log('Media Player window created');
    }

    public createYouTube(): void {
        // Create window in front of camera
        const position = this.getPositionInFrontOfCamera();
        this.windowManager.createWindow('youtube', position);
        console.log('YouTube window created');
    }

    private getPositionInFrontOfCamera(): THREE.Vector3 {
        // Get camera position and direction
        const cameraPosition = this.arCore.camera.position.clone();
        const cameraDirection = new THREE.Vector3(0, 0, -1);
        cameraDirection.applyQuaternion(this.arCore.camera.quaternion);
        
        // Position window 1.5 units in front of camera
        return cameraPosition.clone().addScaledVector(cameraDirection, 1.5);
    }
} 