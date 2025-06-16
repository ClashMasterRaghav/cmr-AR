// Google Maps Screen - Interactive maps screen
import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { scene, screens, selectScreen } from '../ar_screens.js';
import { 
    enhancedCreateScreen, 
    addDropShadow, 
    animateScreenEntrance,
    createFallbackTexture,
    initCSS3DRenderer,
    getCSS3DRenderer
} from './screenBase.js';

// Create a new Google Maps screen
export function createGoogleMapsScreen(position = new THREE.Vector3(0, 0, -1.5)) {
    // Check if CSS3D renderer is initialized
    const { css3dRenderer, css3dScene } = getCSS3DRenderer();
    if (!css3dRenderer) {
        initCSS3DRenderer();
    }
    
    // Screen dimensions
    const screenWidth = 1.0;
    const screenHeight = 0.75;
    const size = { x: screenWidth, y: screenHeight };
    const title = `Google Maps ${screens.length + 1}`;
    
    console.log("Creating real Google Maps screen with iframe");
    
    // First create placeholder texture for WebGL renderer
    const placeholderTexture = createFallbackTexture(screens.length + 1);
    
    // Create the screen container with the placeholder
    const mapsScreen = enhancedCreateScreen(position, size, title, placeholderTexture);
    
    // Add basic identification data
    mapsScreen.userData = { 
        type: 'screen', 
        id: screens.length,
        isSelected: false,
        isInteractive: true,
        originalScale: new THREE.Vector3(1, 1, 1),
        contentType: 'maps',
        mapType: 'satellite',
        hasRealContent: true
    };
    
    // Add shadow and border
    addDropShadow(mapsScreen, screenWidth, screenHeight);
    
    const borderGeometry = new THREE.PlaneGeometry(screenWidth + 0.02, screenHeight + 0.02);
    const borderMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4285F4, // Google blue color
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthTest: true
    });
    const borderPanel = new THREE.Mesh(borderGeometry, borderMaterial);
    borderPanel.position.z = -0.001;
    borderPanel.renderOrder = 990; // Ensure it's behind the content
    mapsScreen.add(borderPanel);
    
    // Update drag handle reference
    const topBar = mapsScreen.children.find(child => 
        child.userData && child.userData.type === 'dragHandle');
    
    if (topBar) {
        topBar.userData.screen = mapsScreen;
        mapsScreen.userData.dragHandle = topBar;
    }
    
    // Create actual iframe for Google Maps with satellite view
    const iframeElement = document.createElement('iframe');
    iframeElement.style.width = `${screenWidth * 1000}px`;
    iframeElement.style.height = `${screenHeight * 1000}px`;
    iframeElement.style.border = '0px';
    iframeElement.src = 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15057.534307180755!2d-6.2088!3d53.3244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1596123198000!5m2!1sen!2sus';
    iframeElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope";
    
    // Create CSS3D object and position it to match the Three.js object
    const css3dObject = new CSS3DObject(iframeElement);
    css3dObject.scale.set(0.001, 0.001, 0.001); // Scale down to match Three.js units
    css3dObject.position.copy(position);
    css3dObject.quaternion.copy(mapsScreen.quaternion);
    
    // Store reference to CSS3D object
    mapsScreen.userData.css3dObject = css3dObject;
    css3dScene.add(css3dObject);
    
    // Update function to sync CSS3D object with Three.js object
    const updateCSS3DPosition = () => {
        if (mapsScreen.userData.css3dObject) {
            mapsScreen.userData.css3dObject.position.copy(mapsScreen.position);
            mapsScreen.userData.css3dObject.quaternion.copy(mapsScreen.quaternion);
            mapsScreen.userData.css3dObject.scale.set(
                0.001 * mapsScreen.scale.x,
                0.001 * mapsScreen.scale.y,
                0.001 * mapsScreen.scale.z
            );
        }
    };
    
    // Store the update function
    mapsScreen.userData.updateCSS3DPosition = updateCSS3DPosition;
    
    // Add to scene and screens array
    scene.add(mapsScreen);
    screens.push(mapsScreen);
    
    // Add entrance animation
    animateScreenEntrance(mapsScreen);
    
    console.log("Created real Google Maps screen with ID:", mapsScreen.userData.id);
    
    // Select this as the current screen
    selectScreen(mapsScreen);
    
    return mapsScreen;
} 