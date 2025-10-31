// ElectionVote.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ElectionVote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const sUser = JSON.parse(localStorage.getItem("user"));
    if (!sUser) { navigate("/login"); return; }
    setUser(sUser);

    const load = () => {
      const stored = JSON.parse(localStorage.getItem("elections")) || [];
      const found = stored.find(e => String(e.id) === String(id));
      if (!found) { setElection(null); return; }

      const votedBy = found.votedBy ?? [];
      setHasVoted(votedBy.includes(sUser.username));

      // compute winner if ended
      const now = Date.now();
      const end = found.endDateTime ? new Date(found.endDateTime).getTime() : null;
      if (end && now > end) {
        const sorted = [...(found.candidates || [])].sort((a,b) => (b.votes||0)-(a.votes||0));
        setWinner(sorted[0] ?? null);
        found.status = "Ended";
      } else {
        setWinner(null);
      }

      setElection(found);
    };

    load();
    window.addEventListener("electionsUpdated", load);
    return () => window.removeEventListener("electionsUpdated", load);
  }, [id, navigate]);

  // countdown
  useEffect(() => {
    if (!election || !election.endDateTime) return;
    const tick = () => {
      const now = Date.now();
      const end = new Date(election.endDateTime).getTime();
      const distance = end - now;
      if (distance <= 0) {
        setCountdown({ expired: true });
        // mark ended once
        const stored = JSON.parse(localStorage.getItem("elections")) || [];
        const idx = stored.findIndex(x => String(x.id) === String(election.id));
        if (idx !== -1 && stored[idx].status !== "Ended") {
          stored[idx].status = "Ended";
          localStorage.setItem("elections", JSON.stringify(stored));
          window.dispatchEvent(new Event("electionsUpdated"));
        }
      } else {
        const hours = Math.floor((distance / (1000*60*60)) % 24);
        const minutes = Math.floor((distance / (1000*60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        setCountdown({ hours, minutes, seconds, expired: false });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [election]);

  if (!election) return (
    <div className="dashboard-container">
      <div className="dashboard-card">Election not found.</div>
    </div>
  );

  const now = Date.now();
  const start = election.startDateTime ? new Date(election.startDateTime).getTime() : null;
  const end = election.endDateTime ? new Date(election.endDateTime).getTime() : null;
  const isActive = (!start || now >= start) && (!end || now <= end);
  const isEnded = end && now > end;

  const castVote = (candidateIndex) => {
    if (!user) { alert("Login required"); return; }
    if (!isActive) { alert("Election not active"); return; }
    if (hasVoted) { alert("Already voted"); return; }

    const stored = JSON.parse(localStorage.getItem("elections")) || [];
    const idx = stored.findIndex(e => String(e.id) === String(election.id));
    if (idx === -1) { alert("Election not found"); return; }

    stored[idx].candidates[candidateIndex].votes = (stored[idx].candidates[candidateIndex].votes || 0) + 1;
    stored[idx].totalVotes = (stored[idx].totalVotes || 0) + 1;
    stored[idx].votedBy = Array.from(new Set([...(stored[idx].votedBy || []), user.username]));

    localStorage.setItem("elections", JSON.stringify(stored));
    window.dispatchEvent(new Event("electionsUpdated"));

    setHasVoted(true);
    setElection(stored[idx]);
    alert("Vote recorded. Thank you!");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <h2>{election.title || election.name}</h2>
        <div>
          <button className="btn-primary" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ maxWidth: 1100 }}>
        <div className="dashboard-card wide-card">
          <p><strong>Start:</strong> {start ? new Date(start).toLocaleString() : "Not set"}</p>
          <p><strong>End:</strong> {end ? new Date(end).toLocaleString() : "Not set"}</p>
          <p><strong>Total votes:</strong> {election.totalVotes ?? 0}</p>

          {countdown && !countdown.expired && (
            <p style={{ color: "var(--primary-color)", fontWeight: 600 }}>
              ⏳ Time remaining: {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </p>
          )}

          {isEnded && winner && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.04)" }}>
              <strong>🏁 Result:</strong> {winner.name} ({winner.party}) — {winner.votes ?? 0} votes
              {winner.photo && <div style={{ marginTop: 10 }}><img src={winner.photo} alt={winner.name} style={{ width: 80, height: 80, borderRadius: 8 }} /></div>}
            </div>
          )}
        </div>

        <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
          <h3>Candidates</h3>
          <div className="candidate-list">
            {election.candidates?.map((c, i) => (
              <div key={i} className="candidate-card">
                {c.photo && <img src={c.photo} alt={c.name} className="candidate-preview" />}
                <h5>{c.name}</h5>
                <p style={{ marginBottom: 8 }}>{c.party}</p>
                <p style={{ marginBottom: 8 }}><strong>Votes:</strong> {c.votes ?? 0}</p>

                {isEnded ? (
                  <button className="btn-primary small-btn" disabled>Voting ended</button>
                ) : hasVoted ? (
                  <button className="btn-primary small-btn" disabled>Already voted</button>
                ) : (
                  <button className="btn-primary small-btn" onClick={() => {
                    if (window.confirm(`Confirm vote for ${c.name}?`)) castVote(i);
                  }}>Vote</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionVote;
