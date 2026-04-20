import { useEffect, useState } from "react";
import { fetchContracts } from "../api/contracts";

function ContractsPage({ endpoint, method }) {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchContracts(endpoint, method);
        setContracts(data || []);
      } catch (err) {
        console.error("Contracts error:", err);
      }
    }
    load();
  }, [endpoint, method]);

  return (
    <div className="card">
      <h3>Contracts</h3>

      {contracts.length === 0 ? (
        <p>No contracts found</p>
      ) : (
        contracts.map((c) => (
          <div key={c.id} style={{ marginBottom: 20 }}>
            <strong>Version {c.version}</strong>

            <pre className="code-block">
              {JSON.stringify(c.schema_json, null, 2)}
            </pre>
          </div>
        ))
      )}
    </div>
  );
}

export default ContractsPage;