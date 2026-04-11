const supabase = require("../config/db");

async function createUser(email, hashedPassword) {
    const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data;
}

module.exports = { createUser, findUserByEmail };