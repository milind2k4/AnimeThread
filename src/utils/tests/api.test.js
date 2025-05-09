import { RedditAPI } from "../../services/reddit/api.js";

async function testRedditSearch() {
  console.log("Starting Reddit API test...");

  const api = new RedditAPI();
  const testQuery = "Attack on Titan: Final Season Episode 1";

  try {
    console.log(`Searching r/anime for: "${testQuery}"`);
    const response = await api.search(testQuery);

    // Validate response structure
    if (!response || !response.data || !Array.isArray(response.data.children)) {
      throw new Error("Invalid API response structure");
    }

    const posts = response.data.children;
    console.log("\nTest Results:");
    console.log(`- Found ${posts.length} posts`);

    for (let i = 0; i < 1; i++) {
      if (posts.length > 0) {
        const firstPost = posts[0].data;
        console.log(`- First post title: "${firstPost?.title}"`);
        console.log(`- Author: ${firstPost?.author}`);
        console.log(`- Subreddit: ${firstPost?.subreddit}\n`);

        // Verify it's from r/anime
        if (firstPost?.subreddit?.toLowerCase() !== "anime") {
          throw new Error("Post not from r/anime!");
        }
      }
      await api.search("Test Episode " + i);
    }

    console.log("\n✅ Test passed - Valid response structure");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    // Debugging help:
    if (error.response) {
      console.error("API Response:", JSON.stringify(error.response, null, 2));
    }
  }
}

testRedditSearch();
