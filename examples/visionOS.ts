import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

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
    preMaximizeData?: {
        position: THREE.Vector3;
        size: { width: number; height: number };
    };
}

interface AppConfig {
    id: string;
    name: string;
    icon: string;
    color: string;
    path?: string;
}

class VisionOSAR {
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private controller: THREE.XRTargetRaySpace | null;
    private windows: Map<string, WindowData>;
    private activeWindow: string | null;
    private isDragging: boolean;
    private dragOffset: THREE.Vector3;
    private appDrawer: HTMLElement | null;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private apps: AppConfig[];

    constructor() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.controller = null;
        this.windows = new Map();
        this.activeWindow = null;
        this.isDragging = false;
        this.dragOffset = new THREE.Vector3();
        this.appDrawer = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.apps = [
            { id: 'calculator', name: 'Calculator', icon: '🧮', color: '#ff9a9e', path: 'apps/calculator.html' },
            { id: 'notes', name: 'Notes', icon: '📝', color: '#a8edea', path: 'apps/notes.html' },
            { id: 'browser', name: 'Browser', icon: '🌐', color: '#ffecd2', path: 'apps/browser.html' },
            { id: 'camera', name: 'Camera', icon: '📷', color: '#ff9a9e' },
            { id: 'youtube', name: 'YouTube', icon: '📺', color: '#ff6b6b' },
            { id: 'maps', name: 'Maps', icon: '🗺️', color: '#4facfe' }
        ];
        
        this.init();
    }

    private init(): void {
        this.setupRenderer();
        this.setupLighting();
        this.setupAR();
        this.setupController();
        this.setupAppDrawer();
        this.setupEventListeners();
        this.animate();
    }

    private setupRenderer(): void {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.renderer.xr.enabled = true;
        
        const container = document.createElement('div');
        document.body.appendChild(container);
        container.appendChild(this.renderer.domElement);
    }

    private setupLighting(): void {
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
        light.position.set(0.5, 1, 0.25);
        this.scene.add(light);
    }

    private setupAR(): void {
        document.body.appendChild(ARButton.createButton(this.renderer));
    }

    private setupController(): void {
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', this.onSelect.bind(this));
        this.scene.add(this.controller);
    }

    private setupAppDrawer(): void {
        this.appDrawer = document.getElementById('app-drawer');
        if (!this.appDrawer) return;

        // Clear existing content
        this.appDrawer.innerHTML = '';

        // Create app icons dynamically
        this.apps.forEach(app => {
            const appIcon = document.createElement('div');
            appIcon.className = 'app-icon';
            appIcon.setAttribute('data-app', app.id);
            
            appIcon.innerHTML = `
                <div class="app-icon-bg" style="background: linear-gradient(135deg, ${app.color} 0%, ${this.adjustColor(app.color, -20)} 100%);">
                    ${app.icon}
                </div>
                <span>${app.name}</span>
            `;
            
            appIcon.addEventListener('click', () => {
                this.openApp(app.id);
                this.updateActiveApp(app.id);
            });
            
            this.appDrawer!.appendChild(appIcon);
        });
    }

    private adjustColor(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    private updateActiveApp(appId: string): void {
        const appIcons = this.appDrawer?.querySelectorAll('.app-icon');
        appIcons?.forEach(icon => {
            icon.classList.remove('active');
            if (icon.getAttribute('data-app') === appId) {
                icon.classList.add('active');
            }
        });
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.renderer.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.renderer.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
    }

    private onPointerDown(event: PointerEvent): void {
        event.preventDefault();
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        for (const intersect of intersects) {
            const object = intersect.object;
            
            if (object.userData.isCloseButton) {
                this.closeWindow(object.userData.windowId);
                return;
            }
            
            if (object.userData.isTitleBar) {
                this.startDragging(object.userData.windowId, intersect.point);
                return;
            }

            if (object.userData.isMaximizeButton) {
                this.toggleMaximize(object.userData.windowId);
                return;
            }

            if (object.userData.isMinimizeButton) {
                this.minimizeWindow(object.userData.windowId);
                return;
            }
        }
    }

    private onPointerMove(event: PointerEvent): void {
        if (this.isDragging && this.activeWindow) {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(this.camera.quaternion);
            
            const distance = 0.5;
            const newPosition = new THREE.Vector3();
            newPosition.copy(this.camera.position).add(direction.multiplyScalar(distance));
            
            const windowData = this.windows.get(this.activeWindow);
            if (windowData) {
                windowData.group.position.copy(newPosition);
                windowData.group.quaternion.copy(this.camera.quaternion);
                windowData.position.copy(newPosition);
                this.updateIframePosition(windowData);
            }
        }
    }

    private onPointerUp(event: PointerEvent): void {
        this.isDragging = false;
    }

    private startDragging(windowId: string, point: THREE.Vector3): void {
        this.isDragging = true;
        this.activeWindow = windowId;
        const windowData = this.windows.get(windowId);
        if (windowData) {
            this.dragOffset.subVectors(windowData.group.position, point);
        }
    }

    private onSelect(): void {
        if (!this.activeWindow) {
            this.createWindow('welcome');
        }
    }

    private createWindow(appName: string, position?: THREE.Vector3): string {
        const windowId = `window_${Date.now()}`;
        const windowGroup = new THREE.Group();
        
        const width = 1.2;
        const height = 0.8;
        const depth = 0.02;
        
        // Window frame
        const frameGeometry = new THREE.BoxGeometry(width + 0.05, height + 0.05, depth);
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            transparent: true,
            opacity: 0.9,
            shininess: 100
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        windowGroup.add(frame);
        
        // Title bar
        const titleBarGeometry = new THREE.PlaneGeometry(width, 0.08);
        const titleBarMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x34495e,
            transparent: true,
            opacity: 0.95
        });
        const titleBar = new THREE.Mesh(titleBarGeometry, titleBarMaterial);
        titleBar.position.z = depth / 2 + 0.001;
        titleBar.position.y = height / 2 - 0.04;
        titleBar.userData.isTitleBar = true;
        titleBar.userData.windowId = windowId;
        windowGroup.add(titleBar);
        
        // Window controls
        this.createWindowControls(windowGroup, windowId, width, height, depth);
        
        // Content area
        const contentGeometry = new THREE.PlaneGeometry(width - 0.1, height - 0.15);
        const contentMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xecf0f1,
            transparent: true,
            opacity: 0.95
        });
        const content = new THREE.Mesh(contentGeometry, contentMaterial);
        content.position.z = depth / 2 + 0.001;
        content.position.y = -0.02;
        content.userData.isContent = true;
        content.userData.windowId = windowId;
        windowGroup.add(content);
        
        // Position window
        const finalPosition = position || this.getDefaultWindowPosition();
        windowGroup.position.copy(finalPosition);
        windowGroup.quaternion.copy(this.camera.quaternion);
        
        // Store window data
        const windowData: WindowData = {
            group: windowGroup,
            appName: appName,
            isDragging: false,
            dragOffset: new THREE.Vector3(),
            content: content,
            iframe: null,
            position: finalPosition.clone(),
            size: { width, height },
            isMaximized: false
        };
        
        this.windows.set(windowId, windowData);
        this.scene.add(windowGroup);
        this.activeWindow = windowId;
        
        this.loadAppContent(windowId, appName);
        
        return windowId;
    }

    private createWindowControls(group: THREE.Group, windowId: string, width: number, height: number, depth: number): void {
        // Minimize button
        const minimizeGeometry = new THREE.PlaneGeometry(0.06, 0.06);
        const minimizeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf39c12,
            transparent: true,
            opacity: 0.9
        });
        const minimizeButton = new THREE.Mesh(minimizeGeometry, minimizeMaterial);
        minimizeButton.position.set(width / 2 - 0.2, height / 2 - 0.04, depth / 2 + 0.002);
        minimizeButton.userData.isMinimizeButton = true;
        minimizeButton.userData.windowId = windowId;
        group.add(minimizeButton);

        // Maximize button
        const maximizeGeometry = new THREE.PlaneGeometry(0.06, 0.06);
        const maximizeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x27ae60,
            transparent: true,
            opacity: 0.9
        });
        const maximizeButton = new THREE.Mesh(maximizeGeometry, maximizeMaterial);
        maximizeButton.position.set(width / 2 - 0.14, height / 2 - 0.04, depth / 2 + 0.002);
        maximizeButton.userData.isMaximizeButton = true;
        maximizeButton.userData.windowId = windowId;
        group.add(maximizeButton);

        // Close button
        const closeGeometry = new THREE.PlaneGeometry(0.06, 0.06);
        const closeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xe74c3c,
            transparent: true,
            opacity: 0.9
        });
        const closeButton = new THREE.Mesh(closeGeometry, closeMaterial);
        closeButton.position.set(width / 2 - 0.08, height / 2 - 0.04, depth / 2 + 0.002);
        closeButton.userData.isCloseButton = true;
        closeButton.userData.windowId = windowId;
        group.add(closeButton);
    }

    private getDefaultWindowPosition(): THREE.Vector3 {
        if (this.controller) {
            return new THREE.Vector3(0, 0, -0.5).applyMatrix4(this.controller.matrixWorld);
        }
        return new THREE.Vector3(0, 0, -0.5);
    }

    private loadAppContent(windowId: string, appName: string): void {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const content = windowData.content;
        
        // Remove existing content
        while (content.children.length > 0) {
            content.remove(content.children[0]);
        }
        
        // Remove existing iframe
        if (windowData.iframe) {
            document.body.removeChild(windowData.iframe);
            windowData.iframe = null;
        }
        
        const app = this.apps.find(a => a.id === appName);
        
        if (app?.path) {
            this.createIframeApp(content, app.path, windowData);
        } else {
            this.createDefaultApp(content, appName);
        }
    }

    private createIframeApp(content: THREE.Mesh, appPath: string, windowData: WindowData): void {
        const iframe = document.createElement('iframe');
        iframe.src = appPath;
        iframe.style.position = 'absolute';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '5px';
        iframe.style.zIndex = '1000';
        iframe.style.pointerEvents = 'auto';
        
        document.body.appendChild(iframe);
        windowData.iframe = iframe;
        
        this.updateIframePosition(windowData);
        
        // Create placeholder mesh
        const placeholderGeometry = new THREE.PlaneGeometry(1.0, 0.6);
        const placeholderMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
        });
        const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
        placeholder.position.z = 0.001;
        content.add(placeholder);
    }

    private updateIframePosition(windowData: WindowData): void {
        if (!windowData.iframe || !windowData.content) return;
        
        const contentRect = windowData.content.getBoundingClientRect();
        windowData.iframe.style.left = contentRect.left + 'px';
        windowData.iframe.style.top = contentRect.top + 'px';
        windowData.iframe.style.width = contentRect.width + 'px';
        windowData.iframe.style.height = contentRect.height + 'px';
    }

    private createDefaultApp(content: THREE.Mesh, appName: string): void {
        const defaultGeometry = new THREE.PlaneGeometry(0.9, 0.6);
        const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
        const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
        defaultMesh.position.z = 0.001;
        content.add(defaultMesh);
        
        this.addTextToMesh(defaultMesh, appName, 0xffffff, 0.15, 0, 0.2);
        this.addTextToMesh(defaultMesh, 'App Content', 0x2c3e50, 0.08, 0, 0);
    }

    private addTextToMesh(mesh: THREE.Mesh, text: string, color: number, size: number, x: number, y: number): void {
        const textGeometry = new THREE.PlaneGeometry(size * text.length * 0.6, size * 0.3);
        const textMaterial = new THREE.MeshPhongMaterial({ color });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, 0.002);
        mesh.add(textMesh);
    }

    private openApp(appName: string): void {
        if (this.activeWindow) {
            this.loadAppContent(this.activeWindow, appName);
            const windowData = this.windows.get(this.activeWindow);
            if (windowData) {
                windowData.appName = appName;
            }
        } else {
            this.createWindow(appName);
        }
    }

    private closeWindow(windowId: string): void {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            if (windowData.iframe) {
                document.body.removeChild(windowData.iframe);
            }
            
            this.scene.remove(windowData.group);
            this.windows.delete(windowId);
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
            }
        }
    }

    private minimizeWindow(windowId: string): void {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            windowData.group.visible = false;
            if (windowData.iframe) {
                windowData.iframe.style.display = 'none';
            }
        }
    }

    private toggleMaximize(windowId: string): void {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        if (!windowData.isMaximized) {
            // Save current state
            windowData.preMaximizeData = {
                position: windowData.position.clone(),
                size: { ...windowData.size }
            };
            
            // Maximize
            windowData.size = { width: 2.0, height: 1.5 };
            windowData.isMaximized = true;
        } else {
            // Restore
            if (windowData.preMaximizeData) {
                windowData.position.copy(windowData.preMaximizeData.position);
                windowData.size = windowData.preMaximizeData.size;
            }
            windowData.isMaximized = false;
        }
        
        this.updateWindowGeometry(windowData);
    }

    private updateWindowGeometry(windowData: WindowData): void {
        const { width, height } = windowData.size;
        const depth = 0.02;
        
        // Update frame
        const frame = windowData.group.children[0] as THREE.Mesh;
        frame.geometry.dispose();
        frame.geometry = new THREE.BoxGeometry(width + 0.05, height + 0.05, depth);
        
        // Update content
        const content = windowData.content;
        content.geometry.dispose();
        content.geometry = new THREE.PlaneGeometry(width - 0.1, height - 0.15);
        
        this.updateIframePosition(windowData);
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        this.windows.forEach((windowData) => {
            this.updateIframePosition(windowData);
        });
    }

    private animate(): void {
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the visionOS AR interface
new VisionOSAR();