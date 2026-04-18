const { createOrUpdateAlert } = require("../models/alertModel");
const { calculateFieldImpact } = require("./impactAnalysis");

function getSeverity(changeType) {
  switch (changeType) {
    case "REMOVED_FIELD":
    case "TYPE_CHANGED":
    case "OPTIONAL_TO_REQUIRED":
      return "BREAKING";

    case "REQUIRED_TO_OPTIONAL":
      return "RISKY";

    case "NEW_FIELD":
      return "SAFE";

    default:
      return "SAFE";
  }
}

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

    const severity = getSeverity(change.type);

    const alert = await createOrUpdateAlert({
      endpoint,
      method,
      change_type: change.type,
      field,
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