// CreateElection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyCandidate = () => ({ name: "", party: "", photo: "", votes: 0 });

const CreateElection = () => {
  const [title, setTitle] = useState("");
  const [startDT, setStartDT] = useState(""); // datetime-local value
  const [endDT, setEndDT] = useState("");
  const [candidates, setCandidates] = useState([emptyCandidate()]);
  const navigate = useNavigate();

  const addCandidate = () => setCandidates((s) => [...s, emptyCandidate()]);
  const removeCandidate = (idx) => setCandidates((s) => s.filter((_, i) => i !== idx));
  const updateCandidate = (idx, field, value) => {
    setCandidates((s) => {
      const copy = [...s];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handlePhoto = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateCandidate(idx, "photo", reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!title.trim()) { alert("Enter election title"); return false; }
    if (!startDT || !endDT) { alert("Set start and end date/time"); return false; }
    const start = new Date(startDT).getTime();
    const end = new Date(endDT).getTime();
    if (end <= start) { alert("End time must be after start time"); return false; }
    const valid = candidates.filter(c => c.name.trim());
    if (valid.length === 0) { alert("Add at least one candidate"); return false; }
    return true;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedCandidates = candidates
      .filter(c => c.name.trim())
      .map(c => ({ name: c.name.trim(), party: c.party?.trim() || "", photo: c.photo || "", votes: 0 }));

    const newElection = {
      id: Date.now().toString(),
      title: title.trim(),
      startDateTime: new Date(startDT).toISOString(),
      endDateTime: new Date(endDT).toISOString(),
      candidates: normalizedCandidates,
      totalVotes: 0,
      votedBy: [],
      status: "Upcoming" // will be computed by lists/vote pages
    };

    const stored = JSON.parse(localStorage.getItem("elections")) || [];
    stored.push(newElection);
    localStorage.setItem("elections", JSON.stringify(stored));
    window.dispatchEvent(new Event("electionsUpdated"));
    alert("Election created");
    navigate("/admin-dashboard");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <h2>Create Election</h2>
      </div>

      <form className="create-election-form" onSubmit={handleSave} style={{ maxWidth: 900, width: "100%" }}>
        <div className="form-group">
          <label>Election Title</label>
          <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter title" />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }} className="form-group">
            <label>Start (date & time)</label>
            <input type="datetime-local" className="form-control" value={startDT} onChange={e => setStartDT(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 200px" }} className="form-group">
            <label>End (date & time)</label>
            <input type="datetime-local" className="form-control" value={endDT} onChange={e => setEndDT(e.target.value)} />
          </div>
        </div>

        <h3 style={{ marginTop: 12 }}>Candidates</h3>
        {candidates.map((c, idx) => (
          <div key={idx} className="candidate-group" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ flex: "1 1 200px" }}>
              <input className="form-control" placeholder="Candidate name" value={c.name} onChange={e => updateCandidate(idx, "name", e.target.value)} />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <input className="form-control" placeholder="Party name" value={c.party} onChange={e => updateCandidate(idx, "party", e.target.value)} />
            </div>
            <div style={{ flex: "0 0 180px" }}>
              <input type="file" accept="image/*" onChange={e => handlePhoto(idx, e.target.files && e.target.files[0])} />
              {c.photo && <img src={c.photo} alt="preview" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />}
            </div>
            <div>
              {candidates.length > 1 && <button type="button" className="btn-primary" onClick={() => removeCandidate(idx)}>Remove</button>}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="btn-secondary" onClick={addCandidate}>➕ Add Candidate</button>
          <button type="submit" className="btn-primary">Save Election</button>
        </div>
      </form>
    </div>
  );
};

export default CreateElection;
