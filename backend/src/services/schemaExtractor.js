function getType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function extractSchema(data) {
  if (typeof data !== "object" || data === null) {
    return getType(data);
  }

  if (Array.isArray(data)) {
    return data.length > 0 ? [extractSchema(data[0])] : ["any"];
  }

  const schema = {};

  for (const key in data) {
    schema[key] = extractSchema(data[key]);
  }

  return schema;
}

module.exports = { extractSchema };
