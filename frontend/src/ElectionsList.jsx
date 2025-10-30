// ElectionsList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ElectionsList = () => {
  const [elections, setElections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      const stored = JSON.parse(localStorage.getItem("elections")) || [];
      // ensure numeric votes exist
      const normalized = stored.map(e => ({
        ...e,
        totalVotes: e.totalVotes ?? (e.candidates?.reduce((a,c)=>a+(c.votes??0), 0) ?? 0),
        candidates: e.candidates?.map(c => ({ votes: c.votes ?? 0, ...c })) ?? []
      }));
      setElections(normalized);
    };
    load();

    // listen for updates
    window.addEventListener("electionsUpdated", load);
    return () => window.removeEventListener("electionsUpdated", load);
  }, []);

  const goTo = (id) => navigate(`/election/${id}`);

  const formatStatus = (e) => {
    const now = new Date();
    const start = e.startDateTime ? new Date(e.startDateTime) : null;
    const end = e.endDateTime ? new Date(e.endDateTime) : null;
    if (start && now < start) return "Upcoming";
    if (end && now > end) return "Ended";
    return "Active";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <h2>All Elections</h2>
      </div>

      <div className="dashboard-grid" style={{ maxWidth: 1100 }}>
        {elections.length === 0 && <div className="dashboard-card">No elections found.</div>}

        {elections.map((e) => (
          <div key={e.id} className="dashboard-card">
            <h3>{e.title}</h3>
            <p>
              <strong>Status:</strong> {formatStatus(e)}
            </p>
            <p>
              <strong>Start:</strong>{" "}
              {e.startDateTime ? new Date(e.startDateTime).toLocaleString() : "Not set"}
            </p>
            <p>
              <strong>End:</strong>{" "}
              {e.endDateTime ? new Date(e.endDateTime).toLocaleString() : "Not set"}
            </p>
            <p>
              <strong>Total votes:</strong> {e.totalVotes ?? 0}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn-primary" onClick={() => goTo(e.id)}>View Election</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectionsList;