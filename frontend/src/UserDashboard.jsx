// UserDashboard.jsx (updated)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [elections, setElections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const sUser = JSON.parse(localStorage.getItem("user"));
    if (!sUser) {
      navigate("/login");
      return;
    }
    setUser(sUser);

    const load = () => {
      const stored = JSON.parse(localStorage.getItem("elections")) || [];
      setElections(stored);
    };
    load();
    window.addEventListener("electionsUpdated", load);
    return () => window.removeEventListener("electionsUpdated", load);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/login");
  };

  const goToElections = () => navigate("/elections");

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <h2>Welcome, {user.username} 👋</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={goToElections} className="btn-primary">View Elections</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>🗳️ Active Elections</h3>
          <p>{(elections || []).filter(e => {
            const now = new Date();
            const start = e.startDateTime ? new Date(e.startDateTime) : null;
            const end = e.endDateTime ? new Date(e.endDateTime) : null;
            return (!start || now >= start) && (!end || now <= end);
          }).length} active elections</p>
          <button className="btn-primary" onClick={goToElections}>View Elections</button>
        </div>

        <div className="dashboard-card">
          <h3>👥 Candidate Details</h3>
          <p>Check candidate profiles and parties.</p>
          <button className="btn-primary" onClick={goToElections}>View Candidates</button>
        </div>

        <div className="dashboard-card">
          <h3>✅ Voting Status</h3>
          <p>Track whether you’ve voted in active elections.</p>
          <button className="btn-primary" onClick={() => navigate("/elections")}>Check Status</button>
        </div>

        <div className="dashboard-card">
          <h3>📜 Voting History</h3>
          <p>See your past election participation and results.</p>
          <button className="btn-primary" onClick={() => navigate("/elections")}>View History</button>
        </div>

        <div className="dashboard-card">
          <h3>👤 Profile</h3>
          <p>Manage your account and personal details.</p>
          <button className="btn-primary" onClick={() => navigate("/profile")}>View Profile</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
