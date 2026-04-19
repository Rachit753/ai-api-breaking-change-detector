const supabase = require("../config/db");

async function logError({
  message,
  stack,
  route,
  method,
  userId,
  projectId,
}) {
  try {
    await supabase.from("error_logs").insert([
      {
        message,
        stack,
        route,
        method,
        user_id: userId || null,
        project_id: projectId || null,
      },
    ]);
  } catch (err) {
    console.error("Error logging failed:", err.message);
  }
}

module.exports = { logError };