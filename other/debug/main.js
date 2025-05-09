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

    // Try dual title format first (Japanese • English - Episode X)
    const dualTitleMatch = title.match(/^(.*?)\s*•\s*(.*?)\s*-\s*Episode/i);
    if (dualTitleMatch) {
        postJapanese = dualTitleMatch[1].trim();
        postEnglish = dualTitleMatch[2].trim();
    } 
    // Try single title format (Title - Episode X)
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
    if (!post) {
        commentBoxContainer.innerHTML = '<p>No comments found.</p>';
        return;
    }
    
    const { title, author, permalink, num_comments } = post;
    
    console.log(`
        ${title}
        Author: ${author}
        Comments: ${num_comments}
        https://reddit.com${permalink}
        `
    );
}

function queryGenerator() {
    const pageJapanese = "Shoushimin Series 2nd Season";
    const pageEnglish = "Shoshimin: How to Become Ordinary Season 2";
    const episodeNumber = "5";

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

async function allPosts(query, pageJapanese, pageEnglish, urlEpisodeNumber) {
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
        let result = posts;
        
        // If no match found, try with fallback query
        if (!result && query !== pageEnlgish + " Episode " + urlEpisodeNumber + " discussion") {
            response = await fetch(fallbackUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
                }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            data = await response.json();
            posts = data.data.children;
            result = posts;
        }

        return result || null;
    } catch (error) {
        console.error("Error fetching Reddit posts:", error);
        return null;
    }
}

function searchResults(posts) {
    if (posts.length === 0) {
        console.log("No posts found.");
        return;
    }

    for (const post of posts) {
        const { title, author, permalink, num_comments } = post.data;
    
        console.log(`
            Title: ${title}
            Aurthor: ${author}
            Comments: ${num_comments}
            Link: https://reddit.com${permalink}
            ------------------------------------------------
            `
        );
    }
}


// allPosts(queryGenerator())
//     .then(posts => {
//         searchResults(posts);
//     })
//     .catch(error => {
//         console.error("Error:", error);
// });

// debugPageInfo();

displayRedditComments();