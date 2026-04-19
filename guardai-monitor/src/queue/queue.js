const { Queue } = require("bullmq");
const IORedis = require("ioredis");

let connection;
let schemaQueue;

function createConnection(redisUrl) {
  try {
    if (!redisUrl) {
      console.warn("No REDIS_URL → queue disabled");
      return null;
    }

    const isTLS = redisUrl.startsWith("rediss://");

    return new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      ...(isTLS ? { tls: {} } : {}),
    });
  } catch (err) {
    console.error("Redis init failed:", err.message);
    return null;
  }
}

function initQueue(redisUrl) {
  if (!connection) {
    connection = createConnection(redisUrl);
  }

  if (!connection) {
    return { schemaQueue: null, connection: null };
  }

  if (!schemaQueue) {
    schemaQueue = new Queue("schema-processing", {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }

  return { schemaQueue, connection };
}

module.exports = { initQueue };