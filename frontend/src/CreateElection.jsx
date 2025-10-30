// CreateElection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/*
CreateElection
- Form fields: title, startDate, startTime, endDate, endTime
- Add multiple candidates dynamically (name, party, photo upload)
- Save normalized object to localStorage key "elections"
- After save: dispatch 'electionsUpdated' and navigate back to /admin-dashboard
*/

const emptyCandidate = () => ({ name: "", party: "", photo: "", votes: 0 });

const CreateElection = () => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [candidates, setCandidates] = useState([emptyCandidate()]);
  const navigate = useNavigate();

  const addCandidate = () => setCandidates((s) => [...s, emptyCandidate()]);
  const removeCandidate = (idx) => setCandidates((s) => s.filter((_, i) => i !== idx));

  const handleCandidateChange = (idx, field, value) => {
    setCandidates((s) => {
      const copy = [...s];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handlePhoto = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleCandidateChange(idx, "photo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!title.trim()) {
      alert("Enter election title.");
      return false;
    }
    if (!startDate || !startTime || !endDate || !endTime) {
      alert("Set start and end date/time.");
      return false;
    }
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    if (end <= start) {
      alert("End date/time must be after start date/time.");
      return false;
    }
    const validCandidates = candidates.filter((c) => c.name.trim());
    if (validCandidates.length === 0) {
      alert("Add at least one candidate with a name.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedCandidates = candidates
      .filter((c) => c.name.trim())
      .map((c) => ({
        name: c.name.trim(),
        party: c.party?.trim() || "",
        photo: c.photo || "",
        votes: 0,
      }));

    const newElection = {
      id: Date.now().toString(),
      title: title.trim(),
      startDate,
      startTime,
      endDate,
      endTime,
      candidates: normalizedCandidates,
      totalVotes: 0,
      votedBy: [],
    };

    const stored = JSON.parse(localStorage.getItem("elections")) || [];
    stored.push(newElection);
    localStorage.setItem("elections", JSON.stringify(stored));
    window.dispatchEvent(new Event("electionsUpdated"));

    alert("Election created successfully.");
    navigate("/admin-dashboard");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <h2>Create Election</h2>
      </div>

      <form className="create-election-form" onSubmit={handleSubmit} style={{ maxWidth: 900, width: "100%" }}>
        <div className="form-group">
          <label>Election Title</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter election title" />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }} className="form-group">
            <label>Start Date</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 200px" }} className="form-group">
            <label>Start Time</label>
            <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 200px" }} className="form-group">
            <label>End Date</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 200px" }} className="form-group">
            <label>End Time</label>
            <input type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <h3 style={{ marginTop: 12 }}>Candidates</h3>

        {candidates.map((c, idx) => (
          <div key={idx} className="candidate-group" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ flex: "1 1 200px" }}>
              <input className="form-control" placeholder="Candidate name" value={c.name} onChange={(e) => handleCandidateChange(idx, "name", e.target.value)} />
            </div>

            <div style={{ flex: "1 1 200px" }}>
              <input className="form-control" placeholder="Party name" value={c.party} onChange={(e) => handleCandidateChange(idx, "party", e.target.value)} />
            </div>

            <div style={{ flex: "0 0 180px" }}>
              <input type="file" accept="image/*" onChange={(e) => handlePhoto(idx, e.target.files && e.target.files[0])} />
              {c.photo && <img src={c.photo} alt="preview" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />}
            </div>

            <div>
              {candidates.length > 1 && (
                <button type="button" className="btn-primary" onClick={() => removeCandidate(idx)}>Remove</button>
              )}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="btn-secondary" onClick={addCandidate}>➕ Add Candidate</button>
          <button type="submit" className="btn-primary">Create Election</button>
        </div>
      </form>
    </div>
  );
};

export default CreateElection;
