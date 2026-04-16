const supabase = require("../config/db");

async function saveContract({ endpoint, method, schema, user_id, project_id }) {
  const { data: latestData } = await supabase
    .from("contracts")
    .select("version")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("user_id", user_id)
    .eq("project_id", project_id)
    .order("version", { ascending: false })
    .limit(1);

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
  return data;
}

async function getLatestContract(endpoint, method, user_id, project_id) {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("user_id", user_id)
    .eq("project_id", project_id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

async function getAllEndpoints(user_id, project_id) {
  const { data, error } = await supabase
    .from("contracts")
    .select("endpoint, method")
    .eq("user_id", user_id)
    .eq("project_id", project_id);

  if (error) throw error;

  const unique = [];
  const seen = new Set();

  for (const item of data) {
    const key = `${item.endpoint}-${item.method}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
}

async function getContractsByEndpoint(endpoint, method, user_id, project_id) {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .eq("user_id", user_id)
    .eq("project_id", project_id)
    .order("version", { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = {
  saveContract,
  getLatestContract,
  getAllEndpoints,
  getContractsByEndpoint,
};