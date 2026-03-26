import React, { useState } from "react";
import "./App.css";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";

function App() {
  const [activeTab, setActiveTab] = useState("input");
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🎨 COLOR LOGIC
  const getColorClass = (risk) => {
    if (!risk) return "";
    if (risk === "High") return "red";
    if (risk === "Medium") return "yellow";
    if (risk === "Low") return "green";
    return "";
  };

  // 🔥 PREDICT FUNCTION
  const handlePredict = async () => {
    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age),
          gender: form.gender || "Male",
          employment_status: "No",
          work_environment: "Home",
          mental_health_history: form.mental_health_history || "Neutral",
          seeks_treatment: "No",
          stress_level: form.stress_level || "Medium",
          sleep_hours: Number(form.sleep_hours),
          physical_activity_days: 2,
          depression_score: Number(form.depression_score),
          anxiety_score: Number(form.anxiety_score),
          social_support_score: 50,
          productivity_score: 50
        })
      });

      const data = await res.json();

      if (data.error) {
        alert("Backend Error: " + data.error);
        return;
      }

      setResult(data);

      // Save to backend
      await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      // stay in predict tab (IMPORTANT)
      setActiveTab("predict");

      setRecords((prev) => [...prev, data]);

    } catch (error) {
      alert("Server not connected.");
      console.error(error);
    }
  };

  // 📊 CHART DATA
  const chartData = [
    { name: "High", value: records.filter(r => r.risk === "High").length },
    { name: "Medium", value: records.filter(r => r.risk === "Medium").length },
    { name: "Low", value: records.filter(r => r.risk === "Low").length }
  ];

  const COLORS = ["#ff4d4d", "#ffa500", "#4caf50"];

  return (
    <div className="container">
      <h2>🌉 MindBridge AI</h2>

      {/* TABS */}
      <div className="tabs">
        <button onClick={() => setActiveTab("input")}>Input</button>
        <button onClick={() => setActiveTab("mood")}>Mood</button>
        <button onClick={() => setActiveTab("predict")}>Predict</button>
        <button onClick={() => setActiveTab("result")}>Result</button>
        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
      </div>

      {/* INPUT */}
      {activeTab === "input" && (
        <div>
          <input name="age" placeholder="Age" onChange={handleChange} />

          <select name="gender" onChange={handleChange}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <select name="stress_level" onChange={handleChange}>
            <option value="">Stress Level</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Sleep Hours: {form.sleep_hours || 6}</label>
          <input
            type="range"
            name="sleep_hours"
            min="0"
            max="12"
            value={form.sleep_hours || 6}
            onChange={handleChange}
          />

          <label>Depression: {form.depression_score || 10}</label>
          <input
            type="range"
            name="depression_score"
            min="0"
            max="20"
            value={form.depression_score || 10}
            onChange={handleChange}
          />

          <label>Anxiety: {form.anxiety_score || 10}</label>
          <input
            type="range"
            name="anxiety_score"
            min="0"
            max="20"
            value={form.anxiety_score || 10}
            onChange={handleChange}
          />
        </div>
      )}

      {/* MOOD */}
      {activeTab === "mood" && (
        <div>
          <h3>Select Mood</h3>

          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {[
              { emoji: "😊", label: "Happy" },
              { emoji: "😐", label: "Neutral" },
              { emoji: "😢", label: "Sad" },
              { emoji: "😡", label: "Angry" }
            ].map((mood) => (
              <div
                key={mood.label}
                onClick={() =>
                  setForm({ ...form, mental_health_history: mood.label })
                }
                style={{
                  fontSize: "40px",
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "10px",
                  background:
                    form.mental_health_history === mood.label
                      ? "#38bdf8"
                      : "transparent",
                  textAlign: "center"
                }}
              >
                {mood.emoji}
                <div style={{ fontSize: "12px" }}>{mood.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREDICT */}
      {activeTab === "predict" && (
        <div>
          <button onClick={handlePredict}>Run Prediction</button>

          {result && (
            <div className={`result-box ${getColorClass(result.risk)}`} style={{ marginTop: "20px" }}>
              <h3>Detailed Analysis</h3>

              <p><b>Risk:</b> {result.risk}</p>
              <p><b>Wellness Score:</b> {result.wellness_score}</p>

              <p>
                <b>Status:</b>{" "}
                {result.risk === "High"
                  ? "Critical condition 🚨"
                  : result.risk === "Medium"
                  ? "Moderate condition ⚖️"
                  : "Stable condition ✅"}
              </p>

              <p><b>Recommendation:</b> {result.recommendation}</p>

              <button onClick={() => setActiveTab("result")}>
                View Support Plan →
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESULT */}
      {activeTab === "result" && result && (
        <div className={`result-box ${getColorClass(result.risk)}`}>
          <h3>👨‍⚕️ Doctor Guidance</h3>

          <p>
            {result.risk === "High"
              ? "Immediate clinical assessment required"
              : result.risk === "Medium"
              ? "Schedule counseling session"
              : "Routine monitoring"}
          </p>

          <h3>🤝 NGO Support</h3>

          <p>
            {result.risk === "High"
              ? "Urgent NGO intervention needed"
              : result.risk === "Medium"
              ? "Community support recommended"
              : "No immediate NGO support needed"}
          </p>

          <button onClick={() => setActiveTab("dashboard")}>
            View Dashboard
          </button>
        </div>
      )}

      {/* DASHBOARD */}
     {activeTab === "dashboard" && (
  <div>
    <h3>📊 Dashboard</h3>

    {/* SUMMARY CARDS */}
    <div style={{
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "20px"
    }}>
      <div className="card">Total: {records.length}</div>
      <div className="card" style={{ background: "#ff4d4d", color: "#fff" }}>
        High: {chartData[0].value}
      </div>
      <div className="card" style={{ background: "#ffa500", color: "#fff" }}>
        Medium: {chartData[1].value}
      </div>
      <div className="card" style={{ background: "#4caf50", color: "#fff" }}>
        Low: {chartData[2].value}
      </div>
    </div>

    {/* BAR CHART */}
    <h4>📊 Risk Distribution</h4>
    <BarChart width={400} height={250} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Bar>
    </BarChart>

    {/* PIE CHART */}
    <h4 style={{ marginTop: "20px" }}>🥧 Risk Split</h4>
    <PieChart width={400} height={300}>
      <Pie
        data={chartData}
        dataKey="value"
        outerRadius={100}
        label
      >
        {chartData.map((entry, index) => (
          <Cell key={index} fill={COLORS[index]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>

    {/* LINE CHART */}
    <h4 style={{ marginTop: "20px" }}>📈 Wellness Trend</h4>

    {records.length < 2 && (
      <p style={{ color: "gray" }}>Add more data to see trend</p>
    )}

    <LineChart
      width={400}
      height={250}
      data={records.map((r, i) => ({
        name: `Case ${i + 1}`,
        score: r.score
      }))}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="score"
        stroke="#007bff"
        strokeWidth={3}
        dot={{ r: 4 }}
      />
    </LineChart>
  </div>
)}
    </div>
  );
}

export default App;