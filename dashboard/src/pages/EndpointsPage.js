import { useEffect, useState } from "react";
import { fetchEndpoints } from "../api/endpoints";
import ContractsPage from "./ContractsPage";
import AlertsPage from "./AlertsPage";

function EndpointsPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchEndpoints();
        setEndpoints(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  return (
    <div>
      <h1>API Monitoring Dashboard</h1>

      <div className="card">
        {endpoints.map((e, i) => (
          <div
            key={i}
            className="endpoint-item"
            onClick={() => setSelected(e)}
          >
            <strong>{e.method}</strong> — {e.endpoint}
          </div>
        ))}
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