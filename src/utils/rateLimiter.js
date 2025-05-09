/**
 * RateLimiter - Controls request frequency
 * Uses token bucket algorithm for smooth rate limiting
 */
export class RateLimiter {
  /**
   * @param {number} requestsPerInterval - Max requests per interval (e.g. 10)
   * @param {number} intervalSeconds - Interval in seconds (e.g. 60 for 1 minute)
   */
  constructor(requestsPerInterval, intervalSeconds) {
    this.limit = requestsPerInterval;
    this.interval = intervalSeconds * 1000; // Convert to ms
    this.tokens = this.limit;
    this.lastRefill = Date.now();
    this.queue = [];
  }

  /**
   * Non-blocking version - returns immediately
   * @returns {boolean} True if request can proceed
   */
  canProceed() {
    this.#refillTokens();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  /**
   * Blocking version - use this in your API class
   * @returns {Promise<void>} Resolves when request can proceed
   */
  async checkLimit() {
    while (!this.canProceed()) {
      // Wait until next refill interval
      const waitTime = this.#getNextRefill();
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Refills tokens based on elapsed time
   * @private
   */
  #refillTokens() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    if (elapsed > this.interval) {
      this.tokens = this.limit;
      this.lastRefill = now;
      this.#processQueue();
    }
  }

  #getNextRefill() {
    const elapsed = Date.now() - this.lastRefill;
    return Math.max(0, this.interval - elapsed);
  }

  /**
   * Processes queued requests when tokens are available
   * @private
   */
  #processQueue() {
    while (this.queue.length > 0 && this.tokens > 0) {
      this.tokens--;
      const resolve = this.queue.shift();
      resolve();
    }
  }

  /**
   * Get current wait time until next available token
   * @returns {number} Milliseconds until next token
   */
  getWaitTime() {
    this.#refillTokens();
    if (this.tokens > 0) return 0;
    return this.interval - (Date.now() - this.lastRefill);
  }
}
