/**
 * Optimized search for single episode discussion
 * Relies on PostParser's built-in AutoLovepon verification
 */
import { RedditAPI } from "./api.js";
import { PostParser } from "./parser.js";

export class RedditSearch {
  constructor() {
    this.api = new RedditAPI();
  }

  /**
   * Finds one episode discussion thread
   * @param {object} metadata - { japaneseTitle: string, englishTitle: string, episode: number }
   * @returns {Promise<ParsedPost|null>}
   */
  async findEpisodeDiscussion(metadata) {
    if (!metadata?.englishTitle || !metadata.episode) {
      throw new Error("Must provide englishTitle and episode number");
    }

    try {
      const query = `${metadata.englishTitle} - Episode ${metadata.episode} discussion`;
      const response = await this.api.search(query);

      if (!response?.data?.children) return null;

      for (const post of response.data.children) {
        const parsed = PostParser.parsePost(post);
        if (
          parsed?.isDiscussion &&
          this.#fuzzyMatch(
            parsed.title,
            metadata.japaneseTitle,
            metadata.englishTitle
          ) &&
          new RegExp(`Episode ${metadata.episode}(\\D|$)`, "i").test(
            parsed.title
          )
        ) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.error("[RedditSearch] Failed:", error);
      return null;
    }
  }

  /**
   * Basic fuzzy matching (60% term match threshold)
   * @private
   */

  #fuzzyMatch(postTitle, japaneseTitle, englishTitle) {
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, "");

    const postTitleNormalized = normalize(postTitle);
    const englishNormalized = normalize(englishTitle);
    const japaneseNormalized = normalize(japaneseTitle);

    // Check match percentage for both titles
    const matchScore = (title) => {
      const terms = title.split(/\s+/);
      const matched = terms.filter((term) =>
        postTitleNormalized.includes(term)
      );
      return matched.length / terms.length;
    };

    return (
      matchScore(englishNormalized) > 0.6 ||
      matchScore(japaneseNormalized) > 0.6
    );
  }
}
