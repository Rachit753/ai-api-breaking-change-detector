const { getDB } = require("../config/db");

async function storeAlerts(endpoint, method, changes, userId, projectId) {
  const supabase = getDB();

  for (const change of changes) {
    const { field, change_type } = change;

    const severity =
      change_type === "REMOVED_FIELD" || change_type === "TYPE_CHANGE"
        ? "BREAKING"
        : "SAFE";

    const { error } = await supabase.rpc("upsert_alert", {
      p_endpoint: endpoint,
      p_method: method,
      p_field: field,
      p_change_type: change_type,
      p_severity: severity,
      p_user_id: userId,
      p_project_id: projectId,
    });

    if (error) {
      console.error("Alert RPC error:", error.message);
    }
  }
}

module.exports = { storeAlerts };