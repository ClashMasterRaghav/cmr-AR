import * as THREE from 'three';
import { YouTubePlayer } from './types';

export class YouTubePlayerImpl implements YouTubePlayer {
    public iframeElement: HTMLIFrameElement;
    public texture: THREE.CanvasTexture;
    public url: string = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&enablejsapi=1';

    constructor() {
        this.iframeElement = document.createElement('iframe');
        this.setupIframe();
        this.texture = this.createIframeTexture();
    }

    private setupIframe(): void {
        this.iframeElement.src = this.url;
        this.iframeElement.width = '1024';
        this.iframeElement.height = '768';
        this.iframeElement.style.border = 'none';
        this.iframeElement.style.display = 'none';
        this.iframeElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        this.iframeElement.allowFullscreen = true;
        
        document.body.appendChild(this.iframeElement);
    }

    private createIframeTexture(): THREE.CanvasTexture {
        // Create a canvas to capture iframe content
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // Create a placeholder texture for now
        // In a real implementation, you'd need to capture the iframe content
        // This is complex due to CORS restrictions
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add YouTube-like placeholder
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YouTube', canvas.width / 2, canvas.height / 2 + 100);
        
        ctx.font = '24px Arial';
        ctx.fillText('Video Player', canvas.width / 2, canvas.height / 2 + 140);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        return texture;
    }

    public updateTexture(): void {
        // In a real implementation, this would update the canvas with iframe content
        // For now, we'll just mark the texture as needing update
        if (this.texture) {
            this.texture.needsUpdate = true;
        }
    }

    public setUrl(url: string): void {
        this.url = url;
        this.iframeElement.src = url;
    }
} 