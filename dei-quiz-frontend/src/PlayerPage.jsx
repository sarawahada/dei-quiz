import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const socket = io("https://dei-quiz1.onrender.com");

const avatars = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
];

export default function PlayerPage() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("Waiting for host...");
  const [question, setQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [sharedList, setSharedList] = useState([]);
  const [topShared, setTopShared] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    socket.on("question", (q) => {
      setQuestion(q);
      setMessage("");
    });

    socket.on("showResults", (res) => {
      setResults(res);
      setQuestion(null);
      setMessage("");
      if (chartInstance) chartInstance.destroy();

      const ctx = chartRef.current.getContext("2d");
      const labels = Object.keys(res.characters);
      const values = Object.values(res.characters);
      const colors = {
        Equalizer: "#6CC4A1",
        Bridgebuilder: "#FFB347",
        Catalyst: "#FF8C42",
        "Devil Advocate": "#6B8DD6",
      };

      const newChart = new Chart(ctx, {
        type: "radar",
        data: {
          labels,
          datasets: [
            {
              label: "Your Archetype Strengths",
              data: values,
              backgroundColor: labels.map((l) => colors[l] + "80"),
              borderColor: labels.map((l) => colors[l]),
              borderWidth: 2,
              pointBackgroundColor: labels.map((l) => colors[l]),
            },
          ],
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
              angleLines: { color: "#dcd0c0" },
            },
          },
        },
      });
      setChartInstance(newChart);
    });

    socket.on("updateShared", (list) => setSharedList(list));

    return () => {
      socket.off("question");
      socket.off("showResults");
      socket.off("updateShared");
    };
  }, [chartInstance]);

  const joinRoom = () => {
    if (!name) return;
    socket.emit("join", { roomId, name, img: avatars[selectedAvatar] });
    setJoined(true);
  };

  const answerQuestion = (value) => {
    socket.emit("answer", { roomId, value });
    setQuestion(null);
    setMessage("Waiting for other players...");
  };

  const shareTopCharacter = () => {
    socket.emit("shareTop", roomId);
    setTopShared(true);
  };

  if (!joined) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 40,
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #fbe9e7, #fffaf8)",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#5e4033",
        }}
      >
        <h2 style={{ fontFamily: "'Pacifico', cursive", marginBottom: 20 }}>
          DEI Change Agent Quiz
        </h2>

        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 10,
            fontSize: "1.1em",
            borderRadius: 10,
            border: "1px solid #dcd0c0",
          }}
        />

        <div style={{ marginTop: 20 }}>
          <h4>Select Avatar</h4>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 15,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            {avatars.map((av, idx) => (
              <img
                key={idx}
                src={av}
                onClick={() => setSelectedAvatar(idx)}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    selectedAvatar === idx
                      ? "3px solid #FFB347"
                      : "2px solid #dcd0c0",
                  boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s",
                  transform:
                    selectedAvatar === idx ? "scale(1.1)" : "scale(1.0)",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <button
            onClick={joinRoom}
            style={{
              padding: "12px 30px",
              borderRadius: 20,
              border: "none",
              background: "#FFB347",
              color: "#fff",
              fontSize: "1.1em",
              cursor: "pointer",
              boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: 30,
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #fbe9e7, #fffaf8)",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        color: "#5e4033",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        <img
          src={avatars[selectedAvatar]}
          alt="avatar"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: "2px solid #FFB347",
          }}
        />
        <h2
          style={{
            fontFamily: "'Pacifico', cursive",
            margin: 0,
          }}
        >
          {name}
        </h2>
      </div>

      {question ? (
        <div>
          <div
            style={{ fontSize: "1.1em", fontWeight: 500, marginBottom: 15 }}
          >
            Question {question.index}/{question.total}
          </div>
          <div
            style={{
              fontSize: "1.4em",
              fontWeight: 600,
              margin: "20px auto",
              padding: 15,
              borderRadius: 15,
              background: "rgba(255,255,255,0.6)",
              boxShadow: "2px 4px 10px rgba(0,0,0,0.1)",
              maxWidth: 600,
            }}
          >
            {question.text}
          </div>

          <div style={{ marginTop: 20 }}>
            {[1, 2, 3, 4].map((v, i) => (
              <button
                key={i}
                onClick={() => answerQuestion(v)}
                style={{
                  margin: 10,
                  padding: "20px 40px",
                  borderRadius: 20,
                  color: "#fff",
                  fontSize: "1.2em",
                  border: "2px solid #fff",
                  background: ["#FF8C42", "#FFB347", "#6CC4A1", "#6B8DD6"][i],
                  boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  transition: "transform 0.15s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                Option {v}
              </button>
            ))}
          </div>
        </div>
      ) : results ? (
        <div>
          <h3>Your Results</h3>
          <p>Top Character: {results.topTwo[0][0]}</p>
          <p>Secondary: {results.topTwo[1][0]}</p>
          {results.hybrid && <p>Hybrid: {results.hybrid}</p>}

          {!topShared && (
            <button
              onClick={shareTopCharacter}
              style={{
                marginTop: 20,
                padding: "12px 30px",
                borderRadius: 20,
                border: "none",
                background: "#FFB347",
                color: "#fff",
                fontSize: "1.1em",
                cursor: "pointer",
                boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
              }}
            >
              Share My Top Character
            </button>
          )}

          <div style={{ marginTop: 30 }}>
            <canvas
              ref={chartRef}
              style={{
                maxWidth: 400,
                margin: "0 auto",
                background: "rgba(255,250,240,0.8)",
                borderRadius: 20,
                boxShadow: "2px 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </div>

          {sharedList.length > 0 && (
            <div
              style={{
                marginTop: 30,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {sharedList.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "inline-block",
                    margin: 10,
                    padding: 10,
                    background: "#fff3e0",
                    borderRadius: 15,
                    boxShadow: "1px 2px 6px rgba(0,0,0,0.15)",
                    textAlign: "center",
                    minWidth: 100,
                  }}
                >
                  <img
                    src={p.img}
                    alt="shared avatar"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "2px solid #FFB347",
                    }}
                  />
                  <div style={{ fontWeight: "bold", marginTop: 5 }}>{p.name}</div>
                  <div style={{ fontSize: "0.9em", color: "#8d6e63" }}>
                    {p.topCharacter}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: "1.2em" }}>{message}</p>
      )}
    </div>
  );
}
