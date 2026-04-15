const supabase = require("../config/db");

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (!acc) return undefined;
    return acc[key];
  }, obj);
}

async function estimateImpact(endpoint, method, alerts) {
  try {
    if (!alerts || alerts.length === 0) return 0;

    const breakingFields = alerts
      .filter((a) => a.severity === "BREAKING")
      .map((a) => a.field.replace("request.", ""));

    if (breakingFields.length === 0) return 0;

    const { data, error } = await supabase
      .from("request_logs")
      .select("request_body")
      .eq("endpoint", endpoint)
      .eq("method", method);

    if (error) throw error;

    let affected = 0;

    for (const row of data) {
      const body = row.request_body || {};

      for (const field of breakingFields) {
        const value = getNestedValue(body, field);

        if (value !== undefined) {
          affected++;
          break;
        }
      }
    }

    const total = data.length || 1;

    return Math.round((affected / total) * 100);
  } catch (err) {
    console.error("Impact calculation error:", err.message);
    return 0;
  }
}

module.exports = { estimateImpact };