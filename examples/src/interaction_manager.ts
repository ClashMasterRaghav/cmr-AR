import * as THREE from 'three';
import { InteractionState, AppWindow } from './types';
import { ARCoreImpl } from './ar_core';
import { WindowManagerImpl } from './window_manager';

export class InteractionManager {
    private arCore: ARCoreImpl;
    private windowManager: WindowManagerImpl;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private state: InteractionState;

    constructor(arCore: ARCoreImpl, windowManager: WindowManagerImpl) {
        this.arCore = arCore;
        this.windowManager = windowManager;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.state = {
            isPlacingWindow: false,
            isDraggingWindow: false,
            isResizingWindow: false,
            selectedWindow: null,
            dragOffset: new THREE.Vector3(),
            initialSize: { width: 1.2, height: 0.8 },
            initialPosition: new THREE.Vector3()
        };

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Controller events
        this.arCore.controller.addEventListener('select', this.onControllerSelect.bind(this));
        this.arCore.controller.addEventListener('selectstart', this.onControllerSelectStart.bind(this));
        this.arCore.controller.addEventListener('selectend', this.onControllerSelectEnd.bind(this));

        // Touch events for mobile
        this.arCore.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.arCore.renderer.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
        this.arCore.renderer.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    }

    private onControllerSelect(event: any): void {
        this.performRaycast();
    }

    private onControllerSelectStart(event: any): void {
        // Handle drag start
        if (this.state.selectedWindow) {
            this.startDragging();
        }
    }

    private onControllerSelectEnd(event: any): void {
        // Handle drag end
        if (this.state.isDraggingWindow) {
            this.stopDragging();
        }
    }

    private onTouchStart(event: TouchEvent): void {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            this.performRaycast();
        }
    }

    private onTouchMove(event: TouchEvent): void {
        event.preventDefault();
        
        if (event.touches.length === 1 && this.state.isDraggingWindow) {
            const touch = event.touches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            this.updateDragPosition();
        }
    }

    private onTouchEnd(event: TouchEvent): void {
        event.preventDefault();
        
        if (this.state.isDraggingWindow) {
            this.stopDragging();
        }
    }

    private performRaycast(): void {
        // Set up raycaster from controller or camera
        if (this.arCore.isARMode) {
            // Use controller for AR mode
            const tempMatrix = new THREE.Matrix4();
            tempMatrix.identity().extractRotation(this.arCore.controller.matrixWorld);
            this.raycaster.ray.origin.setFromMatrixPosition(this.arCore.controller.matrixWorld);
            this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        } else {
            // Use camera for non-AR mode
            this.raycaster.setFromCamera(this.mouse, this.arCore.camera);
        }

        // Get all interactive objects
        const interactiveObjects: THREE.Object3D[] = [];
        this.windowManager.windows.forEach(window => {
            interactiveObjects.push(window.mesh);
        });

        const intersects = this.raycaster.intersectObjects(interactiveObjects, true);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            this.handleIntersection(intersectedObject);
        } else {
            // Deselect if clicking on empty space
            this.windowManager.deselectAll();
            this.state.selectedWindow = null;
        }
    }

    private handleIntersection(object: THREE.Object3D): void {
        // Find the window this object belongs to
        const window = this.findWindowFromObject(object);
        
        if (!window) return;

        // Check what part of the window was clicked
        if (object.userData.type === 'closeButton') {
            this.windowManager.deleteWindow(window);
        } else if (object.userData.type === 'resizeHandle') {
            this.startResizing(window);
        } else if (object.userData.type === 'header') {
            this.windowManager.selectWindow(window);
            this.state.selectedWindow = window;
            this.startDragging();
        } else {
            // Clicked on content area
            this.windowManager.selectWindow(window);
            this.state.selectedWindow = window;
        }
    }

    private findWindowFromObject(object: THREE.Object3D): AppWindow | null {
        // Traverse up the object hierarchy to find the window
        let current = object;
        while (current && current.parent) {
            const window = this.windowManager.windows.find(w => w.mesh === current);
            if (window) return window;
            current = current.parent;
        }
        return null;
    }

    private startDragging(): void {
        if (!this.state.selectedWindow) return;

        this.state.isDraggingWindow = true;
        this.state.selectedWindow.isDragging = true;
        
        // Calculate drag offset
        const controllerPosition = new THREE.Vector3();
        this.arCore.controller.getWorldPosition(controllerPosition);
        this.state.dragOffset = controllerPosition.clone().sub(this.state.selectedWindow.mesh.position);
    }

    private stopDragging(): void {
        if (this.state.selectedWindow) {
            this.state.selectedWindow.isDragging = false;
        }
        this.state.isDraggingWindow = false;
    }

    private startResizing(window: AppWindow): void {
        this.state.isResizingWindow = true;
        window.isResizing = true;
        this.state.initialSize = { ...window.size };
        this.state.initialPosition = window.mesh.position.clone();
    }

    private stopResizing(): void {
        if (this.state.selectedWindow) {
            this.state.selectedWindow.isResizing = false;
        }
        this.state.isResizingWindow = false;
    }

    private updateDragPosition(): void {
        if (!this.state.isDraggingWindow || !this.state.selectedWindow) return;

        // Update window position based on controller or touch
        if (this.arCore.isARMode) {
            const controllerPosition = new THREE.Vector3();
            this.arCore.controller.getWorldPosition(controllerPosition);
            const newPosition = controllerPosition.clone().sub(this.state.dragOffset);
            this.state.selectedWindow.mesh.position.copy(newPosition);
            this.state.selectedWindow.position.copy(newPosition);
        }
    }

    public update(): void {
        // Update window positions during drag operations
        this.windowManager.updateWindowPositions();
    }
} 