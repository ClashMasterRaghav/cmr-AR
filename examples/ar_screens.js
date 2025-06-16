// Screen creation and management functionality - Modular Version
import * as THREE from 'three';
import { scene, camera, selectedScreen, setSelectedScreen } from './ar_core.js';
import { virtualKeyboard } from './ar_ui.js';

// Import screen creation functions from app modules
import { createNewBrowserScreen } from './app/browserScreen.js';
import { createYouTubeScreen } from './app/youtubeScreen.js';
import { createGoogleMapsScreen } from './app/googleMapsScreen.js';

// Import base utilities
import { 
    initCSS3DRenderer as initBaseCSS3DRenderer, 
    updateCSS3DRenderer as updateBaseCSS3DRenderer 
} from './app/screenBase.js';

// Array to store screen objects
export let screens = [];

// Re-export screen creation functions for backward compatibility
export { createNewBrowserScreen, createYouTubeScreen, createGoogleMapsScreen };

// Initialize CSS3D renderer for real web content
export function initCSS3DRenderer() {
    return initBaseCSS3DRenderer();
}

// Update CSS3D Renderer - call this in your animation loop
export function updateCSS3DRenderer() {
    updateBaseCSS3DRenderer();
}

// Select a screen and update global state
export function selectScreen(screen) {
    // Deselect previously selected screen
    if (selectedScreen) {
        selectedScreen.userData.isSelected = false;
        
        // Remove selection glow
        if (selectedScreen.userData.glowMesh) {
            selectedScreen.userData.glowMesh.material.opacity = 0.0;
        }
        
        // Reset scale to original
        if (selectedScreen.userData.originalScale) {
            selectedScreen.scale.copy(selectedScreen.userData.originalScale);
        }
    }
    
    // Select new screen
    if (screen) {
        screen.userData.isSelected = true;
        setSelectedScreen(screen);
        
        // Add selection glow
        if (screen.userData.glowMesh) {
            screen.userData.glowMesh.material.opacity = 0.3;
        }
        
        // Slightly scale up selected screen
        const scaleUp = 1.05;
        screen.scale.set(
            screen.userData.originalScale.x * scaleUp,
            screen.userData.originalScale.y * scaleUp,
            screen.userData.originalScale.z * scaleUp
        );
        
        console.log("Selected screen:", screen.userData.id);
    } else {
        setSelectedScreen(null);
    }
}

// Update keyboard position relative to selected screen
export function updateKeyboardPosition(screen) {
    if (!virtualKeyboard || !screen) return;
    
    // Position keyboard below the screen
    const screenPosition = screen.position.clone();
    const screenHeight = 0.75; // Standard screen height
    
    virtualKeyboard.position.copy(screenPosition);
    virtualKeyboard.position.y -= screenHeight / 2 + 0.1; // Position below screen
    virtualKeyboard.position.z += 0.01; // Slightly in front
    
    // Make keyboard visible
    virtualKeyboard.visible = true;
}

// Update screen effects (glow, animations, etc.)
export function updateScreenEffects() {
    screens.forEach(screen => {
        // Update CSS3D position if screen has real content
        if (screen.userData.updateCSS3DPosition) {
            screen.userData.updateCSS3DPosition();
        }
        
        // Update any other effects here
    });
}

// Create screen from button type
export function createScreenFromButton(screenType, position) {
    switch (screenType) {
        case 'browser':
            return createNewBrowserScreen(position);
        case 'youtube':
            return createYouTubeScreen(position);
        case 'maps':
            return createGoogleMapsScreen(position);
        default:
            console.warn('Unknown screen type:', screenType);
            return createNewBrowserScreen(position);
    }
}

// Create initial start screen
export function createStartScreen() {
    const startPosition = new THREE.Vector3(0, 0, -1.5);
    return createNewBrowserScreen(startPosition);
} 