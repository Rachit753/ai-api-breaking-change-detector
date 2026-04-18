const supabase = require("../config/db");

async function generateInsights(userId, projectId) {
  try {
    const insights = [];
    const recommendations = [];

    const { data: alerts } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId);

    const { data: logs } = await supabase
      .from("request_logs")
      .select("endpoint, method")
      .eq("user_id", userId)
      .eq("project_id", projectId);

    if (!alerts || alerts.length === 0) {
      return {
        insights: ["No alerts detected — system stable"],
        recommendations: ["No action required"],
      };
    }

    const breakingCount = alerts.filter(
      (a) => a.severity === "BREAKING"
    ).length;

    if (breakingCount >= 1) {
      insights.push(`Detected ${breakingCount} breaking changes`);

      recommendations.push(
        "Avoid removing required fields — this breaks existing clients"
      );
    }

    const riskyCount = alerts.filter(
      (a) => a.severity === "RISKY"
    ).length;

    if (riskyCount >= 1) {
      insights.push(`Detected ${riskyCount} risky changes`);

      recommendations.push(
        "Review risky changes — may cause partial failures"
      );
    }

    const endpointMap = {};

    alerts.forEach((a) => {
      const key = `${a.endpoint}-${a.method}`;
      endpointMap[key] = (endpointMap[key] || 0) + 1;
    });

    Object.entries(endpointMap).forEach(([key, count]) => {
      if (count >= 2) {
        insights.push(`Endpoint ${key} is unstable (${count} changes)`);

        recommendations.push(
          `Stabilize endpoint ${key} — frequent schema changes detected`
        );
      }
    });

    if (logs && logs.length > 0) {
      const trafficMap = {};

      logs.forEach((l) => {
        const key = `${l.endpoint}-${l.method}`;
        trafficMap[key] = (trafficMap[key] || 0) + 1;
      });

      const top = Object.entries(trafficMap).sort(
        (a, b) => b[1] - a[1]
      )[0];

      if (top) {
        insights.push(
          `High traffic on ${top[0]} (${top[1]} requests)`
        );

        recommendations.push(
          `Ensure stability for high-traffic endpoint ${top[0]}`
        );
      }
    }

    if (insights.length === 0) {
      insights.push("System is stable");
    }

    if (recommendations.length === 0) {
      recommendations.push("No immediate action required");
    }

    return { insights, recommendations };
  } catch (err) {
    console.error("Insights error:", err.message);
    return {
      insights: ["Failed to generate insights"],
      recommendations: [],
    };
  }
}

module.exports = { generateInsights };