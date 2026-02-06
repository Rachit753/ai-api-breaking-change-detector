function compareSchemas(oldSchema, newSchema, path = "") {
  const changes = [];

  // Check removed or changed fields
  for (const key in oldSchema) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!(key in newSchema)) {
      changes.push({
        type: "REMOVED_FIELD",
        field: currentPath,
        severity: "BREAKING",
      });
      continue;
    }

    if (typeof oldSchema[key] === "object" && typeof newSchema[key] === "object") {
      changes.push(...compareSchemas(oldSchema[key], newSchema[key], currentPath));
    } else if (oldSchema[key] !== newSchema[key]) {
      changes.push({
        type: "TYPE_CHANGED",
        field: currentPath,
        severity: "BREAKING",
      });
    }
  }

  // Check new fields
  for (const key in newSchema) {
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
