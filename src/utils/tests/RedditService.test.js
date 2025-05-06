/**
 * Reddit Service Single Test
 * Run with: node reddit-service.test.js
 *
 * Demonstrates usage with one metadata example
 * Prints all available properties from the result
 */
import { RedditService } from "../../services/reddit/RedditService.js";

// Single test case
const metadata = {
  englishTitle: "Shoshimin 2",
  japaneseTitle: "Shoshimin 2",
  episode: 5,
};

(async () => {
  console.log("=== Reddit Service Test ===");
  console.log("Testing with metadata:", metadata, "\n");

  try {
    const result = await RedditService.findDiscussion(metadata);

    if (result) {
      console.log("✅ Found Discussion Post");
      console.log("=======================");

      // Print all available properties
      console.log("ID:", result.id);
      console.log("Title:", result.title);
      console.log("Author:", result.author);
      console.log("URL:", result.url);
      console.log("Score:", result.score);
      console.log("Comment Count:", result.commentCount);
      console.log("Created:", result.created);
      console.log("Is Discussion:", result.isDiscussion);

      if (result.commentsUrl) {
        console.log("Comments URL:", result.commentsUrl);
      }
    } else {
      console.log("❌ No discussion found for this metadata");
    }
  } catch (error) {
    console.log("💥 Error:", error.message);
  }
})();
