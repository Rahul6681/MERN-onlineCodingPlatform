const Redis = require('ioredis');

let redisClient = null;
const memoryStore = new Map();

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    redisClient.on('connect', () => console.log('[Redis]: Connected successfully'));
    redisClient.on('error', (err) => console.warn('[Redis]: Connection warning, falling back to memory store:', err.message));
  } catch (e) {
    console.warn('[Redis]: Initialization failed, using in-memory store fallback');
  }
}

const redisService = {
  get: async (key) => {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.get(key); } catch (e) {}
    }
    return memoryStore.get(key) || null;
  },
  set: async (key, value, ttlSeconds) => {
    if (redisClient && redisClient.status === 'ready') {
      try {
        if (ttlSeconds) return await redisClient.set(key, value, 'EX', ttlSeconds);
        return await redisClient.set(key, value);
      } catch (e) {}
    }
    memoryStore.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000);
    }
    return 'OK';
  },
  del: async (key) => {
    if (redisClient && redisClient.status === 'ready') {
      try { return await redisClient.del(key); } catch (e) {}
    }
    memoryStore.delete(key);
    return 1;
  },
  getClient: () => redisClient,
};

module.exports = redisService;
