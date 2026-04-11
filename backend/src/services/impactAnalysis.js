const supabase = require("../config/db");

async function estimateImpact(endpoint, method) {
  const { data, error } = await supabase
    .from("request_logs")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

  if (error) throw error;

  const total = data.length;
  if (total === 0) return 0;

  const estimated = Math.round(total * 0.7);

  return Math.round((estimated / total) * 100);
}

module.exports = { estimateImpact };