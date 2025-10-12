import React from "react";
import { useParams, Link } from "react-router-dom";

// Example character data
const characterData = {
  Equalizer: {
    strengths: ["Fair-minded", "Good listener", "Balances conflicts well"],
    weaknesses: ["May avoid confrontation", "Can be indecisive"]
  },
  Bridgebuilder: {
    strengths: ["Connects people", "Facilitates collaboration", "Strong networker"],
    weaknesses: ["Overcommits", "May prioritize others over self"]
  },
  Catalyst: {
    strengths: ["Innovative", "Energetic", "Motivates others"],
    weaknesses: ["Impatient", "Can act before planning"]
  },
  "Devil Advocate": {
    strengths: ["Critical thinker", "Challenges assumptions", "Encourages careful decisions"],
    weaknesses: ["May seem negative", "Can frustrate team members"]
  }
};

export default function CharacterPage() {
  const { name } = useParams();
  const char = characterData[name];

  if (!char) {
    return (
      <div style={{ textAlign: "center", padding: 30 }}>
        <h2>Character not found</h2>
        <Link to="/" style={{ color: "#FF8C42", textDecoration: "underline" }}>
          Back to quiz
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "5vw",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #fbe9e7, #fffaf8)",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        color: "#5e4033"
      }}
    >
      <h2 style={{ fontFamily: "'Pacifico', cursive", marginBottom: 20 }}>{name}</h2>

      <div
        style={{
          margin: "20px auto",
          maxWidth: 600,
          background: "rgba(255,255,255,0.6)",
          padding: 20,
          borderRadius: 15,
          boxShadow: "2px 4px 10px rgba(0,0,0,0.1)"
        }}
      >
        <h3 style={{ color: "#FF8C42" }}>Strengths</h3>
        <ul style={{ textAlign: "left", paddingLeft: 20 }}>
          {char.strengths.map((s, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {s}
            </li>
          ))}
        </ul>

        <h3 style={{ color: "#FF8C42", marginTop: 20 }}>Weaknesses</h3>
        <ul style={{ textAlign: "left", paddingLeft: 20 }}>
          {char.weaknesses.map((w, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {w}
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/"
        style={{
          display: "inline-block",
          marginTop: 30,
          padding: "12px 25px",
          borderRadius: 20,
          background: "#FFB347",
          color: "#fff",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        Back to Quiz
      </Link>
    </div>
  );
}
