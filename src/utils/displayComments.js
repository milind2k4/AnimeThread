/**
 * Formats and prints comments to console with depth-based indentation
 * @param {ParsedComment[]} comments - Array of parsed comments
 * @param {object} options - Formatting options
 * @param {number} [options.indentSize=2] - Spaces per indentation level
 * @param {boolean} [options.showHeader=true] - Show section headers
 * @param {number} [options.lineWidth=80] - Max characters per line
 */
export function displayCommentHierarchy(comments, options = {}) {
  const { indentSize = 2, showHeader = true, lineWidth = 80 } = options;

  let commentCount = 0;

  /**
   * Recursive comment printer
   * @param {ParsedComment} comment
   * @param {number} depth
   */
  function processComment(comment, depth = 0) {
    commentCount++;
    const indent = " ".repeat(depth * indentSize);
    const separator = "-".repeat(lineWidth - depth * indentSize);

    // Print metadata
    console.log(`\n${indent}╭${separator}`);
    console.log(
      `${indent}│ 👤 ${comment.author} | ✨ ${comment.score} | 📅 ${new Date(
        comment.created
      ).toLocaleDateString()}`
    );
    console.log(`${indent}╰${separator}`);

    // Print wrapped body text
    const bodyLines = wrapText(comment.body, lineWidth - depth * indentSize);
    bodyLines.forEach((line) => {
      console.log(`${indent}${line}`);
    });

    // Process replies
    comment.replies.forEach((reply) => processComment(reply, depth + 1));
  }

  /**
   * Text wrapping helper
   * @param {string} text
   * @param {number} width
   */
  function wrapText(text, width) {
    return text.split(0,width);
  }

  // Print header
  if (showHeader) {
    console.log("\n┌───────────────────────────");
    console.log("│ COMMENTS");
    console.log("└───────────────────────────");
  }

  // Process all top-level comments
  comments.forEach(processComment);

  // Print footer
  if (showHeader) {
    console.log("\n────────────────────────────");
    console.log(`Total comments displayed: ${commentCount}`);
  }
}
