import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const socket = io("https://dei-quiz1.onrender.com");
const clickSound = new Audio("/sounds/click.mp3");
const nextSound = new Audio("/sounds/next.mp3");
const bgMusic = new Audio("/sounds/bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

export default function PlayerPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [message, setMessage] = useState("Waiting for host...");
  const [question, setQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [sharedList, setSharedList] = useState([]);
  const [topShared, setTopShared] = useState(false);
  const [timer, setTimer] = useState(null);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const avatars = [
    "/avatars/avatar1.png",
    "/avatars/avatar2.png",
    "/avatars/avatar3.png",
  ];

  // 🔹 Socket listeners
  useEffect(() => {
    socket.on("question", (q) => {
      setQuestion(q);
      setResults(null);
      setMessage("");
      setTimer(13);
    });

    socket.on("showResults", (res) => {
      setResults(res);
      setQuestion(null);
      setMessage("");
      setTimer(null);

      if (chartInstance) chartInstance.destroy();
      const ctx = chartRef.current?.getContext("2d");
      if (!ctx) return;

      const labels = Object.keys(res.characters);
      const values = Object.values(res.characters);

      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(255,140,66,0.6)");
      gradient.addColorStop(1, "rgba(255,140,66,0.1)");

      const newChart = new Chart(ctx, {
        type: "radar",
        data: {
          labels,
          datasets: [
            {
              label: "Your Archetype Strengths",
              data: values,
              backgroundColor: gradient,
              borderColor: "#FF8C42",
              borderWidth: 3,
              pointBackgroundColor: "#FF8C42",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 8,
              pointHoverRadius: 10,
              pointStyle: 'circle',
              hoverBorderWidth: 3
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
              suggestedMax: 4,
              ticks: { stepSize: 1, color: "#5e4033" },
              grid: { color: "#dcd0c0" },
              angleLines: { color: "#dcd0c0" }
            }
          }
        }
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

  // 🔹 Timer
  useEffect(() => {
    if (timer === null) return;
    if (timer === 0) {
      if (!muted) nextSound.play();
      socket.emit("timeout", roomId);
      setTimer(null);
      return;
    }
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [timer, muted]);

  // 🔹 Join room
  const joinRoom = () => {
    if (!name || !avatar) return;
    if (!muted) clickSound.play();
    socket.emit("join", { roomId, name, img: avatar });
    setJoined(true);
    if (!muted) bgMusic.play().catch(() => {});
  };

  // 🔹 Answer question
  const answerQuestion = (value) => {
    if (!muted) clickSound.play();
    socket.emit("answer", { roomId, answer: value });
    setQuestion(null);
  };

  // 🔹 Share top character
  const shareTopCharacter = () => {
    if (!muted) clickSound.play();
    socket.emit("shareTop", roomId);
    setTopShared(true);
  };

  // 🔹 Toggle mute
  const toggleMute = () => {
    setMuted((m) => {
      const newMute = !m;
      if (newMute) {
        bgMusic.pause();
      } else {
        bgMusic.play().catch(() => {});
      }
      return newMute;
    });
  };

  // 🔹 Animations
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes glow {
        from { text-shadow: 0 0 5px rgba(255,200,150,0.5); }
        to { text-shadow: 0 0 15px rgba(255,160,120,1); }
      }
      @keyframes float {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-100vh); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // 🔹 Join screen
  if (!joined) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "5vw",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #fbe9e7, #fffaf8)",
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: "#5e4033",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
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
            padding: 12,
            fontSize: "1.2em",
            borderRadius: 10,
            border: "1px solid #dcd0c0",
            width: "80%",
            maxWidth: 300,
            textAlign: "center",
            marginBottom: 20
          }}
        />

        <div style={{ marginBottom: 20, width: "100%", maxWidth: 360 }}>
          <div style={{ marginBottom: 8 }}>Select Your Avatar:</div>
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: 10,
              paddingBottom: 10
            }}
          >
            {avatars.map((a, i) => (
              <img
                key={i}
                src={a}
                alt="avatar"
                onClick={() => setAvatar(a)}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: avatar === a ? "3px solid #FF8C42" : "2px solid #dcd0c0",
                  cursor: "pointer",
                  flexShrink: 0
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={joinRoom}
          style={{
            padding: "14px 30px",
            borderRadius: 20,
            border: "none",
            background: "#FFB347",
            color: "#fff",
            fontSize: "1.2em",
            cursor: "pointer",
            boxShadow: "2px 4px 6px rgba(0,0,0,0.2)"
          }}
        >
          Join Room
        </button>

        <button
          onClick={toggleMute}
          style={{
            marginTop: 15,
            padding: "8px 12px",
            borderRadius: 15,
            border: "1px solid #dcd0c0",
            background: "#fff",
            cursor: "pointer",
            fontSize: "1.2em"
          }}
        >
          {muted ? <FaVolumeMute color="#888" /> : <FaVolumeUp color="#FFB347" />}
        </button>
      </div>
    );
  }

  // 🔹 Main gameplay
  return (
    <div
      style={{
        textAlign: "center",
        padding: 20,
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #fbe9e7, #fffaf8)",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        color: "#5e4033",
        position: "relative"
      }}
    >
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        <button
          onClick={toggleMute}
          style={{
            padding: "6px 12px",
            borderRadius: 15,
            border: "1px solid #dcd0c0",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          {muted ? <FaVolumeMute color="#888" /> : <FaVolumeUp color="#FF8C42" />}
        </button>
      </div>

      <h2 style={{ fontFamily: "'Pacifico', cursive", marginBottom: 20 }}>
        DEI Change Agent Quiz
      </h2>

      {question ? (
        <div>
          <div style={{ fontSize: "1.1em", fontWeight: 500, marginBottom: 15 }}>
            Question {question.index}/{question.total}
          </div>

          {timer !== null && (
            <div
              style={{
                fontSize: "1.5em",
                color: "#ff8c42",
                fontWeight: "bold",
                textShadow: "0 0 10px rgba(255,140,66,0.6)",
                marginBottom: 10
              }}
            >
              ⏳ {timer}s
            </div>
          )}

          <div
            style={{
              fontSize: "1.4em",
              fontWeight: 600,
              margin: "20px auto",
              padding: 15,
              borderRadius: 15,
              background: "rgba(255,255,255,0.6)",
              boxShadow: "2px 4px 10px rgba(0,0,0,0.1)",
              maxWidth: 600
            }}
          >
            {question.text}
          </div>

          {/* 🔹 Updated animated buttons */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 15,
              width: "100%",
            }}
          >
            {["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"].map((label, i) => (
              <button
                key={i}
                onClick={(e) => {
                  if (!muted) clickSound.play();
                  answerQuestion(i + 1);
                  e.currentTarget.classList.add("clicked");
                  setTimeout(() => e.currentTarget.classList.remove("clicked"), 400);
                }}
                style={{
                  width: "90%",
                  maxWidth: 350,
                  padding: "16px 0",
                  borderRadius: 20,
                  color: "#fff",
                  fontSize: "1.1em",
                  border: "none",
                  background: ["#FF8C42", "#FFB347", "#6CC4A1", "#6B8DD6"][i],
                  boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.3s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {label}
              </button>
            ))}

            <style>
              {`
                @media (max-width: 480px) {
                  button {
                    width: 95% !important;
                    font-size: 1em !important;
                    padding: 14px 0 !important;
                  }
                }

                .clicked {
                  transform: scale(0.95);
                  box-shadow: 0 0 15px rgba(255, 140, 66, 0.7) !important;
                  animation: bounce-glow 0.4s ease;
                }

                @keyframes bounce-glow {
                  0% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 140, 66, 0); }
                  40% { transform: scale(0.93); box-shadow: 0 0 15px rgba(255, 140, 66, 0.7); }
                  100% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 140, 66, 0); }
                }
              `}
            </style>
          </div>
        </div>
      ) : results ? (
        <div>
          <h3>Your Results</h3>
          <div style={{ margin: "15px 0" }}>
            <img
              src="/images/result-banner.png"
              alt="Result"
              style={{
                width: "80%",
                maxWidth: 300,
                margin: "15px auto",
                borderRadius: 20,
                boxShadow: "2px 4px 12px rgba(0,0,0,0.2)"
              }}
            />
          </div>

          <p>
            Top Character:{" "}
            <Link to={`/character/${results.topTwo[0][0]}`} style={{ color: "#FF8C42", textDecoration: "underline" }}>
              {results.topTwo[0][0]}
            </Link>
          </p>

          <div style={{ margin: "15px 0" }}>
            <img
              src={`/characters/${results.topTwo[0][0].toLowerCase().replace(/\s+/g, "-")}.png`}
              alt={results.topTwo[0][0]}
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
              }}
            />
          </div>

          <p>
            Secondary:{" "}
            <Link to={`/character/${results.topTwo[1][0]}`} style={{ color: "#FF8C42", textDecoration: "underline" }}>
              {results.topTwo[1][0]}
            </Link>
          </p>

          {results.hybrid && (
            <p>
              Hybrid:{" "}
              <Link to={`/character/${results.hybrid}`} style={{ color: "#FF8C42", textDecoration: "underline" }}>
                {results.hybrid}
              </Link>
            </p>
          )}

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
                boxShadow: "2px 4px 6px rgba(0,0,0,0.2)"
              }}
            >
              Share My Top Character
            </button>
          )}

          <div style={{ marginTop: 30, height: 400 }}>
            <canvas
              ref={chartRef}
              style={{
                width: "90vw",
                maxWidth: 400,
                height: "90vw",
                maxHeight: 400,
                margin: "auto"
              }}
            />
                   </div>
 
        </div>
      ) : (
        <p>{message}</p>
      )}

      {sharedList.length > 0 && (
        <div style={{ position: "absolute", bottom: 20, left: 20 }}>
          <h4>Shared Top Characters:</h4>
          <ul>
            {sharedList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
