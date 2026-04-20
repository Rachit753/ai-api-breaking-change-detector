import { useState } from "react";
import { simulateRequest } from "../api/simulator";

function SimulatorPage() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("POST");
  const [body, setBody] = useState("{}");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_API = process.env.REACT_APP_API_URL;

  async function handleSend() {
    try {
      setLoading(true);

      if (!url.startsWith("/")) {
        alert("Endpoint must start with / (example: /test-user)");
        setLoading(false);
        return;
      }

      const parsedBody = JSON.parse(body || "{}");

      const res = await simulateRequest({
        url: `${BASE_API}${url}`,
        method,
        body: parsedBody,
      });

      setResponse(res);
    } catch (err) {
      console.error(err);
      setResponse({ error: "Invalid request or JSON format" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>API Testing Simulator</h2>

      <input
        placeholder="Enter endpoint (e.g. /test-user)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>DELETE</option>
      </select>

      <textarea
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send Request"}
      </button>

      {response && (
        <div className="card">
          <h3>Response</h3>
          <pre className="code-block">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default SimulatorPage;