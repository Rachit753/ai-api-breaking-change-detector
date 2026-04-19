const { createClient } = require("@supabase/supabase-js");

let supabase = null;

function initDB({ supabaseUrl, supabaseKey }) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase config missing");
  }

  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

function getDB() {
  if (!supabase) {
    throw new Error("GuardAI: Supabase not initialized");
  }
  return supabase;
}

module.exports = { initDB, getDB };