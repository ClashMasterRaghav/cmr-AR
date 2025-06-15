import * as THREE from 'three';
import { AppWindow, WindowManager } from './types';
import { ARCoreImpl } from './ar_core';
import { MediaPlayerImpl } from './media_player';
import { YouTubePlayerImpl } from './youtube_player';

export class WindowManagerImpl implements WindowManager {
    public windows: AppWindow[] = [];
    private arCore: ARCoreImpl;
    private windowCounter: number = 0;

    constructor(arCore: ARCoreImpl) {
        this.arCore = arCore;
    }

    public createWindow(type: 'mediaPlayer' | 'youtube', position: THREE.Vector3): AppWindow {
        const windowId = `window_${this.windowCounter++}`;
        const title = type === 'mediaPlayer' ? 'Media Player' : 'YouTube';
        
        // Create window mesh
        const windowGroup = new THREE.Group();
        windowGroup.position.copy(position);
        
        // Create header
        const headerMesh = this.createHeader(title, windowId);
        windowGroup.add(headerMesh);
        
        // Create content area
        const contentMesh = this.createContentArea(type, windowId);
        windowGroup.add(contentMesh);
        
        // Create resize handle
        const resizeHandleMesh = this.createResizeHandle(windowId);
        windowGroup.add(resizeHandleMesh);
        
        // Create close button
        const closeButtonMesh = this.createCloseButton(windowId);
        windowGroup.add(closeButtonMesh);

        const window: AppWindow = {
            id: windowId,
            title,
            type,
            position: position.clone(),
            size: { width: 1.2, height: 0.8 },
            isSelected: false,
            isDragging: false,
            isResizing: false,
            mesh: windowGroup,
            headerMesh,
            contentMesh,
            resizeHandleMesh,
            closeButtonMesh
        };

        this.windows.push(window);
        this.arCore.scene.add(windowGroup);
        
        // Add entrance animation
        this.animateWindowEntrance(window);
        
        return window;
    }

    private createHeader(title: string, windowId: string): THREE.Mesh {
        const headerGeometry = new THREE.PlaneGeometry(1.2, 0.1);
        const headerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.9
        });
        const headerMesh = new THREE.Mesh(headerGeometry, headerMaterial);
        headerMesh.position.set(0, 0.35, 0.001);
        headerMesh.userData = { 
            type: 'header', 
            windowId,
            isDraggable: true 
        };
        return headerMesh;
    }

    private createContentArea(type: 'mediaPlayer' | 'youtube', windowId: string): THREE.Mesh {
        const contentGeometry = new THREE.PlaneGeometry(1.2, 0.7);
        let contentMaterial: THREE.MeshBasicMaterial;

        if (type === 'mediaPlayer') {
            const mediaPlayer = new MediaPlayerImpl();
            contentMaterial = new THREE.MeshBasicMaterial({ 
                map: mediaPlayer.texture,
                transparent: true,
                opacity: 0.9
            });
        } else {
            const youtubePlayer = new YouTubePlayerImpl();
            contentMaterial = new THREE.MeshBasicMaterial({ 
                map: youtubePlayer.texture,
                transparent: true,
                opacity: 0.9
            });
        }

        const contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
        contentMesh.position.set(0, 0, 0);
        contentMesh.userData = { 
            type: 'content', 
            windowId,
            contentType: type 
        };
        return contentMesh;
    }

    private createResizeHandle(windowId: string): THREE.Mesh {
        const resizeGeometry = new THREE.PlaneGeometry(0.05, 0.05);
        const resizeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x666666,
            transparent: true,
            opacity: 0.8
        });
        const resizeMesh = new THREE.Mesh(resizeGeometry, resizeMaterial);
        resizeMesh.position.set(0.575, -0.325, 0.002);
        resizeMesh.userData = { 
            type: 'resizeHandle', 
            windowId,
            isResizable: true 
        };
        return resizeMesh;
    }

    private createCloseButton(windowId: string): THREE.Mesh {
        const closeGeometry = new THREE.PlaneGeometry(0.08, 0.08);
        const closeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xe74c3c,
            transparent: true,
            opacity: 0.9
        });
        const closeMesh = new THREE.Mesh(closeGeometry, closeMaterial);
        closeMesh.position.set(0.56, 0.35, 0.003);
        closeMesh.userData = { 
            type: 'closeButton', 
            windowId,
            isCloseable: true 
        };
        return closeMesh;
    }

    private animateWindowEntrance(window: AppWindow): void {
        const originalScale = window.mesh.scale.clone();
        window.mesh.scale.set(0, 0, 0);
        
        const animate = () => {
            window.mesh.scale.lerp(originalScale, 0.1);
            if (window.mesh.scale.distanceTo(originalScale) > 0.01) {
                requestAnimationFrame(animate);
            } else {
                window.mesh.scale.copy(originalScale);
            }
        };
        animate();
    }

    public selectWindow(window: AppWindow): void {
        this.deselectAll();
        window.isSelected = true;
        
        // Visual feedback for selection
        const headerMaterial = window.headerMesh.material as THREE.MeshBasicMaterial;
        headerMaterial.color.setHex(0x5cb85c);
    }

    public deselectAll(): void {
        this.windows.forEach(window => {
            window.isSelected = false;
            const headerMaterial = window.headerMesh.material as THREE.MeshBasicMaterial;
            headerMaterial.color.setHex(0x4a90e2);
        });
    }

    public deleteWindow(window: AppWindow): void {
        const index = this.windows.indexOf(window);
        if (index > -1) {
            this.windows.splice(index, 1);
            this.arCore.scene.remove(window.mesh);
            
            // Dispose of geometries and materials
            window.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }

    public updateWindowPositions(): void {
        // This will be called during drag operations
        this.windows.forEach(window => {
            if (window.isDragging) {
                // Update position based on controller
                const controllerPosition = new THREE.Vector3();
                this.arCore.controller.getWorldPosition(controllerPosition);
                const direction = new THREE.Vector3(0, 0, -1);
                direction.applyQuaternion(this.arCore.controller.quaternion);
                
                const targetPosition = controllerPosition.clone().addScaledVector(direction, 0.8);
                window.mesh.position.lerp(targetPosition, 0.1);
                window.position.copy(window.mesh.position);
            }
        });
    }
} 