function getType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function mergeObjectSchemas(schemas) {
  const merged = {};

  const allKeys = new Set();

  schemas.forEach((schema) => {
    Object.keys(schema).forEach((key) => allKeys.add(key));
  });

  allKeys.forEach((key) => {
    const values = schemas
      .map((s) => s[key])
      .filter(Boolean);

    if (values.length === 0) return;

    const types = new Set(values.map((v) => v.type));

    const base = values[0];

    merged[key] = {
      type: types.size === 1 ? base.type : "any",
      required: values.length === schemas.length,
    };

    if (base.type === "object") {
      merged[key] = mergeObjectSchemas(
        values.map((v) => v.children || {})
      );
    }

    if (base.type === "array") {
      merged[key] = {
        type: "array",
        items: mergeObjectSchemas(
          values.map((v) => v.items || {})
        ),
        required: values.length === schemas.length,
      };
    }
  });

  return merged;
}

function extractSchema(data) {
  if (typeof data !== "object" || data === null) {
    return {
      type: getType(data),
      required: true,
    };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return {
        type: "array",
        items: { type: "any" },
        required: true,
      };
    }

    const itemSchemas = data.map((item) => extractSchema(item));

    let mergedItems;

    if (typeof itemSchemas[0] !== "object" || itemSchemas[0].type !== "object") {
      const types = new Set(itemSchemas.map((s) => s.type));

      mergedItems = {
        type: types.size === 1 ? itemSchemas[0].type : "any",
      };
    } else {
    
      mergedItems = mergeObjectSchemas(itemSchemas);
    }

    return {
      type: "array",
      items: mergedItems,
      required: true,
    };
  }

  const schema = {};

  for (const key in data) {
    const extracted = extractSchema(data[key]);

    schema[key] = {
      ...extracted,
      required: true,
    };
  }

  return schema;
}

module.exports = { extractSchema };