const supabase = require("../config/db");

async function createAlert({
  endpoint,
  method,
  change_type,
  field,
  severity,
  user_id,
  project_id,
}) {
  const { data: existing } = await supabase
    .from("alerts")
    .select("id")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("change_type", change_type)
    .eq("field", field)
    .eq("user_id", user_id)
    .eq("project_id", project_id) 
    .limit(1);

  if (existing && existing.length > 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("alerts")
    .insert([
      {
        endpoint,
        method,
        change_type,
        field,
        severity,
        user_id,
        project_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getAlertsByEndpoint(endpoint, method, user_id, project_id) {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("user_id", user_id)
    .eq("project_id", project_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = { createAlert, getAlertsByEndpoint };
