const { extractSchema } = require("../services/schemaExtractor");
const { mergeSchemas } = require("../services/schemaMerger");
const { compareSchemas } = require("../services/changeDetection");
const { storeAlerts } = require("../services/alertService");
const { saveContract, getLatestContract } = require("../models/contractModel");
const { trackFieldUsage } = require("../services/fieldTracking");

module.exports = async function (job) {
  const {
    endpoint,
    method,
    requestBody,
    responseBody,
    userId,
    projectId,
  } = job.data;

  if (!endpoint || !method) {
    console.warn("Invalid job skipped");
    return;
  }

  const requestSchema = extractSchema(requestBody || {});
  const responseSchema = extractSchema(responseBody || {});

  const newSchema = {
    request: requestSchema,
    response: responseSchema,
  };

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
      schema: newSchema,
      user_id: userId,
      project_id: projectId,
    });
    return;
  }

  const changes = [
    ...compareSchemas(latest.schema_json.request, newSchema.request),
    ...compareSchemas(latest.schema_json.response, newSchema.response),
  ];

  if (changes.length === 0) {
    console.log("⏭ No changes → skipped");
    return;
  }

  const merged = mergeSchemas(latest.schema_json, newSchema);

  await saveContract({
    endpoint,
    method,
    schema: merged,
    user_id: userId,
    project_id: projectId,
  });

  await storeAlerts(endpoint, method, changes, userId, projectId);
};