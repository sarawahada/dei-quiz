import React, { useEffect, useRef } from "react";
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { useLocation, useNavigate } from "react-router-dom";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function CharacterPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const results = state?.results;
  const roomId = state?.roomId;
  const chartRef = useRef(null);

  useEffect(() => {
    if (!results) return;

    const ctx = chartRef.current.getContext("2d");
    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    chartRef.current.chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: Object.keys(results),
        datasets: [
          {
            label: "Character Traits",
            data: Object.values(results),
            backgroundColor: "rgba(255, 179, 71, 0.3)",
            borderColor: "rgba(255, 179, 71, 0.8)",
            borderWidth: 2,
            pointBackgroundColor: "#FFB347",
            fill: true,
            tension: 0.4, // adds curvature for a 3D feel
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderJoinStyle: "round",
            shadowBlur: 10,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
        scales: {
          r: {
            angleLines: {
              color: "rgba(255,255,255,0.1)",
            },
            grid: {
              color: "rgba(255,255,255,0.2)",
            },
            pointLabels: {
              color: "#444",
              font: { size: 14 },
            },
            ticks: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#333",
              font: { size: 14, family: "Poppins" },
            },
          },
        },
      },
    });
  }, [results]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        color: "#333",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <img
        src={resultImage}
        alt="Character Result"
        style={{
          width: "100%",
          borderRadius: "20px",
          marginBottom: "20px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      />

      <h2>Your Character Summary</h2>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "350px",
          margin: "20px auto",
        }}
      >
        <canvas ref={chartRef}></canvas>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column", // ensures vertical stacking on mobile
          alignItems: "center",
          gap: "15px",
          marginTop: "30px",
        }}
      >
        <button
          onClick={() => navigate(-1)} // navigates back to ResultPage
          style={{
            display: "inline-block",
            padding: "10px 25px",
            background: "#FFB347",
            color: "#fff",
            borderRadius: 15,
            textDecoration: "none",
            boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
            cursor: "pointer",
            border: "none",
            width: "80%",
            maxWidth: "300px",
          }}
        >
          Back to Quiz
        </button>

        <button
          onClick={() =>
            navigate(`/player/${roomId}`, { state: { results } })
          }
          style={{
            display: "inline-block",
            padding: "10px 25px",
            background: "#FF8C00",
            color: "#fff",
            borderRadius: 15,
            textDecoration: "none",
            boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
            cursor: "pointer",
            border: "none",
            width: "80%",
            maxWidth: "300px",
          }}
        >
          Replay Quiz
        </button>
      </div>
    </div>
  );
}
