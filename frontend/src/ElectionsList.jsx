// ElectionsList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ElectionsList = () => {
  const [elections, setElections] = useState([]);
  const [timers, setTimers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      const stored = JSON.parse(localStorage.getItem("elections")) || [];
      const normalized = stored.map(e => ({
        ...e,
        totalVotes: e.totalVotes ?? (e.candidates?.reduce((a,c)=>a+(c.votes??0), 0) ?? 0),
        candidates: (e.candidates || []).map(c => ({ ...c, votes: c.votes ?? 0 }))
      }));
      setElections(normalized);
    };
    load();
    window.addEventListener("electionsUpdated", load);
    return () => window.removeEventListener("electionsUpdated", load);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const nextTimers = {};
      elections.forEach(e => {
        if (!e.endDateTime) return;
        const end = new Date(e.endDateTime).getTime();
        const distance = end - now;
        if (distance <= 0) {
          // mark ended if not already
          if (e.status !== "Ended") {
            const updated = JSON.parse(localStorage.getItem("elections")) || [];
            const idx = updated.findIndex(x => String(x.id) === String(e.id));
            if (idx !== -1) {
              updated[idx].status = "Ended";
              localStorage.setItem("elections", JSON.stringify(updated));
              window.dispatchEvent(new Event("electionsUpdated"));
            }
          }
          nextTimers[e.id] = { expired: true };
        } else {
          const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((distance / (1000 * 60)) % 60);
          const seconds = Math.floor((distance / 1000) % 60);
          nextTimers[e.id] = { hours, minutes, seconds };
        }
      });
      setTimers(nextTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, [elections]);

  const formatStatus = (e) => {
    const now = new Date();
    const start = e.startDateTime ? new Date(e.startDateTime) : null;
    const end = e.endDateTime ? new Date(e.endDateTime) : null;
    if (start && now < start) return "Upcoming";
    if (end && now > end) return "Ended";
    return "Active";
  };

  const getWinner = (e) => {
    if (e.status !== "Ended" || !e.candidates?.length) return null;
    return e.candidates.reduce((a,b) => (a.votes||0) > (b.votes||0) ? a : b);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <h2>All Elections</h2>
        <button className="btn-primary" onClick={() => navigate("/dashboard")}>Back</button>
      </div>

      <div className="dashboard-grid" style={{ maxWidth: 1100 }}>
        {elections.length === 0 && <div className="dashboard-card">No elections found.</div>}

        {elections.map(e => {
          const winner = getWinner(e);
          const timer = timers[e.id];

          return (
            <div key={e.id} className="dashboard-card">
              <h3>{e.title || e.name || "Untitled Election"}</h3>
              <p><strong>Status:</strong> {formatStatus(e)}</p>
              <p><strong>Start:</strong> {e.startDateTime ? new Date(e.startDateTime).toLocaleString() : "Not set"}</p>
              <p><strong>End:</strong> {e.endDateTime ? new Date(e.endDateTime).toLocaleString() : "Not set"}</p>

              {timer && !timer.expired && e.status !== "Ended" && (
                <p style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                  ⏳ Ends in: {timer.hours}h {timer.minutes}m {timer.seconds}s
                </p>
              )}

              {winner && (
                <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                  <strong>🏁 Winner:</strong>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                    {winner.photo && <img src={winner.photo} alt={winner.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />}
                    <div>
                      <div style={{ fontWeight: 700 }}>{winner.name}</div>
                      <div style={{ color: "#aaa" }}>{winner.party}</div>
                      <div style={{ marginTop: 6 }}>{winner.votes || 0} votes</div>
                    </div>
                  </div>
                </div>
              )}

              <p><strong>Total votes:</strong> {e.totalVotes ?? 0}</p>

              {e.status !== "Ended" ? (
                <button className="btn-primary" onClick={() => navigate(`/election/${e.id}`)}>View Election</button>
              ) : (
                <button className="btn-primary" disabled>Election Ended</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElectionsList;
