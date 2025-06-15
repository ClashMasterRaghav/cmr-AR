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
	
	// Create app drawer when in AR
	if (!appDrawer) {
		appDrawer = new AppDrawer();
		console.log('App drawer should now be visible in AR');
	}
	
	// Force a small delay to ensure AR is fully initialized
	setTimeout(() => {
		if (appDrawer && !appDrawer.floatingButton) {
			console.log('Recreating app drawer due to missing floating button');
			appDrawer.destroy();
			appDrawer = new AppDrawer();
		}
	}, 1000);
}

// Handle AR session end
function onSessionEnd() {
	console.log('AR session ended - cleaning up');
	isInAR = false;
	
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