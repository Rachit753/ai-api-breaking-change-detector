import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../api/config";
import { getToken } from "../utils/auth";

function ProjectSelector() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(
    localStorage.getItem("projectId") || ""
  );

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await axios.get(`${BASE_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  }

  function handleChange(e) {
    const projectId = e.target.value;

    setSelected(projectId);

    localStorage.setItem("projectId", projectId);

    window.location.reload();
  }

  return (
    <div style={{ marginBottom: 15 }}>
      <select value={selected} onChange={handleChange}>
        <option value="">Select Project</option>

        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProjectSelector;