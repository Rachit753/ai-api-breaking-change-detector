const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { initDB } = require("../config/db");

function startWorker({ supabaseUrl, supabaseKey, redisUrl }) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Worker: Missing Supabase config");
  }

  initDB({ supabaseUrl, supabaseKey });

  const connection = new IORedis(
    redisUrl || process.env.REDIS_URL || "redis://127.0.0.1:6379",
    {
      maxRetriesPerRequest: null,
    }
  );

  const worker = new Worker(
    "schema-processing",
    async (job) => {
      console.log("Processing job:", job.id);
      return require("./workerProcessor")(job);
    },
    { connection, concurrency: 5 }
  );

  worker.on("completed", (job) =>
    console.log(`Job done: ${job.id}`)
  );

  worker.on("failed", (job, err) =>
    console.error(`Job failed: ${job?.id}`, err.message)
  );

  worker.on("error", (err) =>
    console.error("Worker error:", err.message)
  );

  console.log("GuardAI Worker running...");

  return worker;
}

module.exports = { startWorker };