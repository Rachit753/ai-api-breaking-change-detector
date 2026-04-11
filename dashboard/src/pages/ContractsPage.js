import { useEffect, useState } from "react";
import { fetchContracts } from "../api/contracts";

function ContractsPage({ endpoint, method }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContracts() {
      try {
        const data = await fetchContracts(endpoint, method);
        setContracts(data);
      } catch (err) {
        console.error("Failed to load contracts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadContracts();
  }, [endpoint, method]);

  if (loading) return <p>Loading contract history...</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h2>
        Contract History — {method} {endpoint}
      </h2>

      {contracts.length === 0 ? (
        <p>No contract versions found.</p>
      ) : (
        contracts.map((c) => (
          <div key={c.id} className="card" style={{ marginBottom: 12 }}>
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

