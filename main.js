import { VideoPlayer } from './apps/VideoPlayer.js';
import { YouTubePlayer } from './apps/YouTubePlayer.js';
import { AppDrawer } from './AppDrawer.js';
import { AppWindow } from './AppWindow.js';

// Global variables for app management
let videoPlayer, youtubePlayer;
let appDrawer;
let camera, renderer;
let isInAR = false;

// Initialize the main application
export function initMain(cameraRef, rendererRef) {
	camera = cameraRef;
	renderer = rendererRef;
	
	// Initialize app instances
	videoPlayer = null;
	youtubePlayer = null;
	appDrawer = null;
	
	// Listen for app launch events
	document.addEventListener('appLaunch', handleAppLaunch);
	
	// Listen for AR session events
	renderer.xr.addEventListener('sessionstart', onSessionStart);
	renderer.xr.addEventListener('sessionend', onSessionEnd);
	
	console.log('Main initialized, waiting for AR session...');
}

// Handle AR session start
function onSessionStart() {
	console.log('AR session started - creating app drawer');
	isInAR = true;
	
	// Debug: Check what elements exist
	console.log('AR session started, checking DOM elements...');
	setTimeout(() => {
		const allDivs = document.querySelectorAll('div');
		console.log('All divs in DOM:', allDivs.length);
		allDivs.forEach((div, index) => {
			console.log(`Div ${index}:`, div.id, div.className, div.style.display);
		});
		
		// Look for any overlay elements
		const overlays = document.querySelectorAll('div[style*="display"]');
		console.log('Elements with display style:', overlays.length);
		overlays.forEach((overlay, index) => {
			console.log(`Overlay ${index}:`, overlay.style.display, overlay.id, overlay.className);
		});
	}, 500);
	
	// Try creating 3D UI elements in the AR scene instead
	create3DUI();
}

// Create 3D UI elements in the AR scene
function create3DUI() {
	console.log('Creating 3D UI elements in AR scene...');
	
	// Find the AR UI container
	const arUIContainer = document.getElementById('ar-ui-container');
	if (!arUIContainer) {
		console.log('❌ AR UI container not found, creating elements in body');
		createElementsInBody();
		return;
	}
	
	console.log('✅ Found AR UI container, adding elements to it');
	
	// Create a simple test button that should work in AR
	const testButton = document.createElement('button');
	testButton.id = 'ar-test-button';
	testButton.innerHTML = 'TEST AR UI';
	testButton.style.cssText = `
		position: absolute !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		width: 120px !important;
		height: 50px !important;
		background: red !important;
		color: white !important;
		border: none !important;
		border-radius: 10px !important;
		font-size: 16px !important;
		cursor: pointer !important;
		pointer-events: auto !important;
	`;
	
	testButton.addEventListener('click', () => {
		console.log('AR test button clicked!');
		alert('AR UI is working!');
	});
	
	arUIContainer.appendChild(testButton);
	
	// Also create the floating app button
	const floatingButton = document.createElement('div');
	floatingButton.id = 'ar-floating-button';
	floatingButton.innerHTML = '📱';
	floatingButton.style.cssText = `
		position: absolute !important;
		top: 20px !important;
		left: 20px !important;
		width: 60px !important;
		height: 60px !important;
		background: rgba(79, 195, 247, 0.95) !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		font-size: 24px !important;
		cursor: pointer !important;
		pointer-events: auto !important;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
		transition: all 0.3s ease !important;
		backdrop-filter: blur(10px) !important;
		border: 2px solid rgba(255, 255, 255, 0.3) !important;
		user-select: none !important;
		-webkit-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
	`;
	
	floatingButton.addEventListener('click', () => {
		console.log('AR floating button clicked!');
		alert('App drawer would open here!');
	});
	
	arUIContainer.appendChild(floatingButton);
	
	console.log('AR UI elements created in container');
	
	// Verify elements are visible
	setTimeout(() => {
		const testBtn = document.getElementById('ar-test-button');
		const floatBtn = document.getElementById('ar-floating-button');
		
		if (testBtn) {
			console.log('✅ AR test button found in DOM');
			const rect = testBtn.getBoundingClientRect();
			console.log('Test button rect:', rect);
		} else {
			console.log('❌ AR test button not found in DOM');
		}
		
		if (floatBtn) {
			console.log('✅ AR floating button found in DOM');
			const rect = floatBtn.getBoundingClientRect();
			console.log('Floating button rect:', rect);
		} else {
			console.log('❌ AR floating button not found in DOM');
		}
	}, 100);
}

// Fallback function to create elements in body
function createElementsInBody() {
	console.log('Creating elements directly in body as fallback...');
	
	// Create a simple test button
	const testButton = document.createElement('button');
	testButton.id = 'ar-test-button';
	testButton.innerHTML = 'TEST AR UI (BODY)';
	testButton.style.cssText = `
		position: fixed !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		width: 120px !important;
		height: 50px !important;
		background: red !important;
		color: white !important;
		border: none !important;
		border-radius: 10px !important;
		font-size: 16px !important;
		cursor: pointer !important;
		z-index: 999999 !important;
		pointer-events: auto !important;
	`;
	
	testButton.addEventListener('click', () => {
		console.log('AR test button clicked!');
		alert('AR UI is working!');
	});
	
	document.body.appendChild(testButton);
	
	console.log('Fallback elements created in body');
}

// Launch app function
function launchApp(appId) {
	console.log('Launching AR app:', appId);
	
	switch (appId) {
		case 'video-player':
			if (!videoPlayer) {
				console.log('Creating Video Player');
				videoPlayer = new VideoPlayer();
				videoPlayer.create(camera);
			}
			break;
		case 'youtube-player':
			if (!youtubePlayer) {
				console.log('Creating YouTube Player');
				youtubePlayer = new YouTubePlayer();
				youtubePlayer.create(camera);
			}
			break;
	}
}

// Handle AR session end
function onSessionEnd() {
	console.log('AR session ended - cleaning up');
	isInAR = false;
	
	// Clean up AR UI elements
	const testButton = document.getElementById('ar-test-button');
	if (testButton) {
		testButton.remove();
	}
	
	const floatingButton = document.getElementById('ar-floating-button');
	if (floatingButton) {
		floatingButton.remove();
	}
	
	const appDrawer = document.getElementById('ar-app-drawer');
	if (appDrawer) {
		appDrawer.remove();
	}
	
	// Clean up fallback UI elements
	const fallbackButton = document.getElementById('ar-floating-button-fallback');
	if (fallbackButton) {
		fallbackButton.remove();
	}
	
	// Clean up app drawer and windows when exiting AR
	cleanup();
}

// Handle app launch events from the app drawer
function handleAppLaunch(event) {
	if (!isInAR) {
		console.warn('Cannot launch apps outside of AR mode');
		return;
	}
	
	const { appId } = event.detail;
	console.log('Handling app launch for:', appId);
	launchApp(appId);
}

// Handle AR controller select events (legacy support)
export function onSelect() {
	// This is now handled by the app drawer
	// Keeping for backward compatibility
}

// Handle window resize events
export function onWindowResize(cameraRef, rendererRef) {
	camera = cameraRef;
	renderer = rendererRef;
	
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// Clean up function for when AR session ends
export function cleanup() {
	console.log('Cleaning up all components');
	
	if (videoPlayer) {
		videoPlayer.close();
		videoPlayer = null;
	}
	if (youtubePlayer) {
		youtubePlayer.close();
		youtubePlayer = null;
	}
	if (appDrawer) {
		appDrawer.destroy();
		appDrawer = null;
	}
	
	// Remove event listeners
	document.removeEventListener('appLaunch', handleAppLaunch);
} 