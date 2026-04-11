const supabase = require("../config/db");

async function saveContract({ endpoint, method, schema }) {
  const { data: latestData } = await supabase
    .from("contracts")
    .select("version")
    .eq("endpoint", endpoint)
    .eq("method", method)
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
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getLatestContract(endpoint, method) {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

async function getAllEndpoints() {
  const { data, error } = await supabase
    .from("contracts")
    .select("endpoint, method");

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

async function getContractsByEndpoint(endpoint, method) {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("endpoint", endpoint)
    .eq("method", method)
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