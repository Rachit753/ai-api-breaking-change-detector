const { createAlert } = require("../models/alertModel");
const { calculateFieldImpact } = require("./impactAnalysis");

async function storeAlerts(endpoint, method, changes, userId, projectId) {
  const storedAlerts = [];

  for (const change of changes) {
    const field = change.field;

    const impact = await calculateFieldImpact(
      endpoint,
      method,
      field,
      userId,
      projectId
    );

    let severity = "SAFE";
    if (impact > 60) severity = "BREAKING";
    else if (impact > 20) severity = "RISKY";

    const alert = await createAlert({
      endpoint,
      method,
      change_type: change.type,
      field: change.field,
      severity,
      user_id: userId,
      project_id: projectId,
    });

    if (alert) {
      storedAlerts.push({
        ...alert,
        impact,
      });
    }
  }

  return storedAlerts;
}

module.exports = { storeAlerts };