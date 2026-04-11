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

const worker = new Worker(
  "schema-processing",
  async (job) => {
    const { endpoint, method, requestBody, responseBody } = job.data;

    const requestSchema = extractSchema(requestBody || {});
    const responseSchema = extractSchema(responseBody || {});

    const rawSchema = {
      request: requestSchema,
      response: responseSchema,
    };

    const latest = await getLatestContract(endpoint, method);

    if (!latest) {
      await saveContract({
        endpoint,
        method,
        schema: rawSchema,
      });
      return;
    }

    const changes = compareSchemas(latest.schema_json, rawSchema);

    let merged = mergeSchemas(latest.schema_json, rawSchema);

    if (changes.length > 0) {
      await saveContract({
        endpoint,
        method,
        schema: merged,
      });

      await storeAlerts(endpoint, method, changes);

      console.log("Worker detected changes:", changes);
    }
  },
  { connection }
);

console.log("Worker started...");