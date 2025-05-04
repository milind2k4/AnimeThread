// popup.js

document.addEventListener("DOMContentLoaded", () => {
    const commentsButton = document.querySelector(".showComments");
    const debugButton = document.querySelector(".showDebugLog");
    const outputContainer = document.querySelector(".outputContainer");

    async function handleShowComments() {
        outputContainer.innerHTML = "Loading comments...";
        
        // Extract necessary data for query
        const url = window.location.href;
        const pageEnglish = extractEnglishTitle();
        const pageJapanese = extractJapaneseTitle();
        const episodeNumber = extractEpisode(url);
        const query = `${pageEnglish} - Episode ${episodeNumber} discussion`;

        // Send a message to the content script to get the comments
        browser.runtime.sendMessage(
            {
                action: "displayComments"
                // query: query,
                // pageJapanese: pageJapanese,
                // pageEnglish: pageEnglish,
                // urlEpisodeNumber: episodeNumber
            },
            (response) => {
                if (response.success) {
                    createCommentBox(response.post);
                } else {
                    outputContainer.innerHTML = "Error fetching comments.";
                    console.error("Error fetching comments:", response.error);
                }
            }
        );
    }

    function handleShowDebug() {
        outputContainer.innerHTML = "Loading debug logs...";

        // Extract necessary data for debug logs
        const url = window.location.href;
        const pageEnglish = extractEnglishTitle();
        const pageJapanese = extractJapaneseTitle();
        const episodeNumber = extractEpisode(url);

        // Send a message to the content script to get the debug log
        chrome.runtime.sendMessage(
            {
                action: "showDebug"
                // pageEnglish: pageEnglish,
                // pageJapanese: pageJapanese,
                // episodeNumber: episodeNumber
            },
            (response) => {
                if (response.success) {
                    outputContainer.innerHTML = `
                        <h3>Debug Log</h3>
                        <p>English Title: ${response.debugInfo.pageEnglish}</p>
                        <p>Japanese Title: ${response.debugInfo.pageJapanese}</p>
                        <p>Episode: ${response.debugInfo.episodeNumber}</p>
                    `;
                } else {
                    outputContainer.innerHTML = "Error fetching debug info.";
                    console.error("Error fetching debug info:", response.error);
                }
            }
        );
    }

    // Event listeners for buttons
    commentsButton.addEventListener("click", handleShowComments);
    debugButton.addEventListener("click", handleShowDebug);
});
