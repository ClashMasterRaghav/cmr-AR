// YouTube Screen - Real YouTube embed screen
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

// Create a new YouTube screen
export function createYouTubeScreen(position = new THREE.Vector3(0, 0, -1.5)) {
    // Check if CSS3D renderer is initialized
    const { css3dRenderer, css3dScene } = getCSS3DRenderer();
    if (!css3dRenderer) {
        initCSS3DRenderer();
    }
    
    // Screen dimensions
    const screenWidth = 1.0;
    const screenHeight = 0.75;
    const size = { x: screenWidth, y: screenHeight };
    const title = `YouTube ${screens.length + 1}`;
    
    console.log("Creating real YouTube screen with iframe");
    
    // First create placeholder texture for WebGL renderer
    const placeholderTexture = createFallbackTexture(screens.length + 1);
    
    // Create the screen container with the placeholder
    const youtubeScreen = enhancedCreateScreen(position, size, title, placeholderTexture);
    
    // Add basic identification data
    youtubeScreen.userData = { 
        type: 'screen', 
        id: screens.length,
        isSelected: false,
        isInteractive: true,
        originalScale: new THREE.Vector3(1, 1, 1),
        contentType: 'youtube',
        videoId: "Myrr9vA7j5A",
        hasRealContent: true
    };
    
    // Add shadow and border
    addDropShadow(youtubeScreen, screenWidth, screenHeight);
    
    const borderGeometry = new THREE.PlaneGeometry(screenWidth + 0.02, screenHeight + 0.02);
    const borderMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xE62117, // YouTube red color
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthTest: true
    });
    const borderPanel = new THREE.Mesh(borderGeometry, borderMaterial);
    borderPanel.position.z = -0.001;
    borderPanel.renderOrder = 990; // Ensure it's behind the content
    youtubeScreen.add(borderPanel);
    
    // Update drag handle reference
    const topBar = youtubeScreen.children.find(child => 
        child.userData && child.userData.type === 'dragHandle');
    
    if (topBar) {
        topBar.userData.screen = youtubeScreen;
        youtubeScreen.userData.dragHandle = topBar;
    }
    
    // Create actual iframe for YouTube with CSS3D
    const videoId = "Myrr9vA7j5A";
    const iframeElement = document.createElement('iframe');
    iframeElement.style.width = `${screenWidth * 1000}px`;
    iframeElement.style.height = `${screenHeight * 1000}px`;
    iframeElement.style.border = '0px';
    iframeElement.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1`;
    iframeElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    
    // Create CSS3D object and position it to match the Three.js object
    const css3dObject = new CSS3DObject(iframeElement);
    css3dObject.scale.set(0.001, 0.001, 0.001); // Scale down to match Three.js units
    css3dObject.position.copy(position);
    css3dObject.quaternion.copy(youtubeScreen.quaternion);
    
    // Store reference to CSS3D object
    youtubeScreen.userData.css3dObject = css3dObject;
    css3dScene.add(css3dObject);
    
    // Update function to sync CSS3D object with Three.js object
    const updateCSS3DPosition = () => {
        if (youtubeScreen.userData.css3dObject) {
            youtubeScreen.userData.css3dObject.position.copy(youtubeScreen.position);
            youtubeScreen.userData.css3dObject.quaternion.copy(youtubeScreen.quaternion);
            youtubeScreen.userData.css3dObject.scale.set(
                0.001 * youtubeScreen.scale.x,
                0.001 * youtubeScreen.scale.y,
                0.001 * youtubeScreen.scale.z
            );
        }
    };
    
    // Store the update function
    youtubeScreen.userData.updateCSS3DPosition = updateCSS3DPosition;
    
    // Add to scene and screens array
    scene.add(youtubeScreen);
    screens.push(youtubeScreen);
    
    // Add entrance animation
    animateScreenEntrance(youtubeScreen);
    
    console.log("Created real YouTube screen with ID:", youtubeScreen.userData.id);
    
    // Select this as the current screen
    selectScreen(youtubeScreen);
    
    return youtubeScreen;
} 