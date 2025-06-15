import { VideoPlayer } from './apps/VideoPlayer.js';
import { YouTubePlayer } from './apps/YouTubePlayer.js';
import { AppDrawer } from './AppDrawer.js';
import { AppWindow } from './AppWindow.js';

// Global variables for app management
let videoPlayer, youtubePlayer;
let appDrawer;
let camera, renderer;

// Initialize the main application
export function initMain(cameraRef, rendererRef) {
	camera = cameraRef;
	renderer = rendererRef;
	
	// Initialize app instances
	videoPlayer = null;
	youtubePlayer = null;
	
	// Initialize app drawer
	appDrawer = new AppDrawer();
	
	// Listen for app launch events
	document.addEventListener('appLaunch', handleAppLaunch);
}

// Handle app launch events from the app drawer
function handleAppLaunch(event) {
	const { appId } = event.detail;
	
	switch (appId) {
		case 'video-player':
			if (!videoPlayer) {
				videoPlayer = new VideoPlayer();
				videoPlayer.create(camera);
			}
			break;
		case 'youtube-player':
			if (!youtubePlayer) {
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