function compareSchemas(oldSchema, newSchema, path = "") {
  const changes = [];

  const buildPath = (base, key) => (base ? `${base}.${key}` : key);

  const oldKeys = Object.keys(oldSchema || {});
  const newKeys = Object.keys(newSchema || {});

  for (const key of oldKeys) {
    const currentPath = buildPath(path, key);

    if (!(key in newSchema)) {
      changes.push({
        type: "REMOVED_FIELD",
        field: currentPath,
        severity: "BREAKING",
      });
      continue;
    }

    const oldVal = oldSchema[key];
    const newVal = newSchema[key];

    if (oldVal?.type && newVal?.type && oldVal.type !== newVal.type) {
      changes.push({
        type: "TYPE_CHANGED",
        field: currentPath,
        severity: "BREAKING",
      });
    }

    if (oldVal?.required === true && newVal?.required === false) {
      changes.push({
        type: "REQUIRED_TO_OPTIONAL",
        field: currentPath,
        severity: "RISKY",
      });
    }

    if (oldVal?.required === false && newVal?.required === true) {
      changes.push({
        type: "OPTIONAL_TO_REQUIRED",
        field: currentPath,
        severity: "BREAKING",
      });
    }

    if (oldVal?.type === "array" && newVal?.type === "array") {
      const oldItems = oldVal.items || {};
      const newItems = newVal.items || {};

      changes.push(
        ...compareSchemas(
          oldItems,
          newItems,
          `${currentPath}[]`
        )
      );
    }

    if (
      typeof oldVal === "object" &&
      typeof newVal === "object" &&
      !oldVal.type &&
      !newVal.type
    ) {
      changes.push(
        ...compareSchemas(oldVal, newVal, currentPath)
      );
    }
  }

  for (const key of newKeys) {
    if (!(key in oldSchema)) {
      const currentPath = buildPath(path, key);

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