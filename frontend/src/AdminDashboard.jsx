// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
AdminDashboard
- Card-based admin home (Create Election, Candidate Management, etc.)
- Lists current elections with status (Upcoming / Active / Ended)
- Shows start/end date & time, total votes, per-candidate votes
- Shows winner after end time (name, party, photo)
- Buttons: Create (navigate), View (navigate to /election/:id), Delete
- Uses localStorage key "elections"
*/

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [elections, setElections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    if (!storedUser.roles || !storedUser.roles.includes("admin")) {
      navigate("/dashboard"); // redirect non-admins
      return;
    }
    setAdmin(storedUser);

    const loadElections = () => {
      const stored = JSON.parse(localStorage.getItem("elections")) || [];
      // normalize fields
      const normalized = stored.map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate || null,
        startTime: e.startTime || null,
        endDate: e.endDate || null,
        endTime: e.endTime || null,
        candidates: (e.candidates || []).map((c) => ({
          name: c.name,
          party: c.party,
          photo: c.photo || "",
          votes: c.votes || 0,
        })),
        totalVotes: e.totalVotes || (e.candidates ? e.candidates.reduce((a, c) => a + (c.votes || 0), 0) : 0),
        votedBy: e.votedBy || [],
      }));
      setElections(normalized);
    };

    loadElections();
    window.addEventListener("electionsUpdated", loadElections);
    return () => window.removeEventListener("electionsUpdated", loadElections);
  }, [navigate]);

  if (!admin) return null;

  const handleCreate = () => navigate("/create-election");
  const viewElection = (id) => navigate(`/election/${id}`);

  const deleteElection = (id) => {
    if (!window.confirm("Delete this election? This cannot be undone.")) return;
    const stored = JSON.parse(localStorage.getItem("elections")) || [];
    const updated = stored.filter((e) => String(e.id) !== String(id));
    localStorage.setItem("elections", JSON.stringify(updated));
    window.dispatchEvent(new Event("electionsUpdated"));
  };

  const computeStatus = (e) => {
    const now = new Date();
    const start = e.startDate && e.startTime ? new Date(`${e.startDate}T${e.startTime}`) : null;
    const end = e.endDate && e.endTime ? new Date(`${e.endDate}T${e.endTime}`) : null;
    if (start && now < start) return "Upcoming";
    if (end && now > end) return "Ended";
    if (start && end && now >= start && now <= end) return "Active";
    // default
    return "Upcoming";
  };

  const computeWinner = (e) => {
    const end = e.endDate && e.endTime ? new Date(`${e.endDate}T${e.endTime}`) : null;
    if (!end) return null;
    const now = new Date();
    if (now <= end) return null;
    const sorted = [...(e.candidates || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    return sorted.length ? sorted[0] : null;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <h2>Welcome, Admin 👋</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-primary" onClick={handleCreate}>➕ Create Election</button>
          <button className="btn-primary" onClick={() => window.dispatchEvent(new Event("electionsUpdated"))}>🔄 Refresh</button>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Top cards (like screenshot) */}
      <div className="dashboard-grid" style={{ maxWidth: 1100 }}>
        <div className="dashboard-card">
          <h3>📋 Create Election</h3>
          <p>Start and manage active or upcoming elections.</p>
          <button className="btn-primary" onClick={handleCreate}>Create</button>
        </div>

        <div className="dashboard-card">
          <h3>👥 Candidate Management</h3>
          <p>Add, edit, or delete candidate profiles easily.</p>
          <button className="btn-primary" onClick={() => navigate("/candidate-management")}>Manage</button>
        </div>

        <div className="dashboard-card">
          <h3>🧾 Voter Management</h3>
          <p>Approve, verify, or remove registered voters.</p>
          <button className="btn-primary" onClick={() => navigate("/voter-management")}>View</button>
        </div>

        <div className="dashboard-card">
          <h3>📊 Analytics & Reports</h3>
          <p>Track total votes, turnout, and performance.</p>
          <button className="btn-primary" onClick={() => navigate("/analytics")}>View</button>
        </div>

        <div className="dashboard-card">
          <h3>⚙️ Settings</h3>
          <p>Adjust system settings and election timings.</p>
          <button className="btn-primary" onClick={() => navigate("/settings")}>Configure</button>
        </div>
      </div>

      {/* Existing elections list */}
      <div style={{ width: "100%", maxWidth: 1100, marginTop: 24 }}>
        {elections.length === 0 ? (
          <div className="dashboard-card">
            <h4>No elections created yet</h4>
            <p>Create an election to get started.</p>
          </div>
        ) : (
          elections.map((e) => {
            const status = computeStatus(e);
            const winner = computeWinner(e);
            const startStr = e.startDate && e.startTime ? new Date(`${e.startDate}T${e.startTime}`).toLocaleString() : "Not set";
            const endStr = e.endDate && e.endTime ? new Date(`${e.endDate}T${e.endTime}`).toLocaleString() : "Not set";

            return (
              <div key={e.id} className="dashboard-card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3>{e.title}</h3>
                    <div style={{ color: "var(--text-color-dark)" }}>
                      <div><strong>Status:</strong> {status}</div>
                      <div><strong>Start:</strong> {startStr}</div>
                      <div><strong>End:</strong> {endStr}</div>
                      <div><strong>Total Votes:</strong> {e.totalVotes || 0}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={() => viewElection(e.id)}>View</button>
                    <button className="btn-primary" onClick={() => deleteElection(e.id)}>Delete</button>
                  </div>
                </div>

                {/* Candidate performance */}
                <div style={{ marginTop: 12 }}>
                  <strong>Candidates:</strong>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                    {e.candidates.map((c, idx) => (
                      <div key={idx} style={{ width: 180, padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.04)" }}>
                        {c.photo ? <img src={c.photo} alt={c.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} /> : null}
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: "#666" }}>{c.party}</div>
                        <div style={{ marginTop: 6 }}>{c.votes || 0} votes</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Winner */}
                {winner && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(0,170,255,0.06)" }}>
                    <strong>Winner:</strong>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                      {winner.photo && <img src={winner.photo} alt={winner.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />}
                      <div>
                        <div style={{ fontWeight: 700 }}>{winner.name}</div>
                        <div style={{ color: "#333" }}>{winner.party}</div>
                        <div style={{ marginTop: 6 }}>{winner.votes || 0} votes</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
