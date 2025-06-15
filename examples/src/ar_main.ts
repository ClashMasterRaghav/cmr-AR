import * as THREE from 'three';
import { ARCoreImpl } from './ar_core';
import { WindowManagerImpl } from './window_manager';
import { AppControlImpl } from './app_control';
import { InteractionManager } from './interaction_manager';

class ARApplication {
    private arCore: ARCoreImpl;
    private windowManager: WindowManagerImpl;
    private appControl: AppControlImpl;
    private interactionManager: InteractionManager;
    private isInitialized: boolean = false;

    constructor() {
        this.arCore = new ARCoreImpl();
        this.windowManager = new WindowManagerImpl(this.arCore);
        this.appControl = new AppControlImpl(this.windowManager, this.arCore);
        this.interactionManager = new InteractionManager(this.arCore, this.windowManager);
    }

    public async init(): Promise<void> {
        try {
            console.log("Initializing AR Application...");
            
            // Check WebXR support
            const isWebXRSupported = await this.checkWebXRSupport();
            if (!isWebXRSupported) {
                this.showError("WebXR AR is not supported on this device or browser");
                return;
            }

            // Initialize AR core
            await this.arCore.init();
            
            // Show app control panel
            this.appControl.show();
            
            // Set up animation loop
            this.setupAnimationLoop();
            
            this.isInitialized = true;
            this.hideLoading();
            
            console.log("AR Application initialized successfully");
        } catch (error) {
            console.error("Failed to initialize AR Application:", error);
            this.showError(`Failed to initialize AR: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async checkWebXRSupport(): Promise<boolean> {
        if ('xr' in navigator && navigator.xr) {
            try {
                const supported = await navigator.xr.isSessionSupported('immersive-ar');
                console.log('WebXR AR supported:', supported);
                return supported;
            } catch (error) {
                console.error('Error checking AR support:', error);
                return false;
            }
        } else {
            console.log('WebXR not supported in this browser');
            return false;
        }
    }

    private setupAnimationLoop(): void {
        const animate = () => {
            if (this.isInitialized) {
                // Update interaction manager
                this.interactionManager.update();
                
                // Update textures
                this.updateTextures();
                
                // Render the scene
                this.arCore.render();
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    private updateTextures(): void {
        // Update video textures for media players
        this.windowManager.windows.forEach(window => {
            if (window.type === 'mediaPlayer') {
                // Update video texture if needed
                const material = window.contentMesh.material as THREE.MeshBasicMaterial;
                if (material.map) {
                    material.map.needsUpdate = true;
                }
            }
        });
    }

    private hideLoading(): void {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
    }

    private showError(message: string): void {
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
        
        if (errorMessage) {
            errorMessage.innerHTML = `
                <h2>AR Initialization Failed</h2>
                <p>${message}</p>
                <p>Please try reloading the page or using a different device.</p>
            `;
            errorMessage.style.display = 'block';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ARApplication();
    app.init().catch(error => {
        console.error("Application initialization failed:", error);
    });
}); 