/**
 * Reddit Comment Printer Test
 *
 * Tests comment fetching and displays formatted output
 */
import { RedditService } from "../../services/reddit/RedditService.js";
import { PostParser } from "../../services/reddit/parser.js";

// Test configuration
const displayOptions = {
  indentSize: 4,
  lineWidth: 80,
  showHeader: true,
  indentChar: "-",
};

const metadata = {
  englishTitle: "Shoshimin: How to become Ordinary Season 2",
  japaneseTitle: "Shoushimin Series Season 2",
  episode: 5,
};

// Helper to count all comments (including replies)
function countComments(comments) {
  return comments.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies);
  }, 0);
}

/**
 * Displays top X comments with replies in indented format
 * @param {ParsedComment[]} comments - Array of parsed comments
 * @param {object} options - Formatting options
 * @param {number} [options.maxTopComments=5] - Number of top comments to show
 * @param {number} [options.width=80] - Line width
 * @param {number} [options.maxDepth=3] - Maximum reply depth to display
 * @param {number} [options.indentSize=2] - Spaces per reply level
 * @param {string} [options.indentChar=" "] - Character for indentation
 */
export function displayTopComments(comments, options = {}) {
  const {
    maxTopComments = 5,
    indentSize = 2,
    maxDepth = 3,
    width = 99,
    indentChar = " "
  } = options;

  if (!comments?.length) {
    console.log("No comments to display");
    return;
  }

  let displayedCount = 0;
  const totalComments = comments.length;

  // Print header
  console.log(`\n=== TOP ${maxTopComments} COMMENTS ===\n`);

  function processComment(comment, depth = 0) {
    if (depth > maxDepth) return;

    const indent = indentChar.repeat(depth * indentSize);
    console.log(
      `${indent} @${comment.author} (▲ ${comment.score}):`
    );
    console.log(
      `${indent}  ${comment.body.substring(0, width)}`
    );

    // Process replies if within depth limit
    if (depth < maxDepth) {
      comment.replies.forEach((reply) => processComment(reply, depth + 1));
    }
  }

  // Process top-level comments
  comments.slice(0,maxTopComments).forEach((comment) => {
    displayedCount++;
    processComment(comment);
    console.log("\n" + "-".repeat(40) + "\n");
  });

  // Print summary
  if (totalComments > displayedCount) {
    console.log(`Showing top ${displayedCount} of ${totalComments} comments`);
    console.log(`(Limited to ${maxDepth} reply levels deep)`);
  }
}

// Test execution
(async () => {
  try {
    console.log("Fetching discussion post...");
    const post = await RedditService.findDiscussion(metadata);

    if (!post) {
      throw new Error("No discussion post found");
    }

    console.log(`\nFound Post: "${post.title}"`);
    console.log(`Fetching comments from: ${post.commentsUrl}\n`);

    const comments = await PostParser.postComments(post);
    displayTopComments(comments, displayOptions);
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  }
})();
