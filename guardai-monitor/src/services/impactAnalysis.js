const { getDB } = require("../config/db");

function findFieldMeta(schema, targetField) {
  if (!schema || !schema.children) return null;

  for (const key in schema.children) {
    const field = schema.children[key];

    if (key === targetField) {
      return field._meta || null;
    }

    if (field.type === "object") {
      const res = findFieldMeta(field, targetField);
      if (res) return res;
    }

    if (field.type === "array" && field.items?.children) {
      const res = findFieldMeta(
        { children: field.items.children },
        targetField
      );
      if (res) return res;
    }
  }

  return null;
}

async function calculateFieldImpact(endpoint, method, field, userId, projectId) {
  try {
    const supabase = getDB();

    const { data: contract } = await supabase
      .from("contracts")
      .select("schema_json")
      .eq("endpoint", endpoint)
      .eq("method", method)
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (!contract) return 0;

    const cleanField = (field || "")
      .replace(/^request\./, "")
      .replace(/^response\./, "");

    const meta =
      findFieldMeta(contract.schema_json.request, cleanField) ||
      findFieldMeta(contract.schema_json.response, cleanField);

    if (!meta) return 0;

    const { occurrences = 0, total = 1 } = meta;

    if (total === 0) return 0;

    const impact = (occurrences / total) * 100;

    return Math.round(impact);
  } catch (err) {
    console.error("Impact calc error:", err.message);
    return 0;
  }
}

async function estimateImpact(endpoint, method, alerts, userId, projectId) {
  try {
    if (!alerts || alerts.length === 0) return 0;

    const breakingAlerts = alerts.filter(
      (a) => a.severity === "BREAKING"
    );

    if (breakingAlerts.length === 0) return 0;

    const impacts = await Promise.all(
      breakingAlerts.map((a) =>
        calculateFieldImpact(
          endpoint,
          method,
          a.field,
          userId,
          projectId
        )
      )
    );

    const maxImpact = Math.max(...impacts, 0);

    return Math.min(100, maxImpact);
  } catch (err) {
    console.error("Impact estimation error:", err.message);
    return 0;
  }
}

module.exports = {
  estimateImpact,
  calculateFieldImpact,
};