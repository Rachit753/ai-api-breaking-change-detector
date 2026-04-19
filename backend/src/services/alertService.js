const supabase = require("../config/db");
const { calculateFieldImpact } = require("./impactAnalysis");

function getSeverity(changeType) {
  switch (changeType) {
    case "REMOVED_FIELD":
    case "TYPE_CHANGE":
      return "BREAKING";

    case "NEW_FIELD":
      return "SAFE";

    default:
      return "SAFE";
  }
}

async function storeAlerts(endpoint, method, changes, userId, projectId) {
  for (const change of changes) {
    const { field, change_type } = change;

    let severity = getSeverity(change_type);

    if (change_type === "NEW_FIELD") {
      severity = "SAFE";
      change.severity = "SAFE"; 
    }

    const impact = await calculateFieldImpact(
      endpoint,
      method,
      field,
      userId,
      projectId
    );

    const { data: existing } = await supabase
      .from("alerts")
      .select("*")
      .eq("endpoint", endpoint)
      .eq("method", method)
      .eq("field", field)
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (existing) {
      
      await supabase
        .from("alerts")
        .update({
          occurrence_count: (existing.occurrence_count || 1) + 1,
          severity,
        })
        .eq("id", existing.id);
    } else {
      
      await supabase.from("alerts").insert([
        {
          endpoint,
          method,
          field,
          change_type,
          severity,
          occurrence_count: 1,
          user_id: userId,
          project_id: projectId,
        },
      ]);
    }
  }
}

module.exports = { storeAlerts };