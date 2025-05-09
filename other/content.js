function extractEnglishTitle() {
    const titleElement = document.querySelector('.al-title.text-expand');
    if (!titleElement) return null;
    
    const titles = titleElement.textContent.trim().split(';');
    if (titles.length < 1) return null;
    
    return titles[titles.length > 1 ? 1 : 0].trim();
}

function extractJapaneseTitle() {
    const titleElement = document.querySelector('.al-title.text-expand');
    if (!titleElement) {
        console.error("Title element not found.");
        return null;
    }

    const titleText = titleElement.textContent.trim();
    const titles = titleText.split(';');
    
    const japaneseTitle = titles.length >= 1 ? titles[0].trim() : null;
    
    return japaneseTitle;
}


function extractEpisode(url) {
    const match = url.match(/#ep=(\d+)/);
    return match ? match[1] : null; 
}

function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')  // remove punctuation
        .replace(/\s+/g, ' ')     // collapse whitespace
        .trim();
}

function parsePostTitle(title) {
    let postEnglish = "";
    let postJapanese = "";
    let episodeNumber = null;

    // Try dual title format first (Japanese • English - Episode X discussion)
    const dualTitleMatch = title.match(/^(.*?)\s*•\s*(.*?)\s*-\s*Episode/i);
    if (dualTitleMatch) {
        postJapanese = dualTitleMatch[1].trim();
        postEnglish = dualTitleMatch[2].trim();
    } 
    // Try single title format (Title - Episode X discussion)
    else {
        const singleTitleMatch = title.match(/^(.*?)\s*-\s*Episode/i);
        if (singleTitleMatch) {
            postEnglish = postJapanese = singleTitleMatch[1].trim();
        }
    }

    // Extract episode number using multiple patterns
    const episodeMatch = title.match(/(?:Episode|Ep\.?|#)\s*(\d+)/i);
    episodeNumber = episodeMatch ? episodeMatch[1] : null;

    return { postEnglish, postJapanese, episodeNumber };
}

function findMatchingPost(posts, pageJapanese, pageEnglish, urlEpisodeNumber) {
    if (!posts || posts.length === 0) {
        console.log("No posts found.");
        return null;
    }

    // Normalize titles for comparison
    const normPageJapanese = normalizeTitle(pageJapanese);
    const normPageEnglish = normalizeTitle(pageEnglish);

    for (const post of posts) {
        const postData = post.data;
        
        // Skip if not AutoLovepon's post
        if (postData.author !== "AutoLovepon") continue;

        const title = postData.title;
        
        // Extract titles and episode number
        const { postEnglish, postJapanese, episodeNumber } = parsePostTitle(title);

        // Normalize extracted titles
        const normPostEnglish = normalizeTitle(postEnglish);
        const normPostJapanese = normalizeTitle(postJapanese);

        // Check for title match (either English or Japanese)
        const titleMatches = (
            normPostEnglish === normPageEnglish ||
            normPostEnglish === normPageJapanese ||
            normPostJapanese === normPageEnglish ||
            normPostJapanese === normPageJapanese ||
            normPageEnglish.includes(normPostEnglish) ||
            normPostEnglish.includes(normPageEnglish)
        );

        // Check episode number match
        const episodeMatches = (
            episodeNumber === urlEpisodeNumber ||
            String(episodeNumber) === String(urlEpisodeNumber)
        );

        if (titleMatches && episodeMatches) {
            return postData;
        }
    }

    return null;
}


async function searchRedditPosts(query, pageJapanese, pageEnglish, urlEpisodeNumber) {
    const url = `https://www.reddit.com/r/anime/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance`;
    const fallbackUrl = `https://www.reddit.com/r/anime/search.json?q=${encodeURIComponent(`${pageJapanese} - Episode ${urlEpisodeNumber} discussion`)}&restrict_sr=1&sort=relevance`;

    try {
        // First try with the full query
        let response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        let data = await response.json();
        let posts = data.data.children;
        let result = findMatchingPost(posts, pageJapanese, pageEnglish, urlEpisodeNumber);
        
        // If no match found, try with fallback query
        if (!result && query !== pageEnglish + " Episode " + urlEpisodeNumber + " discussion") {
            response = await fetch(fallbackUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            data = await response.json();
            posts = data.data.children;
            result = findMatchingPost(posts, pageJapanese, pageEnglish, urlEpisodeNumber);
        }

        return result || null;
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

export function queryGenerator() {
    const pageJapanese = extractJapaneseTitle();
    const pageEnglish = extractEnglishTitle();
    const episodeNumber = extractEpisode(window.location.href);

    if (!pageEnglish || !pageJapanese || !episodeNumber) {
        console.error('Failed to extract necessary data');
        return null;
    }

    return {
        query: `${pageEnglish} - Episode ${episodeNumber} discussion`,
        pageJapanese,
        pageEnglish,
        episodeNumber
    }
};

async function displayRedditComments() {
    const { query, pageJapanese, pageEnglish, episodeNumber } = queryGenerator();
    const post = await searchRedditPosts(query, pageJapanese, pageEnglish, episodeNumber);
    
    createCommentBox(post);
}

function debugPageInfo(){
    const commentBoxContainer = document.createElement("div");
    commentBoxContainer.id = "commentsBox";
    document.body.appendChild(commentBoxContainer);
    
    
    const { query, pageJapanese, pageEnglish, episodeNumber } = queryGenerator();
    
    commentBoxContainer.innerHTML = `
        <h3>Eng: ${pageEnglish}</h3>
        <p>Jap: ${pageJapanese}</p>
        <p>Ep: ${episodeNumber}</p>
        <p>Query: ${query}</p>
    `;
    
}

async function debugRedditPosts(query) {
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

function debugSearchResults(posts) {
    const commentBoxContainer = document.createElement("div");
    commentBoxContainer.id = "commentsBox";
    document.body.appendChild(commentBoxContainer);

    if (posts.length === 0) {
        commentBoxContainer.innerHTML = '<p>No comments found.</p>';
        return;
    }

    for (const post of posts) {
        const header = document.createElement("div");
        const { title, author, permalink, num_comments } = post.data;
    
        header.innerHTML = `
            <h3>Reddit Comments for: ${title}</h3>
            <h4>Author: ${author}</h4>
            <h4>Comments: ${num_comments}</h4>
            <a href="${'https://reddit.com' + permalink}" target="_blank">Go to Reddit Post</a>
        `;
        commentBoxContainer.appendChild(header);
    }
}


// debugRedditPosts(queryGenerator())
//     .then(posts => {
//         debugSearchResults(posts);
//     })
//     .catch(error => {
//         console.error("Error:", error);
// });

debugPageInfo();

// displayRedditComments();