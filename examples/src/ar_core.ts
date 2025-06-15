import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { ARCore } from './types';

export class ARCoreImpl implements ARCore {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public controller!: THREE.XRTargetRaySpace;
    public controllerGrip!: THREE.XRGripSpace;
    public isARMode: boolean = false;
    private container: HTMLDivElement;
    private pointer!: THREE.Mesh;
    private light!: THREE.HemisphereLight;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.container = document.createElement('div');
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    }

    public async init(): Promise<void> {
        try {
            console.log("Initializing AR Core...");
            
            // Setup container
            document.body.appendChild(this.container);
            
            // Setup renderer
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.xr.enabled = true;
            this.container.appendChild(this.renderer.domElement);

            // Setup lighting
            this.light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
            this.light.position.set(0.5, 1, 0.25);
            this.scene.add(this.light);

            // Setup AR button
            const arButton = ARButton.createButton(this.renderer, {
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });
            document.body.appendChild(arButton);

            // Setup controller
            this.controller = this.renderer.xr.getController(0);
            this.scene.add(this.controller);

            // Setup controller model
            const controllerModelFactory = new XRControllerModelFactory();
            this.controllerGrip = this.renderer.xr.getControllerGrip(0);
            this.controllerGrip.add(controllerModelFactory.createControllerModel(this.controllerGrip));
            this.scene.add(this.controllerGrip);

            // Setup pointer
            const pointerGeometry = new THREE.SphereGeometry(0.005, 16, 16);
            const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
            this.pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
            this.pointer.position.z = -0.1;
            this.controller.add(this.pointer);

            // Setup event listeners
            this.setupEventListeners();

            // Start animation loop
            this.renderer.setAnimationLoop(this.animate.bind(this));

            console.log("AR Core initialized successfully");
        } catch (error) {
            console.error("Failed to initialize AR Core:", error);
            throw error;
        }
    }

    private setupEventListeners(): void {
        // AR session events
        this.renderer.xr.addEventListener('sessionstart', () => {
            console.log("AR session started");
            this.isARMode = true;
        });

        this.renderer.xr.addEventListener('sessionend', () => {
            console.log("AR session ended");
            this.isARMode = false;
            window.location.reload();
        });

        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public animate(): void {
        this.render();
    }

    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }
} 