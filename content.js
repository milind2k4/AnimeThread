// Function to extract the English title
function extractEnglishTitle(pageTitle) {
    const regex = /^Anime (.*?) Watch Online Free - AnimeKAI/;
    const match = pageTitle.match(regex);
    return match ? match[1] : null;
}

function extractJapaneseTitleAndEpisode(url) {
    // Match the full slug after /watch/ and the episode number after #ep=
    const animeRegex = /\/watch\/([^\/#]+)/;
    const episodeRegex = /#ep=(\d+)/;

    const animeMatch = url.match(animeRegex);
    const episodeMatch = url.match(episodeRegex);

    let rawAnimeSlug = animeMatch ? animeMatch[1] : "";

    // Always remove the last part (assumed to be the identifier)
    const parts = rawAnimeSlug.split("-");
    if (parts.length > 1) {
        parts.pop(); // remove the ID like 'xeqq'
    }

    // Convert remaining parts to Title Case
    const japaneseTitle = parts
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .trim();

    const episodeNumber = episodeMatch ? episodeMatch[1] : "Unknown Episode";

    return { japaneseTitle, episodeNumber };
}

// Function to search Reddit for posts matching the anime title and episode number
async function searchRedditPosts(query) {
    const url = `https://www.reddit.com/r/anime/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    });

    if (!response.ok) {
        console.error('Error fetching Reddit posts');
        return [];
    }

    const data = await response.json();
    return data.data.children;
}


if (window.location.hostname.includes("animekai.to")) {
    const { japaneseTitle, episodeNumber } = extractJapaneseTitleAndEpisode(window.location.href);
    const englishTitle = extractEnglishTitle(document.title);
    const query = `${japaneseTitle} • ${englishTitle} - Episode ${episodeNumber} discussion`;

    // Create the container for the comments box
    const commentBoxContainer = document.createElement("div");
    commentBoxContainer.id = "commentsBox";
    document.body.appendChild(commentBoxContainer);

    // Add header with anime name and episode
    const header = document.createElement("div");
    header.innerHTML = `
        <h3>Comments for: ${englishTitle}</h3>
        <h3>Comments for: ${japaneseTitle}</h3>
        <h4>Episode: ${episodeNumber}</h4>
        <h4>Query: ${query}</h4>
    `;
    commentBoxContainer.appendChild(header);

    // Add loading message or placeholder
    const loadingText = document.createElement("p");
    loadingText.textContent = "Loading comments...";
    commentBoxContainer.appendChild(loadingText);
}

/*

// Function to create and append the comment box on the page
function createCommentBox(posts) {
    const commentBoxContainer = document.createElement("div");
    commentBoxContainer.id = "commentsBox";
    document.body.appendChild(commentBoxContainer);

    if (posts.length === 0) {
        commentBoxContainer.innerHTML = '<p>No comments found.</p>';
        return;
    }

    const header = document.createElement("div");
    const { title, author, permalink, num_comments, created_utc } = posts[0].data;
    const createdDate = new Date(created_utc * 1000).toLocaleString();

    header.innerHTML = `
        <h3>Reddit Comments for: ${title}</h3>
        <h3>Reddit Comments for: ${query}</h3>
        <h4>Author: ${author}</h4>
        <h4>Comments: ${num_comments}</h4>
        <h4>Created on: ${createdDate}</h4>
        <h4>Created on: ${posts.length}</h4>
        <a href="${'https://reddit.com' + permalink}" target="_blank">Go to Reddit Post</a>
    `;
    commentBoxContainer.appendChild(header);
}

// Main function to extract anime title, episode number, search Reddit and display the comments
async function displayRedditComments() {
    // Extract the page title and URL
    const pageTitle = document.title;
    const url = window.location.href;

    // Extract English title from page title and Japanese title + episode number from URL
    const englishTitle = extractEnglishTitle(pageTitle);
    const { japaneseTitle, episodeNumber } = extractJapaneseTitleAndEpisode(url);

    if (!englishTitle || !japaneseTitle || !episodeNumber) {
        console.error('Failed to extract necessary data');
        return;
    }

    // Create the search query
    const query = `${japaneseTitle} • ${englishTitle} - Episode ${episodeNumber} discussion`;

    // Search Reddit for the query
    const posts = searchRedditPosts(query);

    // Create the comment box and append Reddit comments
    createCommentBox(posts);
}

// Run the function to display Reddit comments when the page loads
displayRedditComments();
*/