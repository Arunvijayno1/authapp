// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./config";


/*
Merged Admin Dashboard
- Keeps original layout (cards, management panels)
- Adds dynamic election updates, countdown timer, and winner auto-display
*/

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [elections, setElections] = useState([]);
  const [timers, setTimers] = useState({});
  const navigate = useNavigate();

  // ✅ Load admin and elections
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    if (!storedUser.roles || !storedUser.roles.includes("admin")) {
      navigate("/dashboard"); // Redirect non-admins
      return;
    }
    setAdmin(storedUser);

    const loadElections = () => {
      const stored = JSON.parse(localStorage.getItem("elections")) || [];
      const normalized = stored.map((e) => ({
        id: e.id,
        title: e.title,
        startDateTime:
          e.startDateTime ||
          (e.startDate && e.startTime
            ? `${e.startDate}T${e.startTime}`
            : null),
        endDateTime:
          e.endDateTime ||
          (e.endDate && e.endTime ? `${e.endDate}T${e.endTime}` : null),
        candidates: (e.candidates || []).map((c) => ({
          name: c.name,
          party: c.party,
          photo: c.photo || "",
          votes: c.votes || 0,
        })),
        totalVotes:
          e.totalVotes ||
          (e.candidates
            ? e.candidates.reduce((a, c) => a + (c.votes || 0), 0)
            : 0),
      }));
      setElections(normalized);
    };

    loadElections();
    window.addEventListener("electionsUpdated", loadElections);
    const timer = setInterval(loadElections, 3000); // auto-refresh every 3s
    return () => {
      clearInterval(timer);
      window.removeEventListener("electionsUpdated", loadElections);
    };
  }, [navigate]);

  // ✅ Countdown timer for active elections
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updated = {};
      elections.forEach((e) => {
        const end = e.endDateTime ? new Date(e.endDateTime) : null;
        if (end && now < end) {
          const diff = end - now;
          const hrs = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          updated[e.id] = `${hrs}h ${mins}m ${secs}s`;
        } else {
          updated[e.id] = "Ended";
        }
      });
      setTimers(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [elections]);

  // ✅ Compute election status
  const getStatus = (e) => {
    const now = new Date();
    const start = e.startDateTime ? new Date(e.startDateTime) : null;
    const end = e.endDateTime ? new Date(e.endDateTime) : null;
    if (start && now < start) return "Upcoming";
    if (end && now > end) return "Ended";
    if (start && end && now >= start && now <= end) return "Active";
    return "Upcoming";
  };

  // ✅ Compute election winner automatically
  const getWinner = (e) => {
    const now = new Date();
    const end = e.endDateTime ? new Date(e.endDateTime) : null;
    if (end && now > end && e.candidates?.length) {
      const sorted = [...e.candidates].sort(
        (a, b) => (b.votes || 0) - (a.votes || 0)
      );
      return sorted[0];
    }
    return null;
  };

  // ✅ Actions
  const handleCreate = () => navigate("/create-election");
  const viewElection = (id) => navigate(`/election/${id}`);
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/login");
  };

  const deleteElection = (id) => {
    if (!window.confirm("Delete this election? This cannot be undone.")) return;
    const stored = JSON.parse(localStorage.getItem("elections")) || [];
    const updated = stored.filter((e) => String(e.id) !== String(id));
    localStorage.setItem("elections", JSON.stringify(updated));
    window.dispatchEvent(new Event("electionsUpdated"));
  };

  if (!admin) return null;

  // ✅ UI
  return (
    <div className="dashboard-container">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <h2>Welcome, {admin?.username || "Admin"} 👋</h2>
        <div style={{ display: "flex", gap: 12 }}>
          
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Original top cards */}
      <div className="dashboard-grid" style={{ maxWidth: 1100 }}>
        <div className="dashboard-card">
          <h3> Create Election</h3>
          <p>Start and manage active or upcoming elections.</p>
          <button className="btn-primary" onClick={handleCreate}>
            Create
          </button>
        </div>

        <div className="dashboard-card">
          <h3> Candidate Management</h3>
          <p>Add, edit, or delete candidate profiles easily.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/candidate-management")}
          >
            Manage
          </button>
        </div>

        <div className="dashboard-card">
          <h3> Voter Management</h3>
          <p>Approve, verify, or remove registered voters.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/voter-management")}
          >
            View
          </button>
        </div>

        <div className="dashboard-card">
          <h3> Analytics & Reports</h3>
          <p>Track total votes, turnout, and performance.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/analytics")}
          >
            View
          </button>
        </div>

        <div className="dashboard-card">
          <h3> Settings</h3>
          <p>Adjust system settings and election timings.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/settings")}
          >
            Configure
          </button>
        </div>
      </div>

      {/* Elections List */}
      <div style={{ width: "100%", maxWidth: 1100, marginTop: 24 }}>
        {elections.length === 0 ? (
          <div className="dashboard-card">
            <h4>No elections created yet</h4>
            <p>Create an election to get started.</p>
          </div>
        ) : (
          elections.map((e) => {
            const status = getStatus(e);
            const winner = getWinner(e);
            return (
              <div
                key={e.id}
                className="dashboard-card"
                style={{ marginBottom: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3>{e.title}</h3>
                    <div style={{ color: "var(--text-color-dark)" }}>
                      <div>
                        <strong>Status:</strong> {status}
                      </div>
                      <div>
                        <strong>Start:</strong>{" "}
                        {e.startDateTime
                          ? new Date(e.startDateTime).toLocaleString()
                          : "Not set"}
                      </div>
                      <div>
                        <strong>End:</strong>{" "}
                        {e.endDateTime
                          ? new Date(e.endDateTime).toLocaleString()
                          : "Not set"}
                      </div>
                      <div>
                        <strong>Total Votes:</strong> {e.totalVotes || 0}
                      </div>
                      {status === "Active" && (
                        <div>
                          <strong>Time Left:</strong>{" "}
                          {timers[e.id] || "Calculating..."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-primary"
                      onClick={() => viewElection(e.id)}
                    >
                      View
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => deleteElection(e.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Candidate performance */}
                <div style={{ marginTop: 12 }}>
                  <strong>Candidates:</strong>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}
                  >
                    {e.candidates.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 180,
                          padding: 10,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                        }}
                      >
                        {c.photo && (
                          <img
                            src={c.photo}
                            alt={c.name}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        )}
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: "#666" }}>{c.party}</div>
                        <div style={{ marginTop: 6 }}>
                          {c.votes || 0} votes
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Winner */}
                {winner && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 10,
                      background: "rgba(0,170,255,0.06)",
                    }}
                  >
                    <strong>Winner:</strong>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      {winner.photo && (
                        <img
                          src={winner.photo}
                          alt={winner.name}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 700 }}>{winner.name}</div>
                        <div style={{ color: "#333" }}>{winner.party}</div>
                        <div style={{ marginTop: 6 }}>
                          {winner.votes || 0} votes
                        </div>
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
