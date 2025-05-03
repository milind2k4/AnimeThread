function extractEnglishTitle() {
    const titleElement = document.querySelector('.al-title.text-expand');
    if (!titleElement) {
        console.error("Title element not found.");
        return null;
    }

    const titleText = titleElement.textContent.trim();
    const titles = titleText.split(';');

    if (titles.length >= 2) {
        return titles[1].trim(); // The second title is the English title
    }
    return null; // Return null if we cannot extract the English title
}

function extractJapaneseTitle() {
    const titleElement = document.querySelector('.al-title.text-expand');
    if (!titleElement) {
        console.error("Title element not found.");
        return { japaneseTitle: null };
    }

    const titleText = titleElement.textContent.trim();
    const titles = titleText.split(';');
    
    const japaneseTitle = titles.length >= 1 ? titles[0].trim() : null;
    
    return japaneseTitle;
}

function extractEpisode(url) {
    const episodeRegex = /#ep=(\d+)/;
    const episodeMatch = url.match(episodeRegex);
    const episodeNumber = episodeMatch ? episodeMatch[1] : "Unknown";

    return episodeNumber;    
}

async function searchRedditPosts(query, pageJapanese, pageEnglish, urlEpisodeNumber) {
    const url = `https://www.reddit.com/r/anime/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch data: ${response.status}`);
            return null;
        }

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
            let postEnglish = "";
            let postJapanese = "";
            let episodeNumber = null;

            const dualTitleMatch = title.match(/^(.*?)\s*•\s*(.*?)\s*-\s*Episode/i);
            const singleTitleMatch = title.match(/^(.*?)\s*-\s*Episode/i);

            if (dualTitleMatch) {
                postJapanese = dualTitleMatch[1].trim();
                postEnglish = dualTitleMatch[2].trim();
            } else if (singleTitleMatch) {
                postEnglish = postJapanese = singleTitleMatch[1].trim();
            }

            const episodeMatch = title.match(/Episode\s+(\d+)\s+discussion/i);
            episodeNumber = episodeMatch ? episodeMatch[1] : null;

            const titleMatches = (
                postEnglish.toLowerCase() === pageEnglish.toLowerCase() || 
                postJapanese.toLowerCase() === pageJapanese.toLowerCase()
            );

            if (titleMatches && episodeNumber === urlEpisodeNumber) {
                return postData;
            }
        }

        return null;
    } catch (error) {
        console.error("Error fetching Reddit posts:", error);
        return null;
    }
}


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
    
    commentBoxContainer.innerHTML = `
    <h3>${title}</h3>
    <p><strong>Author:</strong> ${author}</p>
    <p><strong>Comments:</strong> ${num_comments}</p>
    <p><strong>Posted on:</strong> ${createdDate}</p>
    <p><a href="https://reddit.com${permalink}" target="_blank">View on Reddit</a></p>
    `;
}

function debugLog(){
    const commentBoxContainer = document.createElement("div");
    commentBoxContainer.id = "commentsBox";
    document.body.appendChild(commentBoxContainer);
    
    const url = window.location.href;

    const pageEnglish = extractEnglishTitle();
    const pageJapanese = extractJapaneseTitle();
    const episodeNumber = extractEpisode(url);

    const query = `${pageEnglish} - Episode ${episodeNumber} discussion`;
    
    commentBoxContainer.innerHTML = `
        <h3>${pageEnglish}</h3>
        <p>${pageJapanese}</p>
        <p>${episodeNumber}</p>
        <p>${query}</p>
    `;
    
}

async function displayRedditComments() {
    const url = window.location.href;

    const pageEnglish = extractEnglishTitle();
    const pageJapanese = extractJapaneseTitle();
    const episodeNumber = extractEpisode(url);

    if (!pageEnglish || !pageJapanese || !episodeNumber) {
        console.error('Failed to extract necessary data');
        return;
    }

    const query = `${pageJapanese} - Episode ${episodeNumber} discussion`;
    const post = await searchRedditPosts(query, pageJapanese, pageEnglish, episodeNumber);

    createCommentBox(post);
}

// debugLog();
displayRedditComments();