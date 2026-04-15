function getType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function extractSchema(data) {
  if (typeof data !== "object" || data === null) {
    return {
      type: getType(data),
      _meta: {
        seen: 1,
      },
    };
  }

  if (Array.isArray(data)) {
    return {
      type: "array",
      items:
        data.length > 0
          ? extractSchema(data[0]) 
          : { type: "any" },
      _meta: {
        seen: 1,
      },
    };
  }

  const schema = {};

  for (const key in data) {
    schema[key] = extractSchema(data[key]);

    schema[key].required = true;
  }

  return schema;
}

module.exports = { extractSchema };