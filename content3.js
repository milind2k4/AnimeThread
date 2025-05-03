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
async function searchRedditPosts(query, pageEnglishTitle, urlEpisodeNumber) {
    const url = `https://www.reddit.com/r/anime/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance`;

    try {
        const response = await fetch(url);

        const data = await response.json();
        const posts = data.data.children;

        if (!posts.length) {
            console.log("No posts found.");
            return null;
        }

        for (const post of posts) {
            const postData = post.data;
            if (postData.author !== "AutoLovepon") continue;

            const title = postData.title;
            let englishTitle = "";
            let episodeNumber = null;

            const dualTitleMatch = title.match(/•\s*(.*?)\s*-\s*Episode/i);
            const singleTitleMatch = title.match(/^(.*?)\s*-\s*Episode/i);

            if (dualTitleMatch) {
                englishTitle = dualTitleMatch[1].trim();
            } else if (singleTitleMatch) {
                englishTitle = singleTitleMatch[1].trim();
            }

            const episodeMatch = title.match(/Episode\s+(\d+)\s+discussion/i);
            episodeNumber = episodeMatch ? episodeMatch[1] : null;

            if (englishTitle === pageEnglishTitle && episodeNumber === urlEpisodeNumber) {
                return postData;
            }
        }

        return null;

    } catch (error) {
        console.error("Error fetching Reddit posts:", error);
        return null;
    }
}



// if (window.location.hostname.includes("animekai.to")) {
//     const { japaneseTitle, episodeNumber } = extractJapaneseTitleAndEpisode(window.location.href);
//     const englishTitle = extractEnglishTitle(document.title);
//     const query = `${japaneseTitle} • ${englishTitle} - Episode ${episodeNumber} discussion`;

//     // Create the container for the comments box
//     const commentBoxContainer = document.createElement("div");
//     commentBoxContainer.id = "commentsBox";
//     document.body.appendChild(commentBoxContainer);

//     // Add header with anime name and episode
//     const header = document.createElement("div");
//     header.innerHTML = `
//         <h3>Comments for: ${englishTitle}</h3>
//         <h3>Comments for: ${japaneseTitle}</h3>
//         <h4>Episode: ${episodeNumber}</h4>
//         <h4>Query: ${query}</h4>
//     `;
//     commentBoxContainer.appendChild(header);

//     // Add loading message or placeholder
//     const loadingText = document.createElement("p");
//     loadingText.textContent = "Loading comments...";
//     commentBoxContainer.appendChild(loadingText);
// }

// Function to create and append the comment box on the page
function createCommentBox(post) {
    const commentBoxContainer = document.createElement("div");
    commentBoxContainer.id = "commentsBox";
    document.body.appendChild(commentBoxContainer);

    if (!post) {
        commentBoxContainer.innerHTML = '<p>No comments found.</p>';
        return;
    }

    const { title, author, permalink, num_comments, created_utc } = post;
    const createdDate = new Date(created_utc * 1000).toLocaleString();

    const header = document.createElement("div");
    header.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Author:</strong> ${author}</p>
        <p><strong>Comments:</strong> ${num_comments}</p>
        <p><strong>Posted on:</strong> ${createdDate}</p>
        <p><strong>Search results:</strong> ${posts.length}</p>
        <p><a href="https://reddit.com${permalink}" target="_blank">View on Reddit</a></p>
    `;

    commentBoxContainer.appendChild(header);
}

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
    const query = `${japaneseTitle} - Episode ${episodeNumber} discussion`;

    // Search Reddit for the query
    const post = await searchRedditPosts(query, englishTitle, episodeNumber);

    // Create the comment box and append Reddit comments
    createCommentBox(post);
}

displayRedditComments();