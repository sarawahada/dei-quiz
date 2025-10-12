import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const characterData = {
  Equalizer: {
    strengths: ["Fair-minded", "Good listener", "Balances conflicts"],
    weaknesses: ["Avoids confrontation", "Indecisive"],
    scores: { Empathy: 4, Strategy: 3, Innovation: 2, Analysis: 3 }
  },
  Bridgebuilder: {
    strengths: ["Connects people", "Facilitates collaboration", "Strong networker"],
    weaknesses: ["Overcommits", "Puts others first"],
    scores: { Empathy: 4, Strategy: 3, Innovation: 3, Analysis: 2 }
  },
  Catalyst: {
    strengths: ["Innovative", "Energetic", "Motivates others"],
    weaknesses: ["Impatient", "Acts before planning"],
    scores: { Empathy: 3, Strategy: 3, Innovation: 4, Analysis: 2 }
  },
  "Devil Advocate": {
    strengths: ["Critical thinker", "Challenges assumptions", "Encourages careful decisions"],
    weaknesses: ["Can seem negative", "Frustrates team"],
    scores: { Empathy: 2, Strategy: 3, Innovation: 3, Analysis: 4 }
  }
};

const colors = {
  Equalizer: "#6CC4A1",
  Bridgebuilder: "#FFB347",
  Catalyst: "#FF8C42",
  "Devil Advocate": "#6B8DD6"
};

export default function CharacterPage() {
  const { name } = useParams(); // character name from URL
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const char = characterData[name];

  useEffect(() => {
    if (!char) return;

    if (chartInstance) chartInstance.destroy();

    const ctx = chartRef.current.getContext("2d");
    const labels = Object.keys(char.scores);
    const values = Object.values(char.scores);

    const newChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: `${name} Strengths`,
            data: values,
            backgroundColor: colors[name] + "80",
            borderColor: colors[name],
            borderWidth: 2,
            pointBackgroundColor: colors[name]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 4,
            ticks: { stepSize: 1, color: "#5e4033" },
            grid: { color: "#dcd0c0" },
            angleLines: { color: "#dcd0c0" }
          }
        }
      }
    });
    setChartInstance(newChart);
  }, [char, chartInstance, name]);

  if (!char) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>Character not found</h2>
        <Link to="/">Go Back</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: 20,
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #fbe9e7, #fffaf8)",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        color: "#5e4033"
      }}
    >
      <h2 style={{ fontFamily: "'Pacifico', cursive'", marginBottom: 20 }}>{name}</h2>

      <div style={{ marginBottom: 30, maxWidth: 400, margin: "0 auto" }}>
        <canvas
          ref={chartRef}
          style={{
            width: "100%",
            background: "rgba(255,250,240,0.8)",
            borderRadius: 20,
            boxShadow: "2px 4px 12px rgba(0,0,0,0.1)"
          }}
        />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "left" }}>
        <h3>Strengths:</h3>
        <ul>
          {char.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <h3>Weaknesses:</h3>
        <ul>
          {char.weaknesses.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      <Link
        to="/"
        style={{
          display: "inline-block",
          marginTop: 30,
          padding: "10px 25px",
          background: "#FFB347",
          color: "#fff",
          borderRadius: 15,
          textDecoration: "none",
          boxShadow: "2px 4px 6px rgba(0,0,0,0.2)"
        }}
      >
        Back to Quiz
      </Link>
    </div>
  );
}
