import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
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
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const socket = io("https://dei-quiz1.onrender.com");

// 🔊 sound effects
const clickSound = new Audio("/sounds/click.mp3");
const nextSound = new Audio("/sounds/next.mp3");
const bgMusic = new Audio("/sounds/bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

export default function PlayerPage() {
  const { roomId } = useParams();
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
    "/avatars/avatar4.png",
    "/avatars/avatar5.png",
    "/avatars/avatar6.png"
  ];

  // 🔹 Socket listeners
  useEffect(() => {
    socket.on("question", (q) => {
      setQuestion(q);
      setMessage("");
      setTimer(13);
    });

    socket.on("showResults", (res) => {
      setResults(res);
      setQuestion(null);
      setMessage("");
      setTimer(null);
      if (chartInstance) chartInstance.destroy();

      const ctx = chartRef.current.getContext("2d");
      const labels = Object.keys(res.characters);
      const values = Object.values(res.characters);
      const colors = {
        Equalizer: "#6CC4A1",
        Bridgebuilder: "#FFB347",
        Catalyst: "#FF8C42",
        "Devil Advocate": "#6B8DD6"
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
              pointBackgroundColor: labels.map((l) => colors[l])
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

 <div style={{ marginTop: 20 }}>
  {["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"].map((label, i) => (
    <button
      key={i}
      onClick={() => answerQuestion(i + 1)} // still send 1-4 to backend
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
        transition: "transform 0.15s"
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {label}
    </button>
  ))}
</div>


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
      {/* Top right mute button */}
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
          {muted ? <FaVolumeMute color="#888" /> : <FaVolumeUp color="#FFB347" />}
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
                  transition: "transform 0.15s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Option {v}
              </button>
            ))}
          </div>
        </div>
      ) : results ? (
        <div>
          <h3>Your Results</h3>
          <p>
            Top Character:{" "}
            <Link to={`/character/${results.topTwo[0][0]}`} style={{ color: "#FF8C42", textDecoration: "underline" }}>
              {results.topTwo[0][0]}
            </Link>
          </p>
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

          <div style={{ marginTop: 30 }}>
            <canvas
              ref={chartRef}
              style={{
                maxWidth: 400,
                margin: "0 auto",
                background: "rgba(255,250,240,0.8)",
                borderRadius: 20,
                boxShadow: "2px 4px 12px rgba(0,0,0,0.1)"
              }}
            />
          </div>

          {sharedList.length > 0 && (
            <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
              {sharedList.map((p, i) => {
                const char = {
                  Equalizer: "Strengths: Fair-minded, Good listener, Balances conflicts. Weaknesses: Avoids confrontation, Indecisive",
                  Bridgebuilder: "Strengths: Connects people, Facilitates collaboration, Strong networker. Weaknesses: Overcommits, Puts others first",
                  Catalyst: "Strengths: Innovative, Energetic, Motivates others. Weaknesses: Impatient, Acts before planning",
                  "Devil Advocate": "Strengths: Critical thinker, Challenges assumptions, Encourages careful decisions. Weaknesses: Can seem negative, Frustrates team"
                }[p.topCharacter] || "";

                return (
                  <div
                    key={i}
                    title={char}
                    style={{
                      display: "inline-block",
                      margin: 10,
                      padding: 10,
                      background: "#fff3e0",
                      borderRadius: 15,
                      boxShadow: "1px 2px 6px rgba(0,0,0,0.15)",
                      textAlign: "center",
                      minWidth: 100
                    }}
                  >
                    <img
                      src={p.img}
                      style={{ width: 60, height: 60, borderRadius: "50%" }}
                      alt="avatar"
                    />
                    <div style={{ fontWeight: "bold", marginTop: 5 }}>{p.name}</div>
                    <div style={{ fontSize: "0.9em", color: "#8d6e63" }}>{p.topCharacter}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(to bottom, #fbe9e7, #fffaf8)",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <h3
            style={{
              color: "#5e4033",
              fontSize: "1.6em",
              textShadow: "0 0 15px rgba(255,200,150,0.8)",
              animation: "glow 2s infinite alternate"
            }}
          >
            Waiting for other players...
          </h3>

          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              overflow: "hidden"
            }}
          >
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: "4px",
                  height: "4px",
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: "50%",
                  animation: `float ${3 + Math.random() * 5}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
