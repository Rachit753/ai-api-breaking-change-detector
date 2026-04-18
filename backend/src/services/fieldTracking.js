const supabase = require("../config/db");

async function trackFieldUsage(endpoint, method, data, userId, projectId) {
  try {
    const fields = [];

    function extract(obj, prefix = "") {
      if (!obj || typeof obj !== "object") return;

      for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        fields.push(path);

        if (typeof obj[key] === "object") {
          extract(obj[key], path);
        }
      }
    }

    if (data.request) extract(data.request, "request");
    if (data.response) extract(data.response, "response");

    const uniqueFields = [...new Set(fields)];

    for (const field of uniqueFields) {
      const { data: existing } = await supabase
        .from("field_usage")
        .select("id, count")
        .eq("endpoint", endpoint)
        .eq("method", method)
        .eq("field", field)
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("field_usage")
          .update({ count: existing.count + 1 })
          .eq("id", existing.id);
      } else {
        await supabase.from("field_usage").insert([
          {
            endpoint,
            method,
            field,
            count: 1,
            user_id: userId,
            project_id: projectId,
          },
        ]);
      }
    }
  } catch (err) {
    console.error("Field tracking error:", err.message);
  }
}

module.exports = { trackFieldUsage };