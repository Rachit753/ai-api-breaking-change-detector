function compareSchemas(oldSchema, newSchema, path = "") {
  const changes = [];

  const oldKeys = Object.keys(oldSchema || {});
  const newKeys = Object.keys(newSchema || {});


  for (const key of oldKeys) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!(key in newSchema)) {
      const wasRequired = oldSchema[key]?.required ?? true;

      changes.push({
        type: "REMOVED_FIELD",
        field: currentPath,
        severity: wasRequired ? "BREAKING" : "SAFE",
      });
      continue;
    }

    const oldVal = oldSchema[key];
    const newVal = newSchema[key];

    if (oldVal.type && newVal.type && oldVal.type !== newVal.type) {
      changes.push({
        type: "TYPE_CHANGED",
        field: currentPath,
        severity: "BREAKING",
      });
    }

    if (oldVal.required === true && newVal.required === false) {
      changes.push({
        type: "REQUIRED_TO_OPTIONAL",
        field: currentPath,
        severity: "RISKY",
      });
    }

    if (
      typeof oldVal === "object" &&
      typeof newVal === "object" &&
      !oldVal.type &&
      !newVal.type
    ) {
      changes.push(...compareSchemas(oldVal, newVal, currentPath));
    }
  }

  for (const key of newKeys) {
    if (!(key in oldSchema)) {
      const currentPath = path ? `${path}.${key}` : key;

      changes.push({
        type: "NEW_FIELD",
        field: currentPath,
        severity: "SAFE",
      });
    }
  }

  return changes;
}

module.exports = { compareSchemas };