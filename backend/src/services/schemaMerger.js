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
        _meta: { occurrences: 1, total: 1 },
        required: true,
      };
      continue;
    }

    if (oldVal && !newVal) {
      const total = (oldVal._meta?.total || 1) + 1;
      const occ = oldVal._meta?.occurrences || 1;

      merged[key] = {
        ...oldVal,
        _meta: { occurrences: occ, total },
        required: false,
      };
      continue;
    }

    if (oldVal && newVal) {
      const occ = (oldVal._meta?.occurrences || 1) + 1;
      const total = (oldVal._meta?.total || 1) + 1;

      merged[key] = {
        ...newVal,
        _meta: { occurrences: occ, total },
        required: occ === total,
      };

      if (typeof newVal === "object" && !newVal.type) {
        merged[key] = mergeSchemas(oldVal, newVal);
      }
    }
  }

  return merged;
}

module.exports = { mergeSchemas };