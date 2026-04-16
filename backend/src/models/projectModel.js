const supabase = require("../config/db");

async function createProject(name, user_id) {
  const { data, error } = await supabase
    .from("projects")
    .insert([{ name, user_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getProjects(user_id) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user_id);

  if (error) throw error;
  return data;
}

module.exports = { createProject, getProjects };