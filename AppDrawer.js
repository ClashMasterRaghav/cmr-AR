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
		// Create floating button
		this.floatingButton = document.createElement('div');
		this.floatingButton.className = 'floating-app-button';
		this.floatingButton.innerHTML = '📱';
		this.floatingButton.addEventListener('click', () => this.toggleDrawer());
		document.body.appendChild(this.floatingButton);
		console.log('Floating button created');

		// Create app drawer
		this.drawerElement = document.createElement('div');
		this.drawerElement.className = 'app-drawer';
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
		console.log('App drawer created');

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
		this.drawerElement.classList.add('app-drawer-open');
		this.floatingButton.classList.add('floating-app-button-active');
		console.log('App drawer opened');
	}

	closeDrawer() {
		this.isOpen = false;
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