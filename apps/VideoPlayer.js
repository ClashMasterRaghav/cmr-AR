import { AppWindow } from '../AppWindow.js';

export class VideoPlayer {
	constructor() {
		this.window = null;
	}

	create(camera) {
		// Calculate position in user's view direction
		const position = AppWindow.calculateViewPosition(camera, 2);
		
		this.window = new AppWindow({
			id: 'video-player',
			title: 'Video Player',
			position: position,
			onClose: () => {
				this.window = null;
			}
		});

		const videoContent = document.createElement('div');
		videoContent.className = 'video-player';
		videoContent.innerHTML = `
			<video id="video-element" controls style="display: none;">
				Your browser does not support the video tag.
			</video>
			<div id="video-placeholder" style="text-align: center; color: rgba(255,255,255,0.5);">
				<h3>Video Player</h3>
				<p>Select a video file to play</p>
			</div>
			<div class="video-controls">
				<label for="video-file-input" style="cursor: pointer;">
					Select Video File
				</label>
				<input type="file" id="video-file-input" accept="video/*" style="display: none;">
				<button id="play-pause-btn" style="display: none;">Play</button>
				<button id="fullscreen-btn" style="display: none;">Fullscreen</button>
			</div>
		`;

		this.window.setContent(videoContent);
		this.window.appendTo(document.body);

		this.setupEventListeners(videoContent);
	}

	setupEventListeners(videoContent) {
		const videoElement = videoContent.querySelector('#video-element');
		const videoPlaceholder = videoContent.querySelector('#video-placeholder');
		const fileInput = videoContent.querySelector('#video-file-input');
		const playPauseBtn = videoContent.querySelector('#play-pause-btn');
		const fullscreenBtn = videoContent.querySelector('#fullscreen-btn');

		fileInput.addEventListener('change', (e) => {
			const file = e.target.files[0];
			if (file) {
				const url = URL.createObjectURL(file);
				videoElement.src = url;
				videoElement.style.display = 'block';
				videoPlaceholder.style.display = 'none';
				playPauseBtn.style.display = 'inline-block';
				fullscreenBtn.style.display = 'inline-block';
			}
		});

		playPauseBtn.addEventListener('click', () => {
			if (videoElement.paused) {
				videoElement.play();
				playPauseBtn.textContent = 'Pause';
			} else {
				videoElement.pause();
				playPauseBtn.textContent = 'Play';
			}
		});

		fullscreenBtn.addEventListener('click', () => {
			if (videoElement.requestFullscreen) {
				videoElement.requestFullscreen();
			}
		});
	}

	close() {
		if (this.window) {
			this.window.close();
			this.window = null;
		}
	}
} 