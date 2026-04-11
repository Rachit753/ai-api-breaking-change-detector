const supabase = require("../config/db");

function hasField(obj, path) {
  const parts = path.split(".");

  let current = obj;

  for (const part of parts) {
    if (!current || !(part in current)) return false;
    current = current[part];
  }

  return true;
}

async function estimateImpact(endpoint, method, changes) {
  try {

    const { data, error } = await supabase
      .from("request_logs")
      .select("request_body")
      .eq("endpoint", endpoint)
      .eq("method", method)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (error) {
      console.error("Impact fetch error:", error.message);
      return 0;
    }

    if (!data || data.length === 0) return 0;

    const total = data.length;

    let affectedCount = 0;

    for (const row of data) {
      const body = row.request_body || {};

      for (const change of changes) {

        if (!change.field.startsWith("request.")) continue;

        const fieldPath = change.field.replace("request.", "");

        if (hasField(body, fieldPath)) {
          affectedCount++;
          break;
        }
      }
    }

    const impact = Math.round((affectedCount / total) * 100);

    return impact;
  } catch (err) {
    console.error("Impact analysis error:", err.message);
    return 0;
  }
}

module.exports = { estimateImpact };