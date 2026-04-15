const supabase = require("../config/db");

async function createAlert({ endpoint, method, change_type, field, severity, user_id }) {
  const { data, error } = await supabase
    .from("alerts")
    .insert([{ endpoint, method, change_type, field, severity, user_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getAlertsByEndpoint(endpoint, method, user_id) {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = { createAlert, getAlertsByEndpoint };
