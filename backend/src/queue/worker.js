const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const { extractSchema } = require("../services/schemaExtractor");
const { mergeSchemas } = require("../services/schemaMerger");
const { compareSchemas } = require("../services/changeDetection");
const { storeAlerts } = require("../services/alertService");
const { saveContract, getLatestContract } = require("../models/contractModel");
const { trackFieldUsage } = require("../services/fieldTracking");

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
    } else {
      cleaned[key] = val;
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

      await trackFieldUsage(
        endpoint,
        method,
        { request: requestBody, response: responseBody },
        userId,
        projectId
      );

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

      const requestChanges = compareSchemas(
        latest.schema_json.request,
        cleanedSchema.request,
        "request"
      );

      const responseChanges = compareSchemas(
        latest.schema_json.response,
        cleanedSchema.response,
        "response"
      );

      const map = new Map();
      
      for (const c of [...requestChanges, ...responseChanges]) {
        const normalizedField = c.field
        .replace("request.", "")
          .replace("response.", "");
        
        const key = `${normalizedField}-${c.change_type}`;

        if (!map.has(key)) {
          map.set(key, {
            change_type: c.change_type,
            field: normalizedField,
            severity: c.severity,
          });
        }
      }
      
      const changes = Array.from(map.values());

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