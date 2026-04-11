const supabase = require("../config/db");

async function createAlert({ endpoint, method, change_type, field, severity }) {
  const { data, error } = await supabase
    .from("alerts")
    .insert([{ endpoint, method, change_type, field, severity }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getAlertsByEndpoint(endpoint, method) {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = { createAlert, getAlertsByEndpoint };
