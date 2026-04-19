function compareSchemas(oldSchema, newSchema, path = "") {
  const changes = [];

  if (!oldSchema || !newSchema) return changes;

  const oldChildren = oldSchema.children || {};
  const newChildren = newSchema.children || {};

  const allKeys = new Set([
    ...Object.keys(oldChildren),
    ...Object.keys(newChildren),
  ]);

  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;

    const oldField = oldChildren[key];
    const newField = newChildren[key];

    if (oldField && !newField) {
      changes.push({
        change_type: "REMOVED_FIELD",
        field: fullPath,
        severity: "BREAKING",
      });
      continue;
    }

    if (!oldField && newField) {
      changes.push({
        change_type: "NEW_FIELD",
        field: fullPath,
        severity: "SAFE",
      });
      continue;
    }

    if (oldField.type !== newField.type) {
      changes.push({
        change_type: "TYPE_CHANGE",
        field: fullPath,
        severity: "BREAKING",
      });
    }

    if (oldField.type === "object" && newField.type === "object") {
      changes.push(
        ...compareSchemas(oldField, newField, fullPath)
      );
    }

    if (oldField.type === "array" && newField.type === "array") {
      if (oldField.items?.children && newField.items?.children) {
        changes.push(
          ...compareSchemas(
            { children: oldField.items.children },
            { children: newField.items.children },
            fullPath
          )
        );
      }
    }
  }

  return changes;
}

module.exports = { compareSchemas };