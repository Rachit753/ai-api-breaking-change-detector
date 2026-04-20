import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../api/config";
import { getToken } from "../utils/auth";

function ProjectSelector() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(
    localStorage.getItem("projectId") || ""
  );
  const [open, setOpen] = useState(false);

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
      console.error(err);
    }
  }

  function handleSelect(id) {
    setSelected(id);
    localStorage.setItem("projectId", id);
    window.location.reload();
  }

  const selectedProject = projects.find(p => p.id === selected);

  return (
    <div className="dropdown">
  <div className="dropdown-trigger" onClick={() => setOpen(!open)}>
    {selectedProject?.name || "Select Project"}
    <span>▼</span>
  </div>

  {open && (
    <div className="dropdown-menu">
      {projects.map((p) => (
        <div
          key={p.id}
          className="dropdown-item"
          onClick={() => handleSelect(p.id)}
        >
          {p.name}
        </div>
      ))}
    </div>
  )}
</div>
  );
}

export default ProjectSelector;