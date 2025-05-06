import { PostParser } from "../../services/reddit/parser.js";

// Real test URLs (r/anime episode discussions)
const TEST_URLS = [
  "https://www.reddit.com/r/anime/comments/jtloc6/jujutsu_kaisen_episode_7_discussion/", // Big thread
  "https://www.reddit.com/r/anime/comments/1kelub1/gorilla_no_kami_kara_kago_sareta_reijou_wa/", // Small thread
];

/**
 * Fetches and tests a real Reddit thread
 * @param {string} url - Reddit thread URL
 */
async function testThread(url) {
  console.log(`\nTesting: ${url}`);

  try {
    // 1. Fetch the thread data
    const response = await fetch(`${url}.json`, {
      headers: {
        "User-Agent": "AnimeThread-Tester/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // 2. Parse the main post
    const postData = data[0].data.children[0];
    const post = PostParser.parsePost(postData);

    console.log("✅ Parsed Post:");
    console.log(`- Title: ${post.title}`);
    console.log(`- Author: ${post.author}`);
    console.log(`- Comments: ${post.commentCount}`);

    // 3. Parse comments
    const comments = PostParser.parseComments(data);
    console.log(`✅ Found ${comments.length} top-level comments`);

    // Show comment sample
    if (comments.length > 0) {
      console.log("\nSample Comment:");
      console.log(`- Author: ${comments[0].author}`);
      console.log(`- Body: ${comments[0].body.substring(0, 50)}...`);
      console.log(`- Replies: ${comments[0].replies.length}`);
    }

    // 4. Test nested comments
    if (comments.some((c) => c.replies.length > 0)) {
      const nested = comments.flatMap((c) => c.replies);
      console.log(`✅ Found ${nested.length} nested replies`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run tests
(async () => {
  console.log("Starting live Reddit parser tests...");
  for (const url of TEST_URLS) {
    await testThread(url);
  }
})();
