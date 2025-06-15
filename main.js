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
	
	// Wait a bit for AR session to fully initialize
	setTimeout(() => {
		createARUI();
	}, 500);
}

// Create UI elements specifically for AR mode
function createARUI() {
	console.log('Creating AR UI elements...');
	
	// Wait for the AR session to fully initialize and find the overlay
	setTimeout(() => {
		// Look for the AR overlay that ARButton creates
		const arOverlay = document.querySelector('div[style*="display: none"]');
		if (arOverlay) {
			console.log('Found AR overlay, adding UI elements to it');
			arOverlay.style.display = 'block';
			
			// Create floating button
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
				z-index: 999999 !important;
			`;
			arOverlay.appendChild(floatingButton);
			
			// Create app drawer
			const appDrawer = document.createElement('div');
			appDrawer.id = 'ar-app-drawer';
			appDrawer.style.cssText = `
				position: absolute !important;
				top: 0 !important;
				left: -400px !important;
				width: 380px !important;
				height: 100vh !important;
				background: rgba(40, 40, 40, 0.95) !important;
				backdrop-filter: blur(20px) !important;
				border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
				transition: left 0.3s ease !important;
				overflow-y: auto !important;
				pointer-events: auto !important;
				user-select: none !important;
				-webkit-user-select: none !important;
				-moz-user-select: none !important;
				-ms-user-select: none !important;
				z-index: 999998 !important;
			`;
			
			appDrawer.innerHTML = `
				<div style="display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 30, 30, 0.8);">
					<h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff;">Apps</h3>
					<button id="close-drawer" style="background: none; border: none; color: #ffffff; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease;">×</button>
				</div>
				<div style="padding: 20px;">
					<div class="app-icon" data-app-id="video-player" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
						<div style="font-size: 32px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(79, 195, 247, 0.1); border-radius: 10px; border: 1px solid rgba(79, 195, 247, 0.2);">🎬</div>
						<div>
							<div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 4px;">Video Player</div>
							<div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); line-height: 1.4;">Play local video files</div>
						</div>
					</div>
					<div class="app-icon" data-app-id="youtube-player" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 15px;">
						<div style="font-size: 32px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(79, 195, 247, 0.1); border-radius: 10px; border: 1px solid rgba(79, 195, 247, 0.2);">📺</div>
						<div>
							<div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 4px;">YouTube</div>
							<div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); line-height: 1.4;">Watch YouTube videos</div>
						</div>
					</div>
				</div>
			`;
			arOverlay.appendChild(appDrawer);
			
			// Add event listeners
			let isDrawerOpen = false;
			
			floatingButton.addEventListener('click', () => {
				console.log('AR floating button clicked!');
				if (isDrawerOpen) {
					appDrawer.style.left = '-400px !important';
					floatingButton.style.background = 'rgba(79, 195, 247, 0.95) !important';
				} else {
					appDrawer.style.left = '0px !important';
					floatingButton.style.background = 'rgba(76, 175, 80, 0.95) !important';
				}
				isDrawerOpen = !isDrawerOpen;
			});
			
			document.getElementById('close-drawer').addEventListener('click', () => {
				appDrawer.style.left = '-400px !important';
				floatingButton.style.background = 'rgba(79, 195, 247, 0.95) !important';
				isDrawerOpen = false;
			});
			
			// Add click listeners to app icons
			appDrawer.querySelectorAll('.app-icon').forEach(icon => {
				icon.addEventListener('click', (e) => {
					const appId = e.currentTarget.getAttribute('data-app-id');
					console.log('AR app icon clicked:', appId);
					
					// Close drawer
					appDrawer.style.left = '-400px !important';
					floatingButton.style.background = 'rgba(79, 195, 247, 0.95) !important';
					isDrawerOpen = false;
					
					// Launch app
					launchApp(appId);
				});
			});
			
			console.log('AR UI elements created successfully in overlay');
			
			// Verify elements are visible
			setTimeout(() => {
				const button = document.getElementById('ar-floating-button');
				if (button) {
					console.log('✅ AR floating button found in DOM');
					const rect = button.getBoundingClientRect();
					console.log('Button rect:', rect);
				} else {
					console.log('❌ AR floating button not found in DOM');
				}
			}, 100);
		} else {
			console.log('❌ AR overlay not found, trying alternative approach');
			// Fallback: try creating elements directly in body
			createFallbackUI();
		}
	}, 1000);
}

// Fallback UI creation if overlay approach fails
function createFallbackUI() {
	console.log('Creating fallback UI elements...');
	
	// Create floating button directly in body
	const floatingButton = document.createElement('div');
	floatingButton.id = 'ar-floating-button-fallback';
	floatingButton.innerHTML = '📱';
	floatingButton.style.cssText = `
		position: fixed !important;
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
		z-index: 999999 !important;
	`;
	document.body.appendChild(floatingButton);
	
	console.log('Fallback UI created');
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
	
	// Clean up AR UI elements (both overlay and fallback)
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