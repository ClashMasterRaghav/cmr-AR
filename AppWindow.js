import * as THREE from 'three';

// AppWindow Class for AR Applications
export class AppWindow {
	constructor(options = {}) {
		this.id = options.id || 'window-' + Date.now();
		this.title = options.title || 'Untitled Window';
		this.onClose = options.onClose || null;
		this.position = options.position || this.getDefaultPosition();
		
		// State variables
		this.isDragging = false;
		this.isResizing = false;
		this.isMaximized = false;
		this.isAnimatingMinimize = false;
		this.isActive = false;
		this.isMinimized = false;
		
		this.size = { width: 600, height: 400 };
		this.dragOffset = { x: 0, y: 0 };
		this.resizeStart = { x: 0, y: 0 };
		this.initialSize = { width: 0, height: 0 };
		
		this.preMaximizeSize = { width: 600, height: 400 };
		this.preMaximizePosition = { ...this.position };
		
		// Bind event handlers
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleResizeMouseDown = this.handleResizeMouseDown.bind(this);
		this.handleMaximize = this.handleMaximize.bind(this);
		this.handleWindowClick = this.handleWindowClick.bind(this);
		this.handleHeaderDoubleClick = this.handleHeaderDoubleClick.bind(this);
		
		// Create the window element
		this.windowElement = this.createElement();
		
		// Add event listeners after element is created
		this.addEventListeners();
	}
	
	getDefaultPosition() {
		// Calculate center position
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		
		return {
			x: Math.max(0, (vw - 600) / 2),
			y: Math.max(0, (vh - 400) / 3)
		};
	}
	
	// Static method to calculate position in user's view direction
	static calculateViewPosition(camera, distance = 2) {
		// Get camera direction
		const direction = new THREE.Vector3(0, 0, -1);
		direction.applyQuaternion(camera.quaternion);
		
		// Calculate position in front of camera
		const position = new THREE.Vector3();
		position.copy(camera.position);
		position.add(direction.multiplyScalar(distance));
		
		// Convert 3D position to screen coordinates
		const vector = position.clone();
		vector.project(camera);
		
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		
		return {
			x: (vector.x * 0.5 + 0.5) * vw - 300, // Center the window
			y: (-vector.y * 0.5 + 0.5) * vh - 200
		};
	}
	
	createElement() {
		const windowDiv = document.createElement('div');
		windowDiv.className = 'app-window';
		windowDiv.setAttribute('data-id', this.id);
		
		windowDiv.innerHTML = `
			<div class="app-window-header">
				<h3 class="app-window-title">${this.title}</h3>
				<div class="app-window-controls">
					<button class="app-window-maximize">◻</button>
					<button class="app-window-close">X</button>
				</div>
			</div>
			<div class="app-window-content" style="height: calc(100% - 30px); overflow: hidden;">
				<!-- Content will be added here -->
			</div>
			<div class="resize-handle">
				<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M1 9L9 1M5 9L9 5M9 9L9 9" />
				</svg>
			</div>
		`;
		
		// Set initial styles directly instead of calling updateWindowStyle
		this.setInitialStyles(windowDiv);
		
		return windowDiv;
	}
	
	setInitialStyles(element) {
		// Set initial position and size
		element.style.position = 'absolute';
		element.style.left = `${this.position.x}px`;
		element.style.top = `${this.position.y}px`;
		element.style.width = `${this.size.width}px`;
		element.style.height = `${this.size.height}px`;
		element.style.zIndex = '500';
		element.style.transition = 'transform 0.2s ease, box-shadow 0.3s ease';
	}
	
	addEventListeners() {
		const header = this.windowElement.querySelector('.app-window-header');
		const maximizeBtn = this.windowElement.querySelector('.app-window-maximize');
		const closeBtn = this.windowElement.querySelector('.app-window-close');
		const resizeHandle = this.windowElement.querySelector('.resize-handle');
		
		header.addEventListener('mousedown', this.handleMouseDown);
		header.addEventListener('dblclick', this.handleHeaderDoubleClick);
		maximizeBtn.addEventListener('click', this.handleMaximize);
		closeBtn.addEventListener('click', () => this.close());
		resizeHandle.addEventListener('mousedown', this.handleResizeMouseDown);
		this.windowElement.addEventListener('click', this.handleWindowClick);
	}
	
	handleMouseDown(e) {
		if (this.isMaximized) return;
		
		const rect = this.windowElement.getBoundingClientRect();
		this.dragOffset = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		this.isDragging = true;
		this.setActive();
		
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('mouseup', this.handleMouseUp);
		
		e.stopPropagation();
	}
	
	handleResizeMouseDown(e) {
		if (this.isMaximized) return;
		
		this.resizeStart = {
			x: e.clientX,
			y: e.clientY
		};
		this.initialSize = {
			width: this.size.width,
			height: this.size.height
		};
		this.isResizing = true;
		this.setActive();
		
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('mouseup', this.handleMouseUp);
		
		e.stopPropagation();
		e.preventDefault();
	}
	
	handleMouseMove(e) {
		if (this.isDragging) {
			this.position = {
				x: e.clientX - this.dragOffset.x,
				y: e.clientY - this.dragOffset.y
			};
			this.updateWindowStyle();
		} else if (this.isResizing) {
			const deltaWidth = e.clientX - this.resizeStart.x;
			const deltaHeight = e.clientY - this.resizeStart.y;
			
			const newWidth = Math.max(300, this.initialSize.width + deltaWidth);
			const newHeight = Math.max(200, this.initialSize.height + deltaHeight);
			
			this.size = {
				width: newWidth,
				height: newHeight
			};
			this.updateWindowStyle();
		}
	}
	
	handleMouseUp() {
		this.isDragging = false;
		this.isResizing = false;
		
		window.removeEventListener('mousemove', this.handleMouseMove);
		window.removeEventListener('mouseup', this.handleMouseUp);
		
		this.updateWindowStyle();
	}
	
	handleMaximize(e) {
		e.stopPropagation();
		
		if (!this.isMaximized) {
			this.preMaximizeSize = { ...this.size };
			this.preMaximizePosition = { ...this.position };
			
			const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
			const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
			
			this.size = { width: vw - 10, height: vh - 50 };
			this.position = { x: 5, y: 5 };
		} else {
			this.size = { ...this.preMaximizeSize };
			this.position = { ...this.preMaximizePosition };
		}
		
		this.isMaximized = !this.isMaximized;
		this.updateWindowStyle();
	}
	
	handleWindowClick() {
		this.setActive();
	}
	
	handleHeaderDoubleClick() {
		this.handleMaximize({ stopPropagation: () => {} });
	}
	
	setActive() {
		// Remove active class from all windows
		document.querySelectorAll('.app-window').forEach(win => {
			win.classList.remove('app-window-active');
		});
		
		// Set this window as active
		this.isActive = true;
		this.updateWindowStyle();
	}
	
	getTaskbarTarget() {
		const taskbarApp = document.querySelector(`.taskbar-app[data-id="${this.id}"]`);
		if (taskbarApp) {
			const rect = taskbarApp.getBoundingClientRect();
			return { x: rect.left, y: rect.bottom };
		}
		return { x: window.innerWidth / 2, y: window.innerHeight };
	}
	
	updateWindowStyle() {
		// Safety check to ensure windowElement exists
		if (!this.windowElement) {
			console.warn('Window element not found in updateWindowStyle');
			return;
		}
		
		const element = this.windowElement;
		
		// Update classes
		element.className = 'app-window';
		if (this.isActive) element.classList.add('app-window-active');
		if (this.isMaximized) element.classList.add('app-window-maximized');
		
		// Update position and size
		element.style.position = 'absolute';
		element.style.left = `${this.position.x}px`;
		element.style.top = `${this.position.y}px`;
		element.style.width = `${this.size.width}px`;
		element.style.height = `${this.size.height}px`;
		
		// Update transform
		let transform = 'scale(1)';
		if (this.isDragging) {
			transform = 'scale(1.01)';
		}
		element.style.transform = transform;
		
		// Update z-index
		element.style.zIndex = this.isActive ? '1000' : '500';
		
		// Update transition
		let transition = 'transform 0.2s ease, box-shadow 0.3s ease';
		if (this.isDragging || this.isResizing) {
			transition = 'none';
		}
		element.style.transition = transition;
		
		// Show/hide resize handle
		const resizeHandle = element.querySelector('.resize-handle');
		if (resizeHandle) {
			resizeHandle.style.display = this.isMaximized ? 'none' : 'block';
		}
	}
	
	setContent(content) {
		if (!this.windowElement) {
			console.warn('Window element not found in setContent');
			return;
		}
		
		const contentDiv = this.windowElement.querySelector('.app-window-content');
		if (typeof content === 'string') {
			contentDiv.innerHTML = content;
		} else if (content instanceof HTMLElement) {
			contentDiv.innerHTML = '';
			contentDiv.appendChild(content);
		}
	}
	
	appendTo(parent) {
		if (!this.windowElement) {
			console.warn('Window element not found in appendTo');
			return;
		}
		
		parent.appendChild(this.windowElement);
		this.setActive();
	}
	
	close() {
		if (this.onClose) {
			this.onClose();
		}
		if (this.windowElement) {
			this.windowElement.remove();
			this.windowElement = null;
		}
	}
	
	maximize() {
		this.handleMaximize({ stopPropagation: () => {} });
	}
	
	destroy() {
		window.removeEventListener('mousemove', this.handleMouseMove);
		window.removeEventListener('mouseup', this.handleMouseUp);
		if (this.windowElement) {
			this.windowElement.remove();
			this.windowElement = null;
		}
	}
} 