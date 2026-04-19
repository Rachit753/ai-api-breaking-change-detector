function getType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
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
    const types = new Set(itemSchemas.map((s) => s.type));

    if (types.size > 1) {
      return {
        type: "array",
        items: { type: "any" },
        required: true,
      };
    }

    const firstType = itemSchemas[0].type;

    if (firstType !== "object") {
      return {
        type: "array",
        items: { type: firstType },
        required: true,
      };
    }

    const mergedItems = mergeObjectSchemas(
      itemSchemas.map((s) => s.children || {})
    );

    return {
      type: "array",
      items: {
        type: "object",
        children: mergedItems,
      },
      required: true,
    };
  }

  const children = {};

  for (const key in data) {
    const extracted = extractSchema(data[key]);

    if (extracted.type === "object") {
      children[key] = {
        type: "object",
        children: extracted.children,
        required: true,
      };
    } else if (extracted.type === "array") {
      children[key] = {
        type: "array",
        items: extracted.items,
        required: true,
      };
    } else {
      children[key] = {
        type: extracted.type,
        required: true,
      };
    }
  }

  return {
    type: "object",
    children,
    required: true,
  };
}

function mergeObjectSchemas(schemas) {
  const merged = {};
  const allKeys = new Set();

  schemas.forEach((schema) => {
    Object.keys(schema || {}).forEach((key) => allKeys.add(key));
  });

  allKeys.forEach((key) => {
    const values = schemas.map((s) => s[key]).filter(Boolean);

    if (values.length === 0) return;

    const types = new Set(values.map((v) => v.type));
    const base = values[0];

    if (base.type !== "object" && base.type !== "array") {
      merged[key] = {
        type: types.size === 1 ? base.type : "any",
        required: values.length === schemas.length,
      };
      return;
    }

    if (base.type === "object") {
      merged[key] = {
        type: "object",
        children: mergeObjectSchemas(
          values.map((v) => v.children || {})
        ),
        required: values.length === schemas.length,
      };
      return;
    }

    if (base.type === "array") {
      const itemTypes = new Set(
        values.map((v) => v.items?.type || "any")
      );

      if (itemTypes.size > 1) {
        merged[key] = {
          type: "array",
          items: { type: "any" },
          required: values.length === schemas.length,
        };
        return;
      }

      if (base.items?.children) {
        merged[key] = {
          type: "array",
          items: {
            type: "object",
            children: mergeObjectSchemas(
              values.map((v) => v.items?.children || {})
            ),
          },
          required: values.length === schemas.length,
        };
        return;
      }

      merged[key] = {
        type: "array",
        items: {
          type: base.items?.type || "any",
        },
        required: values.length === schemas.length,
      };
    }
  });

  return merged;
}

module.exports = { extractSchema };