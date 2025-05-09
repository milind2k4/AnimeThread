/**
 * Reddit parser with comment extraction
 * Handles both post parsing and comment threading
 */
export class PostParser {
  /**
   * Parses the main discussion post
   * @param {object} post - Raw Reddit API post data
   * @returns {ParsedPost|null}
   */
  static parsePost(post) {
    if (!post?.data) return null;

    try {
      return {
        id: post.data.id,
        title: post.data.title,
        author: post.data.author,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.score || 0,
        commentCount: post.data.num_comments || 0,
        created: new Date(post.data.created_utc * 1000),
        isDiscussion: this.#isEpisodeDiscussion(post.data),
        commentsUrl: `https://reddit.com${post.data.permalink}.json`,
      };
    } catch (error) {
      console.error("[Parser] Post parsing failed:", error);
      return null;
    }
  }

  /**
   * Fetches comments for a given post
   * @param {ParsedPost} post - Parsed post object
   * @returns {ParsedComment[]}
   */
  static async postComments(post) {
    if (!post?.commentsUrl) {
      throw new Error("Post has no comments URL");
    }

    try {
      const response = await fetch(post.commentsUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return this.parseComments(await response.json());
    } catch (error) {
      console.error("Comment fetch failed:", error);
      return [];
    }
  }

  /**
   * Parses a Reddit comment tree into structured format
   * @param {array} commentTree - Raw Reddit API comments data
   * @returns {ParsedComment[]} - Flattened comments with hierarchy
   */
  static parseComments(commentTree) {
    if (!Array.isArray(commentTree)) return [];

    try {
      // The first item is the post itself, second is comments
      const comments = commentTree[1]?.data?.children || [];
      // Skip first comment (AutoModerator) and process the rest
      return comments
        .slice(1)
        .map((comment) => this.#parseCommentNode(comment))
        .filter(Boolean);
    } catch (error) {
      console.error("[Parser] Comment parsing failed:", error);
      return [];
    }
  }

  /**
   * Recursively parses a comment and its replies
   * @private
   * @param {object} node - Raw comment data
   * @param {number} depth - Current nesting level
   * @returns {ParsedComment|null}
   */
  static #parseCommentNode(node, depth = 0) {
    if (!node?.data || node.kind !== "t1") return null;

    const comment = node.data;
    return {
      id: comment.id,
      author: comment.author,
      body: comment.body,
      score: comment.score,
      created: new Date(comment.created_utc * 1000),
      depth: depth,
      replies:
        comment.replies?.data?.children
          ?.map((reply) => this.#parseCommentNode(reply, depth + 1))
          .filter(Boolean) || [],
    };
  }

  /**
   * Checks if post is an episode discussion
   * @private
   * @param {object} postData - Raw post data
   * @returns {boolean}
   */
  static #isEpisodeDiscussion(postData) {
    return (
      postData.author === "AutoLovepon" &&
      /(?:Episode|Ep\.?)\s+\d+/i.test(postData.title)
    );
  }
}

/**
 * Type definitions (for documentation)
 * @typedef {object} ParsedPost
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} url
 * @property {number} score
 * @property {number} commentCount
 * @property {Date} created
 * @property {boolean} isDiscussion
 * @property {string} commentsUrl - URL to fetch comments
 *
 * @typedef {object} ParsedComment
 * @property {string} id
 * @property {string} author
 * @property {string} body
 * @property {number} score
 * @property {Date} created
 * @property {number} depth - Comment nesting level (0 = top-level)
 * @property {ParsedComment[]} replies
 */
