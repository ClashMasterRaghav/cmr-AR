import { AppWindow } from '../AppWindow.js';

export class YouTubePlayer {
	constructor() {
		this.window = null;
	}

	create() {
		this.window = new AppWindow({
			id: 'youtube-player',
			title: 'YouTube Player',
			onClose: () => {
				this.window = null;
			}
		});

		const youtubeContent = document.createElement('div');
		youtubeContent.className = 'youtube-player';
		youtubeContent.innerHTML = `
			<div class="youtube-input">
				<input type="text" id="youtube-url" placeholder="Enter YouTube URL or Video ID">
				<button id="load-youtube">Load Video</button>
			</div>
			<div id="youtube-container">
				<div class="youtube-placeholder">
					<h3>YouTube Player</h3>
					<p>Enter a YouTube URL or Video ID to start watching</p>
					<p style="font-size: 12px; margin-top: 10px;">
						Examples:<br>
						https://www.youtube.com/watch?v=dQw4w9WgXcQ<br>
						or just: dQw4w9WgXcQ
					</p>
				</div>
			</div>
		`;

		this.window.setContent(youtubeContent);
		this.window.appendTo(document.body);

		this.setupEventListeners(youtubeContent);
	}

	setupEventListeners(youtubeContent) {
		const urlInput = youtubeContent.querySelector('#youtube-url');
		const loadBtn = youtubeContent.querySelector('#load-youtube');
		const container = youtubeContent.querySelector('#youtube-container');

		loadBtn.addEventListener('click', () => {
			this.loadVideo(urlInput, container);
		});

		urlInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				this.loadVideo(urlInput, container);
			}
		});
	}

	loadVideo(urlInput, container) {
		const input = urlInput.value.trim();
		if (input) {
			const videoId = this.extractVideoId(input);
			const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
			
			container.innerHTML = `
				<iframe class="youtube-iframe" 
						src="${embedUrl}" 
						frameborder="0" 
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
						allowfullscreen>
				</iframe>
			`;
		}
	}

	extractVideoId(url) {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : url;
	}

	close() {
		if (this.window) {
			this.window.close();
			this.window = null;
		}
	}
} 