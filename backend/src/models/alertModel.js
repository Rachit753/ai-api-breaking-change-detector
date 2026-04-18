const supabase = require("../config/db");

async function createOrUpdateAlert({
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
    .select("id, occurrence_count")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("change_type", change_type)
    .eq("field", field)
    .eq("user_id", user_id)
    .eq("project_id", project_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("alerts")
      .update({
        occurrence_count: existing.occurrence_count + 1,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
        occurrence_count: 1,
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

module.exports = { createOrUpdateAlert, getAlertsByEndpoint };