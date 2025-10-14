import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

// Example colors and images for each character (adjust as you wish)
const colors = {
  Athena: "#FFB347",
  Apollo: "#5E9C76",
  Hades: "#8C6BB1",
  Artemis: "#F58CBA"
};

const resultImages = {
  Athena: "/images/athena.png",
  Apollo: "/images/apollo.png",
  Hades: "/images/hades.png",
  Artemis: "/images/artemis.png"
};

// Example character data placeholder
const characterData = {
  Athena: {
    scores: { Logic: 4, Wisdom: 3, Strategy: 4, Empathy: 2 },
    strengths: ["Analytical", "Wise", "Strategic"],
    weaknesses: ["Detached", "Perfectionist"]
  },
  Apollo: {
    scores: { Creativity: 4, Charisma: 3, Warmth: 4, Logic: 2 },
    strengths: ["Inspiring", "Optimistic", "Creative"],
    weaknesses: ["Impulsive", "Distracted"]
  },
  Hades: {
    scores: { Depth: 4, Intuition: 3, Loyalty: 4, Openness: 2 },
    strengths: ["Loyal", "Introspective", "Powerful"],
    weaknesses: ["Moody", "Secretive"]
  },
  Artemis: {
    scores: { Independence: 4, Courage: 3, Empathy: 3, Focus: 2 },
    strengths: ["Independent", "Brave", "Protective"],
    weaknesses: ["Stubborn", "Cold at times"]
  }
};

export default function CharacterPage() {
  const { name, roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results || null;

  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const char = characterData[name];

  useEffect(() => {
    if (!char) return;

    if (chartInstance) chartInstance.destroy();

    const ctx = chartRef.current.getContext("2d");
    const labels = Object.keys(char.scores);
    const values = Object.values(char.scores);

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[name] + "b0");
    gradient.addColorStop(1, colors[name] + "30");

    const newChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: `${name} Strengths`,
            data: values,
            backgroundColor: gradient,
            borderColor: colors[name],
            borderWidth: 3,
            pointBackgroundColor: "#fff",
            pointBorderColor: colors[name],
            pointHoverRadius: 7,
            pointHoverBackgroundColor: colors[name],
            tension: 0.3 // adds a slight 3D curve feel
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 5,
            ticks: { stepSize: 1, color: "#5e4033" },
            grid: { color: "#e5d0c0" },
            angleLines: { color: "#e5d0c0" },
            pointLabels: { color: "#5e4033", font: { size: 14 } }
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
        <button onClick={() => navigate(-1)}>Go Back</button>
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
      <h2
        style={{
          fontFamily: "'Pacifico', cursive",
          marginBottom: 20,
          fontSize: "2rem"
        }}
      >
        {name}
      </h2>

      {resultImages[name] && (
        <img
          src={resultImages[name]}
          alt={`${name} result`}
          style={{
            width: "200px",
            height: "200px",
            objectFit: "contain",
            marginBottom: 25
          }}
        />
      )}

      <div
        style={{
          marginBottom: 30,
          maxWidth: 400,
          margin: "0 auto",
          height: 400
        }}
      >
        <canvas
          ref={chartRef}
          style={{
            width: "100%",
            background: "rgba(255,250,240,0.8)",
            borderRadius: 20,
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)"
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

      {/* ✅ Mobile-friendly stacked buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          marginTop: 40
        }}
      >
        <button
          onClick={() => navigate(`/player/${roomId}`, { state: { results } })}
          style={{
            width: "80%",
            maxWidth: 250,
            padding: "12px 20px",
            background: "#FFB347",
            color: "#fff",
            borderRadius: 15,
            boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "1rem",
            border: "none"
          }}
        >
          Back to Quiz
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            width: "80%",
            maxWidth: 250,
            padding: "12px 20px",
            background: "#8C6BB1",
            color: "#fff",
            borderRadius: 15,
            boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "1rem",
            border: "none"
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
