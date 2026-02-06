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
      <h3>
        Contract History — {method} {endpoint}
      </h3>

      {contracts.length === 0 ? (
        <p>No contract versions found.</p>
      ) : (
        <ul>
          {contracts.map((c) => (
            <li key={c.id} style={{ marginBottom: 10 }}>
              <strong>Version {c.version}</strong>
              <pre
                style={{
                  background: "#f4f4f4",
                  padding: 10,
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(c.schema_json, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContractsPage;
