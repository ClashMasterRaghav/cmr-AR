// Base screen utilities and shared functions - Window-based Design
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { scene, screens, selectScreen } from '../ar_screens.js';

// CSS3D renderer for real web content
let css3dRenderer;
let css3dScene;

// Window class for AR screens
class ARWindow {
  constructor(options = {}) {
    this.id = options.id || 'window-' + Date.now();
    this.title = options.title || 'Untitled Window';
    this.content = options.content || null;
    this.onClose = options.onClose || null;
    this.onMinimize = options.onMinimize || null;
    this.onMaximize = options.onMaximize || null;
    
    // State variables
    this.isDragging = false;
    this.isResizing = false;
    this.isMaximized = false;
    this.isAnimatingMinimize = false;
    this.isActive = false;
    this.isMinimized = false;
    this.isHovered = false;
    
    // Window properties
    this.position = options.position || new THREE.Vector3(0, 0, -1.5);
    this.size = options.size || { width: 1.0, height: 0.75 };
    this.originalSize = { ...this.size };
    this.preMaximizeSize = { ...this.size };
    this.preMaximizePosition = this.position.clone();
    
    // Interaction offsets
    this.dragOffset = new THREE.Vector3();
    this.resizeStart = new THREE.Vector3();
    this.initialSize = { width: 0, height: 0 };
    
    // Visual elements
    this.windowGroup = null;
    this.headerMesh = null;
    this.contentMesh = null;
    this.borderMesh = null;
    this.shadowMesh = null;
    this.glowMesh = null;
    this.resizeHandle = null;
    this.controlButtons = [];
    
    // Create the window
    this.createWindow();
    this.addEventListeners();
  }
  
  createWindow() {
    // Create main window group
    this.windowGroup = new THREE.Group();
    this.windowGroup.userData = {
      type: 'window',
      window: this,
      id: this.id
    };
    
    // Create header
    this.createHeader();
    
    // Create content area
    this.createContent();
    
    // Create border
    this.createBorder();
    
    // Create shadow and glow effects
    this.createEffects();
    
    // Create resize handle
    this.createResizeHandle();
    
    // Create control buttons
    this.createControlButtons();
    
    // Set initial position
    this.windowGroup.position.copy(this.position);
    
    // Update visual state
    this.updateWindowStyle();
  }
  
  createHeader() {
    const headerHeight = 0.06;
    const headerGeometry = new THREE.PlaneGeometry(this.size.width, headerHeight);
    
    // Create header background
    const headerMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    
    this.headerMesh = new THREE.Mesh(headerGeometry, headerMaterial);
    this.headerMesh.position.set(0, this.size.height / 2 - headerHeight / 2, 0.004);
    this.headerMesh.userData = {
      type: 'header',
      window: this,
      isDraggable: true
    };
    
    // Create header texture with title
    this.updateHeaderTexture();
    
    this.windowGroup.add(this.headerMesh);
  }
  
  updateHeaderTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, canvas.height - 1, canvas.width, 1);
    
    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(this.title, canvas.width / 2, canvas.height / 2);
    
    // Add grip indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const dotRadius = 1.5;
    const dotSpacing = 12;
    const dotsStartX = canvas.width - 100;
    const dotsY = canvas.height / 2;
    
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(dotsStartX + i * dotSpacing, dotsY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    this.headerMesh.material.map = texture;
    this.headerMesh.material.needsUpdate = true;
  }
  
  createContent() {
    const contentGeometry = new THREE.PlaneGeometry(this.size.width, this.size.height);
    let contentMaterial;
    
    if (this.content && this.content.isVideoTexture) {
      contentMaterial = new THREE.MeshBasicMaterial({
        map: this.content,
        side: THREE.DoubleSide,
        depthTest: true
      });
    } else if (this.content) {
      contentMaterial = new THREE.MeshBasicMaterial({
        map: this.content,
        side: THREE.DoubleSide,
        depthTest: true
      });
    } else {
      // Default content background
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext('2d');
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      contentMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        depthTest: true
      });
    }
    
    this.contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
    this.contentMesh.position.z = 0.003;
    this.contentMesh.renderOrder = 1010;
    this.contentMesh.userData = {
      type: 'content',
      window: this
    };
    
    this.windowGroup.add(this.contentMesh);
  }
  
  createBorder() {
    const borderGeometry = new THREE.PlaneGeometry(this.size.width + 0.02, this.size.height + 0.02);
    const borderMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    this.borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
    this.borderMesh.position.z = -0.001;
    this.borderMesh.renderOrder = 990;
    
    this.windowGroup.add(this.borderMesh);
  }
  
  createEffects() {
    // Shadow
    const shadowWidth = this.size.width + 0.06;
    const shadowHeight = this.size.height + 0.06;
    const shadowGeometry = new THREE.PlaneGeometry(shadowWidth, shadowHeight);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthTest: true
    });
    
    this.shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
    this.shadowMesh.position.z = -0.005;
    this.shadowMesh.renderOrder = 980;
    this.shadowMesh.userData.type = 'shadow';
    
    // Glow
    const glowGeometry = new THREE.PlaneGeometry(this.size.width + 0.01, this.size.height + 0.01);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a237e,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthTest: true
    });
    
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.glowMesh.position.z = -0.003;
    this.glowMesh.renderOrder = 985;
    this.glowMesh.userData.type = 'glow';
    
    this.windowGroup.add(this.shadowMesh);
    this.windowGroup.add(this.glowMesh);
  }
  
  createResizeHandle() {
    const handleSize = 0.03;
    const handleGeometry = new THREE.PlaneGeometry(handleSize, handleSize);
    const handleMaterial = new THREE.MeshBasicMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    this.resizeHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    this.resizeHandle.position.set(
      this.size.width / 2 - handleSize / 2,
      -this.size.height / 2 + handleSize / 2,
      0.005
    );
    this.resizeHandle.userData = {
      type: 'resizeHandle',
      window: this
    };
    
    this.windowGroup.add(this.resizeHandle);
  }
  
  createControlButtons() {
    const buttonSize = 0.02;
    const buttonSpacing = 0.025;
    const buttons = [
      { type: 'minimize', icon: '–', color: 0xFFBD2E },
      { type: 'maximize', icon: '◻', color: 0x27C93F },
      { type: 'close', icon: '×', color: 0xFF5F56 }
    ];
    
    buttons.forEach((button, index) => {
      const buttonGeometry = new THREE.PlaneGeometry(buttonSize, buttonSize);
      const buttonMaterial = new THREE.MeshBasicMaterial({
        color: button.color,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
      buttonMesh.position.set(
        this.size.width / 2 - buttonSpacing * (buttons.length - index),
        this.size.height / 2 - 0.03,
        0.005
      );
      buttonMesh.userData = {
        type: 'button',
        action: button.type,
        window: this
      };
      
      this.controlButtons.push(buttonMesh);
      this.windowGroup.add(buttonMesh);
    });
  }
  
  addEventListeners() {
    // Event listeners will be handled by the interaction system
    // This is a placeholder for future event handling
  }
  
  setActive() {
    // Remove active state from all windows
    screens.forEach(screen => {
      if (screen.userData && screen.userData.window) {
        screen.userData.window.isActive = false;
        screen.userData.window.updateWindowStyle();
      }
    });
    
    // Set this window as active
    this.isActive = true;
    this.updateWindowStyle();
    
    // Update global selection
    selectScreen(this.windowGroup);
  }
  
  updateWindowStyle() {
    if (!this.windowGroup) return;
    
    // Update glow effect based on active state
    if (this.glowMesh) {
      this.glowMesh.material.opacity = this.isActive ? 0.3 : 0.0;
    }
    
    // Update scale based on state
    let scale = 1.0;
    if (this.isDragging) {
      scale = 1.01;
    } else if (this.isAnimatingMinimize) {
      scale = 0.05;
    }
    
    this.windowGroup.scale.set(scale, scale, scale);
    
    // Update z-index (render order)
    const baseRenderOrder = this.isActive ? 1000 : 500;
    this.windowGroup.children.forEach(child => {
      if (child.renderOrder < 1000) {
        child.renderOrder = baseRenderOrder + child.renderOrder;
      }
    });
    
    // Show/hide resize handle
    if (this.resizeHandle) {
      this.resizeHandle.visible = !this.isMaximized;
    }
    
    // Show/hide window based on minimized state
    this.windowGroup.visible = !(this.isMinimized && !this.isAnimatingMinimize);
  }
  
  setContent(content) {
    this.content = content;
    if (this.contentMesh) {
      // Update content material
      if (content && content.isVideoTexture) {
        this.contentMesh.material.map = content;
        this.contentMesh.material.needsUpdate = true;
      }
    }
  }
  
  setTitle(title) {
    this.title = title;
    this.updateHeaderTexture();
  }
  
  minimize() {
    if (!this.isMinimized) {
      this.isAnimatingMinimize = true;
      this.updateWindowStyle();
      
      setTimeout(() => {
        this.isMinimized = true;
        this.isAnimatingMinimize = false;
        this.updateWindowStyle();
        
        if (this.onMinimize) {
          this.onMinimize();
        }
      }, 500);
    } else {
      this.isMinimized = false;
      this.updateWindowStyle();
    }
  }
  
  maximize() {
    if (!this.isMaximized) {
      this.preMaximizeSize = { ...this.size };
      this.preMaximizePosition = this.position.clone();
      
      // Maximize to a larger size
      this.size = { width: 1.5, height: 1.0 };
      this.position.set(0, 0, -1.5);
    } else {
      this.size = { ...this.preMaximizeSize };
      this.position.copy(this.preMaximizePosition);
    }
    
    this.isMaximized = !this.isMaximized;
    this.updateWindowStyle();
    
    if (this.onMaximize) {
      this.onMaximize();
    }
  }
  
  close() {
    if (this.onClose) {
      this.onClose();
    }
    
    // Remove from scene
    if (this.windowGroup && this.windowGroup.parent) {
      this.windowGroup.parent.remove(this.windowGroup);
    }
    
    // Remove from screens array
    const index = screens.indexOf(this.windowGroup);
    if (index > -1) {
      screens.splice(index, 1);
    }
  }
  
  destroy() {
    this.close();
  }
}

// Initialize CSS3D renderer for real web content
export function initCSS3DRenderer() {
    // Create CSS3D renderer and scene for web content
    css3dRenderer = new CSS3DRenderer();
    css3dRenderer.setSize(window.innerWidth, window.innerHeight);
    css3dRenderer.domElement.style.position = 'absolute';
    css3dRenderer.domElement.style.top = '0';
    css3dRenderer.domElement.style.left = '0';
    css3dRenderer.domElement.style.pointerEvents = 'none'; // Let AR interactions pass through
    document.body.appendChild(css3dRenderer.domElement);
    
    css3dScene = new THREE.Scene();
    
    // Handle resize events
    window.addEventListener('resize', () => {
        css3dRenderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    console.log("CSS3D Renderer initialized for real website integration");
    return css3dRenderer;
}

// Update CSS3D Renderer - call this in your animation loop
export function updateCSS3DRenderer() {
    if (css3dRenderer && css3dScene) {
        // Get camera from the scene or use a default camera
        const camera = scene ? scene.userData.camera : null;
        if (camera) {
            css3dRenderer.render(css3dScene, camera);
        }
    }
}

// Get CSS3D renderer and scene
export function getCSS3DRenderer() {
    return { css3dRenderer, css3dScene };
}

// Enhanced screen creation function using ARWindow
export function enhancedCreateScreen(position, size, title = 'Screen', content = null) {
    const window = new ARWindow({
        position: position,
        size: size,
        title: title,
        content: content,
        onClose: () => {
            console.log('Window closed:', window.id);
        },
        onMinimize: () => {
            console.log('Window minimized:', window.id);
        },
        onMaximize: () => {
            console.log('Window maximized:', window.id);
        }
    });
    
    // Add to scene and screens array
    scene.add(window.windowGroup);
    screens.push(window.windowGroup);
    
    // Set as active
    window.setActive();
    
    return window.windowGroup;
}

// Legacy functions for backward compatibility
export function addDropShadow(screen, width, height) {
    // This is now handled by the ARWindow class
    console.warn('addDropShadow is deprecated. Use ARWindow class instead.');
}

export function animateScreenEntrance(screen) {
    // This is now handled by the ARWindow class
    console.warn('animateScreenEntrance is deprecated. Use ARWindow class instead.');
}

// Create fallback texture for screens
export function createFallbackTexture(screenNumber) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#34495e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 4 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Screen ${screenNumber}`, canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '24px Arial';
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2 + 20);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Export the ARWindow class for use in other modules
export { ARWindow };
