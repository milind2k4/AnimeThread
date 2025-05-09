/**
 * Handles low-level Reddit API communication
 * - Request construction
 * - Error handling
 * - Rate limiting
 */

import { RateLimiter } from "../../utils/rateLimiter.js";

if (typeof fetch === "undefined") {
  globalThis.fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

// const DEFAULT_HEADERS = {
//   Accept: "application/json",
//   "User-Agent": "AnimeThread/1.0 (+https://github.com/milind2k4/AnimeThread)",
// };

// const DEFAULT_HEADERS = {
//   "User-Agent":
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
// };

const DEFAULT_HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'AnimeThread/1.0 (+https://github.com/milind2k4/AnimeThread)'
  };
  

export class RedditAPI {
  constructor() {
    this.rateLimiter = new RateLimiter({
      requestsPerInterval: 10,
      intervalSeconds: 60,
    });
  }

  /**
   * Executes search against Reddit's API
   * @param {string} query - Search terms
   * @param {object} options - { subreddit?: string, sort?: 'relevance'|'new' }
   * @returns {Promise<object>} Raw API response
   */

  async search(query) {
    try {
      const params = new URLSearchParams({
        q: query,
        restrict_sr: "on",
        sort: "relevance",
        limit: "10",
      });

      const response = await fetch(
        `https://www.reddit.com/r/anime/search.json?${params}`,
        {
          headers: DEFAULT_HEADERS,
          cache: "force-cache", // Respect browser caching
        }
      );

      if (!response.ok) {
        throw new Error(`Reddit API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[RedditAPI] Search failed:", error);
      throw error; // Re-throw for error handling upstream
    }
  }
}
