import { useEffect, useState } from "react";
import { fetchEndpoints } from "../api/endpoints";
import ContractsPage from "./ContractsPage";
import AlertsPage from "./AlertsPage";

function EndpointsPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchEndpoints();
        setEndpoints(data);
      } catch (err) {
        console.error("Failed to load endpoints:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading endpoints...</p>;

  return (
    <div className="container">
      <h1>GuardAI Developer Dashboard</h1>

      <h2>Monitored Endpoints</h2>

      <div className="card">
        {endpoints.length === 0 ? (
          <p>No endpoints found.</p>
        ) : (
          endpoints.map((e, i) => (
            <div
              key={i}
              className="endpoint-item"
              onClick={() => setSelected(e)}
            >
              <strong>{e.method}</strong> — {e.endpoint}
            </div>
          ))
        )}
      </div>

      {selected && (
        <>
          <ContractsPage
            endpoint={selected.endpoint}
            method={selected.method}
          />
          <AlertsPage
            endpoint={selected.endpoint}
            method={selected.method}
          />
        </>
      )}
    </div>
  );
}

export default EndpointsPage;
