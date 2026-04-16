const { createAlert } = require("../models/alertModel");

async function storeAlerts(endpoint, method, changes, userId, projectId) {
  const storedAlerts = [];

  console.log("Saving alerts for user:", userId, "project:", projectId);

  for (const change of changes) {
    const alert = await createAlert({
      endpoint,
      method,
      change_type: change.type,
      field: change.field,
      severity: change.severity,
      user_id: userId,
      project_id: projectId,
    });

    if (alert) {
      storedAlerts.push(alert);
    }
  }

  return storedAlerts;
}

module.exports = { storeAlerts };