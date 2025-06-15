import * as THREE from 'three';
import { MediaPlayer } from './types';

export class MediaPlayerImpl implements MediaPlayer {
    public videoElement: HTMLVideoElement;
    public texture: THREE.VideoTexture;
    public isPlaying: boolean = false;
    public isMuted: boolean = true;
    public currentTime: number = 0;
    public duration: number = 0;

    constructor() {
        this.videoElement = document.createElement('video');
        this.setupVideo();
        this.texture = new THREE.VideoTexture(this.videoElement);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.format = THREE.RGBAFormat;
    }

    private setupVideo(): void {
        this.videoElement.loop = true;
        this.videoElement.muted = true; // Required for autoplay
        this.videoElement.playsInline = true;
        this.videoElement.crossOrigin = 'anonymous';
        
        // Add video sources
        const sources = [
            'textures/ar_videos/ar_Tek_It.mp4',
            'textures/sintel.mp4',
            'textures/pano.mp4'
        ];

        sources.forEach(src => {
            const source = document.createElement('source');
            source.src = src;
            source.type = 'video/mp4';
            this.videoElement.appendChild(source);
        });

        // Event listeners
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.duration = this.videoElement.duration;
        });

        this.videoElement.addEventListener('timeupdate', () => {
            this.currentTime = this.videoElement.currentTime;
        });

        this.videoElement.addEventListener('play', () => {
            this.isPlaying = true;
        });

        this.videoElement.addEventListener('pause', () => {
            this.isPlaying = false;
        });

        // Try to load and play
        this.videoElement.load();
        this.play();
    }

    public play(): void {
        this.videoElement.play().catch(error => {
            console.warn('Could not play video:', error);
        });
    }

    public pause(): void {
        this.videoElement.pause();
    }

    public toggleMute(): void {
        this.isMuted = !this.isMuted;
        this.videoElement.muted = this.isMuted;
    }

    public seek(time: number): void {
        this.videoElement.currentTime = time;
    }

    public updateTexture(): void {
        if (this.texture) {
            this.texture.needsUpdate = true;
        }
    }
} 