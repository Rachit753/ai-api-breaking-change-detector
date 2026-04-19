const { getDB } = require("../config/db");

function applyUserFilter(query, user_id) {
  if (user_id) {
    return query.eq("user_id", user_id);
  }
  return query.is("user_id", null);
}

async function saveContract({ endpoint, method, schema, user_id, project_id }) {
  const supabase = getDB();

  let query = supabase
    .from("contracts")
    .select("version")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("project_id", project_id)
    .order("version", { ascending: false })
    .limit(1);

  query = applyUserFilter(query, user_id);

  const { data: latestData } = await query;

  let newVersion = 1;

  if (latestData && latestData.length > 0) {
    newVersion = latestData[0].version + 1;
  }

  const { data, error } = await supabase
    .from("contracts")
    .insert([
      {
        endpoint,
        method,
        schema_json: schema,
        version: newVersion,
        user_id,
        project_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  console.log(`Saved contract v${newVersion} → ${endpoint}`);

  return data;
}

async function getLatestContract(endpoint, method, user_id, project_id) {
  const supabase = getDB();

  let query = supabase
    .from("contracts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("project_id", project_id)
    .order("version", { ascending: false })
    .limit(1);

  query = applyUserFilter(query, user_id);

  const { data, error } = await query.single();

  if (error) return null;
  return data;
}

module.exports = {
  saveContract,
  getLatestContract,
};