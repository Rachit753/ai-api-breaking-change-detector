const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const { extractSchema } = require("../services/schemaExtractor");
const { mergeSchemas } = require("../services/schemaMerger");
const { compareSchemas } = require("../services/changeDetection");
const { storeAlerts } = require("../services/alertService");
const { saveContract, getLatestContract } = require("../models/contractModel");

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
});

function cleanSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;

  const cleaned = {};

  for (const key in schema) {
    if (key === "_meta") continue;

    const val = schema[key];

    if (typeof val === "object") {
      const nested = cleanSchema(val);

      if (val.type) nested.type = val.type;
      if (val.required !== undefined) nested.required = val.required;

      cleaned[key] = nested;
    }
  }

  return cleaned;
}

const worker = new Worker(
  "schema-processing",
  async (job) => {
    try {
      const {
        endpoint,
        method,
        requestBody,
        responseBody,
        userId,
        projectId,
      } = job.data;

      console.log(`Processing job ${job.id} → ${endpoint}`);

      const requestSchema = extractSchema(requestBody || {});
      const responseSchema = extractSchema(responseBody || {});

      const rawSchema = {
        request: requestSchema,
        response: responseSchema,
      };

      const cleanedSchema = cleanSchema(rawSchema);

      const latest = await getLatestContract(
        endpoint,
        method,
        userId,
        projectId
      );

      if (!latest) {
        await saveContract({
          endpoint,
          method,
          schema: cleanedSchema,
          user_id: userId,
          project_id: projectId,
        });

        console.log(`Initial contract saved → ${endpoint}`);
        return;
      }

      const changes = compareSchemas(
        latest.schema_json,
        cleanedSchema
      );

      console.log("CHANGES:", changes);

      let merged = mergeSchemas(latest.schema_json, cleanedSchema);
      merged = cleanSchema(merged);

      if (changes.length > 0) {
        await saveContract({
          endpoint,
          method,
          schema: merged,
          user_id: userId,
          project_id: projectId,
        });

        await storeAlerts(
          endpoint,
          method,
          changes,
          userId,
          projectId
        );

        console.log(`Changes detected → ${endpoint}`);
      } else {
        console.log(`No changes → ${endpoint}`);
      }

    } catch (err) {
      console.error("Worker job failed:", err.message);
      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed (${job.id}):`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err.message);
});

console.log("Worker started...");