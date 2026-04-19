function mergeSchemas(oldSchema = {}, newSchema = {}) {
  const merged = {};

  const keys = new Set([
    ...Object.keys(oldSchema || {}),
    ...Object.keys(newSchema || {}),
  ]);

  for (const key of keys) {
    const oldVal = oldSchema[key];
    const newVal = newSchema[key];

    if (!oldVal && newVal) {
      merged[key] = {
        ...newVal,
        _meta: {
          occurrences: 1,
          total: 1,
        },
        required: true,
      };
      continue;
    }

    if (oldVal && !newVal) {
      const total = (oldVal._meta?.total || 1) + 1;
      const occ = oldVal._meta?.occurrences || 1;

      merged[key] = {
        ...oldVal,
        _meta: {
          occurrences: occ,
          total,
        },
        required: false,
      };
      continue;
    }

    if (oldVal && newVal) {
      const occ = (oldVal._meta?.occurrences || 1) + 1;
      const total = (oldVal._meta?.total || 1) + 1;

      const typeChanged = oldVal.type !== newVal.type;

      let mergedField = {
        ...newVal,
        type: typeChanged ? "any" : newVal.type,
        _meta: {
          occurrences: occ,
          total,
        },
        required: occ === total,
      };

      if (newVal.type === "object") {
        mergedField.children = mergeSchemas(
          oldVal.children || {},
          newVal.children || {}
        );
      }

      if (newVal.type === "array") {
        mergedField.items = mergeArrayItems(
          oldVal.items,
          newVal.items
        );
      }

      merged[key] = mergedField;
    }
  }

  return merged;
}

function mergeArrayItems(oldItems = {}, newItems = {}) {
  
  if (!oldItems || !newItems) {
    return { type: "any" };
  }

  if (!oldItems.children && !newItems.children) {
    if (oldItems.type !== newItems.type) {
      return { type: "any" };
    }

    return { type: newItems.type };
  }

  if (!!oldItems.children !== !!newItems.children) {
    return { type: "any" };
  }

  return {
    type: "object",
    children: mergeSchemas(
      oldItems.children || {},
      newItems.children || {}
    ),
  };
}

module.exports = { mergeSchemas };