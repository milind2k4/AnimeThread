// Test file (test-limiter.js)
import { RateLimiter } from '../rateLimiter.js';

async function testLimiter() {
  const limiter = new RateLimiter(20, 2); // 2 requests per 5 seconds
  
  console.log("Starting test...");
  
  for (let i = 1; i <= 5; i++) {
    const start = Date.now();
    await limiter.checkLimit();
    console.log(`Request ${i} passed after ${Date.now() - start}ms`);
  }
}

testLimiter();