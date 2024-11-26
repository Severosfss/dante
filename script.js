// Initialize the YouTube API
const API_KEY = 'AIzaSyA3bjXPkJ6VesGq64sodSXQwL-XfYtDOok';
const CHANNEL_ID = 'UCmJ5TQ7GHJnRqvK5YwJrwBQ'; // Dante Seven Games channel ID
const FEATURED_VIDEO_ID = 'gGW5EIDtyOg';

// Load the YouTube API
function loadYouTubeAPI() {
    gapi.load('client', initClient);
}

// Initialize the API client
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
    }).then(() => {
        console.log('YouTube API client initialized');
        loadFeaturedVideo();
        loadChannelVideos();
    }).catch(error => {
        console.error('Error initializing YouTube API:', error);
        displayError('Erro ao inicializar a API do YouTube. Por favor, recarregue a página.');
    });
}

// Load the featured video and its description
function loadFeaturedVideo() {
    const playerDiv = document.getElementById('featured-player');
    playerDiv.innerHTML = `
        <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/${FEATURED_VIDEO_ID}?autoplay=0&rel=0"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
        ></iframe>
    `;

    // Fetch video details
    gapi.client.youtube.videos.list({
        part: 'snippet',
        id: FEATURED_VIDEO_ID
    }).then(response => {
        const video = response.result.items[0];
        if (video) {
            document.getElementById('featured-title').textContent = video.snippet.title;
            document.getElementById('featured-desc').textContent = video.snippet.description;
        }
    }).catch(error => {
        console.error('Error loading video details:', error);
        displayError('Erro ao carregar detalhes do vídeo em destaque.');
    });
}

// Load channel videos
function loadChannelVideos() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando vídeos...';
    document.getElementById('videos-container').appendChild(loadingElement);

    gapi.client.youtube.search.list({
        part: 'snippet',
        channelId: CHANNEL_ID,
        maxResults: 12,
        order: 'date',
        type: 'video'
    }).then(response => {
        const videosContainer = document.getElementById('videos-container');
        videosContainer.innerHTML = ''; // Clear loading message
        const videos = response.result.items;

        videos.forEach(video => {
            if (video.id.videoId !== FEATURED_VIDEO_ID) {
                const videoCard = createVideoCard(video);
                videosContainer.appendChild(videoCard);
            }
        });
    }).catch(error => {
        console.error('Error loading channel videos:', error);
        displayError('Erro ao carregar os vídeos do canal.');
    });
}

// Create a video card element
function createVideoCard(video) {
    const div = document.createElement('div');
    div.className = 'video-card';
    
    // Format view count and date
    const publishedDate = new Date(video.snippet.publishedAt);
    const formattedDate = publishedDate.toLocaleDateString('pt-BR');

    div.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank" class="video-link">
            <div class="thumbnail-container">
                <img 
                    src="${video.snippet.thumbnails.high.url}" 
                    alt="${video.snippet.title}"
                    class="video-thumbnail"
                    loading="lazy"
                >
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.snippet.title}</h3>
                <p class="video-date">${formattedDate}</p>
            </div>
        </a>
    `;

    return div;
}

// Display error message
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Add loading animation
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
        }
        .loading i {
            margin-right: 0.5rem;
        }
        .error-message {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #ff4757;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        .thumbnail-container {
            position: relative;
            overflow: hidden;
        }
        .play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .play-overlay i {
            font-size: 3rem;
            color: white;
        }
        .video-link:hover .play-overlay {
            opacity: 1;
        }
        .video-date {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
    `;
    document.head.appendChild(style);

    // Adicionar funcionalidade ao botão "Leia mais"
    const readMoreBtn = document.getElementById('read-more');
    const descriptionText = document.getElementById('featured-desc');
    
    if (readMoreBtn && descriptionText) {
        readMoreBtn.addEventListener('click', () => {
            descriptionText.classList.toggle('expanded');
            readMoreBtn.classList.toggle('expanded');
            const btnText = readMoreBtn.querySelector('.btn-text');
            if (descriptionText.classList.contains('expanded')) {
                btnText.textContent = 'Mostrar menos';
            } else {
                btnText.textContent = 'Leia mais';
            }
        });
    }
});

// Start loading the YouTube API when the page loads
window.onload = loadYouTubeAPI;
