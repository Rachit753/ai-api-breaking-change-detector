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
    <div>
      <h2>Monitored Endpoints</h2>

      {endpoints.length === 0 ? (
        <p>No endpoints found.</p>
      ) : (
        <ul>
          {endpoints.map((ep, index) => (
            <li
              key={index}
              style={{ cursor: "pointer", marginBottom: 8 }}
              onClick={() => setSelected(ep)}
            >
              <strong>{ep.method}</strong> — {ep.endpoint}
            </li>
          ))}
        </ul>
      )}

      {/* Show contracts when selected */}
      {selected && (
  <>
    <ContractsPage endpoint={selected.endpoint} method={selected.method} />
    <AlertsPage endpoint={selected.endpoint} method={selected.method} />
  </>
)}
    </div>
  );
}

export default EndpointsPage;

