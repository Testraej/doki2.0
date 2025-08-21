// This script fetches data from our scraper API and populates the website.

document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on and call the appropriate function
    if (document.getElementById('latest-grid')) {
        loadLatestEpisodes();
    }
    // Add similar checks for other pages if you create them
    // e.g., if (document.getElementById('search-grid')) { loadSearchResults(); }
});

/**
 * Fetches the latest episodes from our /api/latest endpoint
 * and displays them on the homepage.
 */
async function loadLatestEpisodes() {
    const grid = document.getElementById('latest-grid');
    
    try {
        const response = await fetch('/api/latest');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const episodes = await response.json();

        // Clear the loader
        grid.innerHTML = '';

        // Create a card for each episode
        episodes.forEach(episode => {
            const card = document.createElement('a');
            card.href = "#"; // In a real app, this would link to the watch page
            card.className = 'anime-card';

            card.innerHTML = `
                <img src="${episode.imageUrl}" alt="${episode.animeTitle}" loading="lazy">
                <div class="anime-card-info">
                    <p class="anime-card-title">${episode.animeTitle}</p>
                    <p class="anime-card-episode">${episode.episodeText}</p>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Failed to load latest episodes:", error);
        grid.innerHTML = '<p style="color: red;">Could not load episodes. Is the server running?</p>';
    }
}
