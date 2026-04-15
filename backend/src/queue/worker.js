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
    const val = schema[key];

    if (typeof val === "object") {
      cleaned[key] = cleanSchema(val);

      if (val.type) cleaned[key].type = val.type;
      if (val.required !== undefined) cleaned[key].required = val.required;
    }
  }

  return cleaned;
}

const worker = new Worker(
  "schema-processing",
  async (job) => {
    try {
      const { endpoint, method, requestBody, responseBody, userId } = job.data;

      const requestSchema = extractSchema(requestBody || {});
      const responseSchema = extractSchema(responseBody || {});

      const rawSchema = {
        request: requestSchema,
        response: responseSchema,
      };

      const cleanedSchema = cleanSchema(rawSchema);

      const latest = await getLatestContract(endpoint, method, userId);

      if (!latest) {
        await saveContract({
          endpoint,
          method,
          schema: cleanedSchema,
          user_id: userId,
        });
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
        });

        await storeAlerts(endpoint, method, changes, userId);

        console.log("Worker detected changes:", changes);
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

worker.on("failed", (job, err) => {
  console.error(`Job failed (${job.id}):`, err.message);
});

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

console.log("Worker started...");