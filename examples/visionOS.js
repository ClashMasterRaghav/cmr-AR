import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

class VisionOSAR {
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
        
        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupLighting();
        this.setupAR();
        this.setupController();
        this.setupAppDrawer();
        this.setupEventListeners();
        this.animate();
    }

    setupRenderer() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.renderer.xr.enabled = true;
        
        const container = document.createElement('div');
        document.body.appendChild(container);
        container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
        light.position.set(0.5, 1, 0.25);
        this.scene.add(light);
    }

    setupAR() {
        document.body.appendChild(ARButton.createButton(this.renderer));
    }

    setupController() {
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', this.onSelect.bind(this));
        this.scene.add(this.controller);
    }

    setupAppDrawer() {
        this.appDrawer = document.getElementById('app-drawer');
        const appIcons = this.appDrawer.querySelectorAll('.app-icon');
        
        appIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                const appName = e.currentTarget.getAttribute('data-app');
                this.openApp(appName);
                
                // Update active state
                appIcons.forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Add touch/mouse events for window dragging
        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.renderer.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.renderer.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
    }

    onPointerDown(event) {
        event.preventDefault();
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for window interactions
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
        }
    }

    onPointerMove(event) {
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
            }
        }
    }

    onPointerUp(event) {
        this.isDragging = false;
    }

    startDragging(windowId, point) {
        this.isDragging = true;
        this.activeWindow = windowId;
        const windowData = this.windows.get(windowId);
        if (windowData) {
            this.dragOffset.subVectors(windowData.group.position, point);
        }
    }

    onSelect() {
        if (!this.activeWindow) {
            this.createWindow('welcome');
        }
    }

    createWindow(appName, position = null) {
        const windowId = `window_${Date.now()}`;
        const windowGroup = new THREE.Group();
        
        // Window dimensions
        const width = 1.2;
        const height = 0.8;
        const depth = 0.02;
        
        // Create window frame with glass effect
        const frameGeometry = new THREE.BoxGeometry(width + 0.05, height + 0.05, depth);
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            transparent: true,
            opacity: 0.9,
            shininess: 100
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        windowGroup.add(frame);
        
        // Create title bar
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
        
        // Create close button
        const closeButtonGeometry = new THREE.PlaneGeometry(0.06, 0.06);
        const closeButtonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xe74c3c,
            transparent: true,
            opacity: 0.9
        });
        const closeButton = new THREE.Mesh(closeButtonGeometry, closeButtonMaterial);
        closeButton.position.set(width / 2 - 0.08, height / 2 - 0.04, depth / 2 + 0.002);
        closeButton.userData.isCloseButton = true;
        closeButton.userData.windowId = windowId;
        windowGroup.add(closeButton);
        
        // Create content area
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
        if (position) {
            windowGroup.position.copy(position);
        } else {
            windowGroup.position.set(0, 0, -0.5).applyMatrix4(this.controller.matrixWorld);
            windowGroup.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
        }
        
        // Store window data
        const windowData = {
            group: windowGroup,
            appName: appName,
            isDragging: false,
            dragOffset: new THREE.Vector3(),
            content: content,
            iframe: null
        };
        
        this.windows.set(windowId, windowData);
        this.scene.add(windowGroup);
        this.activeWindow = windowId;
        
        // Load app content
        this.loadAppContent(windowId, appName);
        
        return windowId;
    }

    loadAppContent(windowId, appName) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const content = windowData.content;
        
        // Remove existing content
        while (content.children.length > 0) {
            content.remove(content.children[0]);
        }
        
        // Remove existing iframe if any
        if (windowData.iframe) {
            document.body.removeChild(windowData.iframe);
            windowData.iframe = null;
        }
        
        switch (appName) {
            case 'calculator':
                this.createIframeApp(content, 'apps/calculator.html', windowData);
                break;
            case 'notes':
                this.createIframeApp(content, 'apps/notes.html', windowData);
                break;
            case 'browser':
                this.createIframeApp(content, 'apps/browser.html', windowData);
                break;
            case 'camera':
                this.createCameraApp(content);
                break;
            case 'youtube':
                this.createYouTubeApp(content);
                break;
            case 'maps':
                this.createMapsApp(content);
                break;
            case 'welcome':
                this.createWelcomeApp(content);
                break;
            default:
                this.createDefaultApp(content, appName);
        }
    }

    createIframeApp(content, appPath, windowData) {
        // Create iframe element
        const iframe = document.createElement('iframe');
        iframe.src = appPath;
        iframe.style.position = 'absolute';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '5px';
        iframe.style.zIndex = '1000';
        iframe.style.pointerEvents = 'auto';
        
        // Position iframe over the content area
        const contentRect = content.getBoundingClientRect();
        iframe.style.left = contentRect.left + 'px';
        iframe.style.top = contentRect.top + 'px';
        iframe.style.width = contentRect.width + 'px';
        iframe.style.height = contentRect.height + 'px';
        
        document.body.appendChild(iframe);
        windowData.iframe = iframe;
        
        // Create a placeholder mesh for the content area
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

    createCameraApp(content) {
        const cameraGeometry = new THREE.PlaneGeometry(0.9, 0.6);
        const cameraMaterial = new THREE.MeshPhongMaterial({ color: 0x9b59b6 });
        const cameraMesh = new THREE.Mesh(cameraGeometry, cameraMaterial);
        cameraMesh.position.z = 0.001;
        content.add(cameraMesh);
        
        this.addTextToMesh(cameraMesh, 'Camera', 0xffffff, 0.15, 0, 0.2);
        this.addTextToMesh(cameraMesh, '📷', 0xffffff, 0.2, 0, 0);
        this.addTextToMesh(cameraMesh, 'Tap to capture', 0x2c3e50, 0.08, 0, -0.2);
    }

    createYouTubeApp(content) {
        const youtubeGeometry = new THREE.PlaneGeometry(0.9, 0.6);
        const youtubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const youtubeMesh = new THREE.Mesh(youtubeGeometry, youtubeMaterial);
        youtubeMesh.position.z = 0.001;
        content.add(youtubeMesh);
        
        this.addTextToMesh(youtubeMesh, 'YouTube', 0xffffff, 0.15, 0, 0.2);
        this.addTextToMesh(youtubeMesh, '📺', 0xffffff, 0.2, 0, 0);
        this.addTextToMesh(youtubeMesh, 'Search videos...', 0x2c3e50, 0.08, 0, -0.2);
    }

    createMapsApp(content) {
        const mapsGeometry = new THREE.PlaneGeometry(0.9, 0.6);
        const mapsMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
        const mapsMesh = new THREE.Mesh(mapsGeometry, mapsMaterial);
        mapsMesh.position.z = 0.001;
        content.add(mapsMesh);
        
        this.addTextToMesh(mapsMesh, 'Maps', 0xffffff, 0.15, 0, 0.2);
        this.addTextToMesh(mapsMesh, '🗺️', 0xffffff, 0.2, 0, 0);
        this.addTextToMesh(mapsMesh, 'Find location...', 0x2c3e50, 0.08, 0, -0.2);
    }

    createWelcomeApp(content) {
        const welcomeGeometry = new THREE.PlaneGeometry(0.9, 0.6);
        const welcomeMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
        const welcomeMesh = new THREE.Mesh(welcomeGeometry, welcomeMaterial);
        welcomeMesh.position.z = 0.001;
        content.add(welcomeMesh);
        
        this.addTextToMesh(welcomeMesh, 'Welcome to CMR visionOS', 0xffffff, 0.1, 0, 0.2);
        this.addTextToMesh(welcomeMesh, '👋', 0xffffff, 0.2, 0, 0);
        this.addTextToMesh(welcomeMesh, 'Use app drawer to open apps', 0xecf0f1, 0.08, 0, -0.2);
    }

    createDefaultApp(content, appName) {
        const defaultGeometry = new THREE.PlaneGeometry(0.9, 0.6);
        const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
        const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
        defaultMesh.position.z = 0.001;
        content.add(defaultMesh);
        
        this.addTextToMesh(defaultMesh, appName, 0xffffff, 0.15, 0, 0.2);
        this.addTextToMesh(defaultMesh, 'App Content', 0x2c3e50, 0.08, 0, 0);
    }

    addTextToMesh(mesh, text, color, size, x, y) {
        // Simple text representation using colored rectangles
        const textGeometry = new THREE.PlaneGeometry(size * text.length * 0.6, size * 0.3);
        const textMaterial = new THREE.MeshPhongMaterial({ color });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, 0.002);
        mesh.add(textMesh);
    }

    openApp(appName) {
        if (this.activeWindow) {
            // Update existing window
            this.loadAppContent(this.activeWindow, appName);
            const windowData = this.windows.get(this.activeWindow);
            if (windowData) {
                windowData.appName = appName;
            }
        } else {
            // Create new window
            this.createWindow(appName);
        }
    }

    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            // Remove iframe if exists
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

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update iframe positions
        this.windows.forEach((windowData, windowId) => {
            if (windowData.iframe && windowData.content) {
                const contentRect = windowData.content.getBoundingClientRect();
                windowData.iframe.style.left = contentRect.left + 'px';
                windowData.iframe.style.top = contentRect.top + 'px';
                windowData.iframe.style.width = contentRect.width + 'px';
                windowData.iframe.style.height = contentRect.height + 'px';
            }
        });
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the visionOS AR interface
new VisionOSAR(); 