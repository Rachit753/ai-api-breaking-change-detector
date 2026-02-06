const { createAlert } = require("../models/alertModel");

async function storeAlerts(endpoint, method, changes) {
  const storedAlerts = [];

  for (const change of changes) {
    const alert = await createAlert({
      endpoint,
      method,
      change_type: change.type,
      field: change.field,
      severity: change.severity,
    });

    storedAlerts.push(alert);
  }

  return storedAlerts;
}

module.exports = { storeAlerts };
