/**
 * Public API for Reddit services
 */
import { RedditSearch } from "./search.js";

// Single instance pattern
const searchService = new RedditSearch();

export const RedditService = {
  /**
   * @param {object} metadata - { japaneseTitle: string, englishTitle: string, episode: number }
   * @returns {Promise<ParsedPost>} Filtered discussion post
   */
  findDiscussion: (metadata) => searchService.findEpisodeDiscussion(metadata),
};