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
    return {
      type: "array",
      items: data.length > 0 ? extractSchema(data[0]) : { type: "any" },
    };
  }

  const schema = {};

  for (const key in data) {
    schema[key] = {
      ...extractSchema(data[key]),
      required: true,
    };
  }

  return schema;
}

module.exports = { extractSchema };