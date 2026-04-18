const supabase = require("../config/db");

async function calculateFieldImpact(endpoint, method, field, userId, projectId) {
  try {
    const { data: logs } = await supabase
      .from("request_logs")
      .select("id")
      .eq("endpoint", endpoint)
      .eq("method", method)
      .eq("user_id", userId)
      .eq("project_id", projectId);

    const total = logs?.length || 0;
    if (total === 0) return 0;

    const { data: usage } = await supabase
      .from("field_usage")
      .select("count")
      .eq("endpoint", endpoint)
      .eq("method", method)
      .eq("field", field)
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .maybeSingle();

    const fieldCount = usage?.count || 0;

    return Math.round((fieldCount / total) * 100);
  } catch (err) {
    console.error("Impact calc error:", err.message);
    return 0;
  }
}

async function estimateImpact(endpoint, method, alerts, userId, projectId) {
  try {
    if (!alerts || alerts.length === 0) return 0;

    let maxImpact = 0;

    for (const alert of alerts) {
      const impact = await calculateFieldImpact(
        endpoint,
        method,
        alert.field,
        userId,
        projectId
      );

      if (impact > maxImpact) maxImpact = impact;
    }

    return maxImpact;
  } catch (err) {
    console.error(err);
    return 0;
  }
}

module.exports = { estimateImpact, calculateFieldImpact };