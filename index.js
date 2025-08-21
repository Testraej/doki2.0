// index.js
// This is the main server file for our application.
// It runs the scraper bot and serves the DokiAnime website.

// Import necessary libraries
const express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// --- Serve the Front-End Website ---
// This tells Express to serve all the files in the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));


// --- SCRAPER BOT API ENDPOINTS ---

// API Endpoint to Scrape Homepage Data
app.get('/api/latest', (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, 'homepage.html'), 'utf8');
        const $ = cheerio.load(html);
        const latestEpisodes = [];

        $('#latest-tab-pane .card.component-latest').each((index, element) => {
            const card = $(element);
            latestEpisodes.push({
                animeTitle: card.find('.animename').text().trim(),
                imageUrl: "https://anify.to" + card.find('.animeposter img').attr('data-src'),
                watchLink: "https://anify.to" + card.find('.animeparent').attr('href'),
                animeDetailsLink: "https://anify.to" + card.find('.animeinfo > a').attr('href'),
                episodeText: card.find('.ep').text().trim().split('\n')[0].trim(),
                episodeTitle: card.find('.animetitle').text().trim() || "No title available"
            });
        });
        res.json(latestEpisodes);
    } catch (error) {
        console.error('Error scraping latest data:', error);
        res.status(500).json({ message: 'Failed to scrape latest data.' });
    }
});

// API Endpoint to Scrape Search Results
app.get('/api/search', (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, 'search.html'), 'utf8');
        const $ = cheerio.load(html);
        const searchResults = [];

        $('.card.component-animelist').each((index, element) => {
            const card = $(element);
            const genres = [];
            card.find('.badge-listgenre').each((i, genreEl) => {
                genres.push($(genreEl).text().trim());
            });

            searchResults.push({
                title: card.find('.animename').text().trim(),
                detailsLink: "https://anify.to" + card.find('.animeinfo > a').attr('href'),
                imageUrl: "https://anify.to" + card.find('.animeposter img').attr('data-src'),
                score: card.find('.badge.score').text().trim(),
                year: card.find('.badge.year').text().trim(),
                genres: genres
            });
        });
        res.json(searchResults);
    } catch (error) {
        console.error('Error scraping search data:', error);
        res.status(500).json({ message: 'Failed to scrape search data.' });
    }
});

// API Endpoint to Scrape Anime Info Page
app.get('/api/info', (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, 'animeinfo.html'), 'utf8');
        const $ = cheerio.load(html);
        const genres = [];
        $('a[href*="/search/?genres[]="]').each((i, el) => {
            genres.push($(el).text().trim());
        });
        
        const episodes = [];
        $('#episodes-tab-pane .episodefilter').each((i, el) => {
            const episodeCard = $(el);
            episodes.push({
                title: episodeCard.find('.animename').text().trim(),
                watchLink: "https://anify.to" + episodeCard.find('a').attr('href'),
                thumbnail: "https://anify.to" + episodeCard.find('img').attr('data-src'),
                type: episodeCard.find('.badge-movie').text().trim() || 'Episode'
            });
        });

        const animeInfo = {
            title: $('h2.dynamic-name').text().trim(),
            posterImage: "https://anify.to" + $('img.main-poster').attr('data-src'),
            description: $('span.description').first().text().trim(),
            score: $('span.badge-score').text().trim(),
            rating: $('span.badge-rating').text().trim(),
            year: $('span.badge-year').text().trim(),
            status: $('span.badge-status').text().trim(),
            genres: genres,
            episodes: episodes
        };
        res.json(animeInfo);
    } catch (error) {
        console.error('Error scraping anime info:', error);
        res.status(500).json({ message: 'Failed to scrape anime info.' });
    }
});

// API Endpoint to Scrape Streaming Page
app.get('/api/stream', (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, 'streaming.html'), 'utf8');
        const $ = cheerio.load(html);
        const streamSources = [];
        $('#videotab .nav-link').each((i, el) => {
            const onclickAttr = $(el).attr('onclick');
            const iframeSrcMatch = onclickAttr.match(/src="([^"]+)"/);
            if (iframeSrcMatch && iframeSrcMatch[1]) {
                 streamSources.push({
                    server: $(el).text().trim(),
                    url: "https://anify.to" + iframeSrcMatch[1]
                });
            }
        });

        const episodeList = [];
        $('.episodes-wrapper a.btn-episodelist').each((i, el) => {
            episodeList.push({
                episode: $(el).text().trim(),
                link: "https://anify.to" + $(el).attr('href'),
                filler: $(el).hasClass('filler')
            });
        });

        const streamInfo = {
            animeTitle: $('.episode-header .animename').text().trim(),
            episodeNumber: $('.episode-header .anime_ep').text().trim(),
            episodeTitle: $('.episode-header .animetitle').text().trim(),
            streamSources: streamSources,
            episodeList: episodeList
        };
        res.json(streamInfo);
    } catch (error) {
        console.error('Error scraping streaming page:', error);
        res.status(500).json({ message: 'Failed to scrape streaming page.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`DokiAnime server is running on http://localhost:${PORT}`);
});
