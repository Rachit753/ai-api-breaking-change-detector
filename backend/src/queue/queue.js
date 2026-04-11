const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
});

const schemaQueue = new Queue("schema-processing", {
  connection,
});

module.exports = { schemaQueue };