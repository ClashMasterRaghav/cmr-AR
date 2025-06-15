export class AppDrawer {
	constructor() {
		this.isOpen = false;
		this.drawerElement = null;
		this.floatingButton = null;
		this.apps = [
			{
				id: 'video-player',
				name: 'Video Player',
				icon: '🎬',
				description: 'Play local video files'
			},
			{
				id: 'youtube-player',
				name: 'YouTube',
				icon: '📺',
				description: 'Watch YouTube videos'
			}
		];
		this.createDrawer();
		console.log('AppDrawer created - should be visible in AR mode');
	}

	createDrawer() {
		// Create floating button with more explicit positioning
		this.floatingButton = document.createElement('div');
		this.floatingButton.className = 'floating-app-button';
		this.floatingButton.innerHTML = '📱';
		this.floatingButton.style.cssText = `
			position: fixed !important;
			top: 20px !important;
			right: 20px !important;
			width: 60px !important;
			height: 60px !important;
			background: rgba(79, 195, 247, 0.95) !important;
			border-radius: 50% !important;
			display: flex !important;
			align-items: center !important;
			justify-content: center !important;
			font-size: 24px !important;
			cursor: pointer !important;
			z-index: 999999 !important;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
			transition: all 0.3s ease !important;
			backdrop-filter: blur(10px) !important;
			border: 2px solid rgba(255, 255, 255, 0.3) !important;
			pointer-events: auto !important;
			user-select: none !important;
			-webkit-user-select: none !important;
			-moz-user-select: none !important;
			-ms-user-select: none !important;
		`;
		
		this.floatingButton.addEventListener('click', () => {
			console.log('Floating button clicked!');
			this.toggleDrawer();
		});
		
		document.body.appendChild(this.floatingButton);
		console.log('Floating button created and appended to body');
		
		// Verify the button is actually in the DOM
		setTimeout(() => {
			const buttonInDOM = document.querySelector('.floating-app-button');
			if (buttonInDOM) {
				console.log('✅ Floating button found in DOM');
				console.log('Button position:', buttonInDOM.getBoundingClientRect());
				console.log('Button computed style:', window.getComputedStyle(buttonInDOM));
			} else {
				console.log('❌ Floating button NOT found in DOM');
			}
		}, 100);

		// Create app drawer with more explicit positioning
		this.drawerElement = document.createElement('div');
		this.drawerElement.className = 'app-drawer';
		this.drawerElement.style.cssText = `
			position: fixed !important;
			top: 0 !important;
			right: -400px !important;
			width: 380px !important;
			height: 100vh !important;
			background: rgba(40, 40, 40, 0.95) !important;
			backdrop-filter: blur(20px) !important;
			border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
			z-index: 999998 !important;
			transition: right 0.3s ease !important;
			overflow-y: auto !important;
			pointer-events: auto !important;
			user-select: none !important;
			-webkit-user-select: none !important;
			-moz-user-select: none !important;
			-ms-user-select: none !important;
		`;
		
		this.drawerElement.innerHTML = `
			<div class="app-drawer-header">
				<h3>Apps</h3>
				<button class="close-drawer">×</button>
			</div>
			<div class="app-grid">
				${this.apps.map(app => `
					<div class="app-icon" data-app-id="${app.id}">
						<div class="app-icon-symbol">${app.icon}</div>
						<div class="app-icon-name">${app.name}</div>
						<div class="app-icon-description">${app.description}</div>
					</div>
				`).join('')}
			</div>
		`;
		document.body.appendChild(this.drawerElement);
		console.log('App drawer created and appended to body');

		// Add event listeners
		this.drawerElement.querySelector('.close-drawer').addEventListener('click', () => this.closeDrawer());
		
		// Add click listeners to app icons
		this.drawerElement.querySelectorAll('.app-icon').forEach(icon => {
			icon.addEventListener('click', (e) => {
				const appId = e.currentTarget.getAttribute('data-app-id');
				console.log('App icon clicked:', appId);
				this.launchApp(appId);
			});
		});

		// Close drawer when clicking outside
		document.addEventListener('click', (e) => {
			if (!this.drawerElement.contains(e.target) && !this.floatingButton.contains(e.target)) {
				this.closeDrawer();
			}
		});
	}

	toggleDrawer() {
		if (this.isOpen) {
			this.closeDrawer();
		} else {
			this.openDrawer();
		}
	}

	openDrawer() {
		this.isOpen = true;
		this.drawerElement.style.right = '0px !important';
		this.drawerElement.classList.add('app-drawer-open');
		this.floatingButton.classList.add('floating-app-button-active');
		console.log('App drawer opened');
	}

	closeDrawer() {
		this.isOpen = false;
		this.drawerElement.style.right = '-400px !important';
		this.drawerElement.classList.remove('app-drawer-open');
		this.floatingButton.classList.remove('floating-app-button-active');
		console.log('App drawer closed');
	}

	launchApp(appId) {
		// Close drawer after launching app
		this.closeDrawer();
		
		console.log('Launching app:', appId);
		
		// Emit custom event for app launch
		const event = new CustomEvent('appLaunch', {
			detail: { appId }
		});
		document.dispatchEvent(event);
	}

	destroy() {
		console.log('Destroying AppDrawer');
		if (this.floatingButton) {
			this.floatingButton.remove();
		}
		if (this.drawerElement) {
			this.drawerElement.remove();
		}
	}
} 