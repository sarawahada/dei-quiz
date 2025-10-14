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
import { FaVolumeMute, FaVolumeUp, FaShareAlt, FaCrown, FaLightbulb, FaUserShield } from "react-icons/fa";

// Register Chart.js components
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Constants
const SOCKET_URL = "https://dei-quiz1.onrender.com";
const COLOR_PRIMARY = "#FF8C42"; // Orange-Red
const COLOR_SECONDARY = "#FFB347"; // Lighter Orange
const COLOR_BACKGROUND_LIGHT = "#fffaf8"; // Very light off-white
const COLOR_TEXT_DARK = "#5e4033"; // Dark Brown

const socket = io(SOCKET_URL);
// Assuming these sound files exist in the public directory
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

  // Example avatar paths (ensure these exist)
  const avatars = [
    "/avatars/avatar1.png",
    "/avatars/avatar2.png",
    "/avatars/avatar3.png",
    "/avatars/avatar4.png",
  ];

  // 🔹 Socket listeners & Chart generation
  useEffect(() => {
    // ... (Socket listeners logic remains mostly the same)
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

      // Extract only the values that matter for the radar chart data
      // Assuming res.characters is structured like { 'Empathy': 4, 'Analysis': 3, ... }
      const labels = Object.keys(res.characters);
      const values = Object.values(res.characters);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(255,140,66,0.8)"); // Stronger color for fill
      gradient.addColorStop(1, "rgba(255,140,66,0.2)"); // Lighter color for fill

      const newChart = new Chart(ctx, {
        type: "radar",
        data: {
          labels,
          datasets: [
            {
              label: "Your Strengths",
              data: values,
              backgroundColor: gradient,
              borderColor: COLOR_PRIMARY,
              borderWidth: 3,
              pointBackgroundColor: COLOR_PRIMARY,
              pointBorderColor: COLOR_BACKGROUND_LIGHT,
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
          plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: COLOR_TEXT_DARK,
                titleFont: { weight: 'bold' },
                bodyFont: { weight: 'normal' },
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              suggestedMax: 4,
              pointLabels: { // Style for the labels (Empathy, Strategy, etc.)
                font: { size: 14, weight: 'bold' },
                color: COLOR_TEXT_DARK,
              },
              ticks: { 
                stepSize: 1, 
                color: COLOR_TEXT_DARK,
                backdropColor: 'rgba(255, 255, 255, 0.7)', // Backdrop for numbers
              },
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
      if (chartInstance) chartInstance.destroy();
    };
  }, [chartInstance]);

  // 🔹 Timer (logic remains the same)
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
  }, [timer, muted, roomId]);

  // 🔹 Action Handlers (logic remains the same)
  const joinRoom = () => {
    if (!name || !avatar) return;
    if (!muted) clickSound.play();
    socket.emit("join", { roomId, name, img: avatar });
    setJoined(true);
    if (!muted) bgMusic.play().catch(() => {});
  };

  const answerQuestion = (value) => {
    if (!muted) clickSound.play();
    socket.emit("answer", { roomId, answer: value });
    setQuestion(null);
  };

  const shareTopCharacter = () => {
    if (!muted) clickSound.play();
    socket.emit("shareTop", roomId);
    setTopShared(true);
  };

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

  // 🔹 Styled Components

  // A reusable card style
  const cardStyle = {
    background: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    boxShadow: "0 6px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
    marginBottom: 20,
    backdropFilter: "blur(5px)",
  };

  const ButtonStyle = {
    padding: "16px 0",
    borderRadius: 25,
    color: "#fff",
    fontSize: "1.1em",
    border: "none",
    background: COLOR_PRIMARY,
    boxShadow: "0 4px 10px rgba(255,140,66,0.4)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: 600,
  };

  // 🔹 Join screen
  if (!joined) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "5vw",
          minHeight: "100vh",
          background: `linear-gradient(to bottom right, ${COLOR_BACKGROUND_LIGHT}, #fbe9e7)`,
          fontFamily: "'Nunito', 'Inter', sans-serif",
          color: COLOR_TEXT_DARK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ 
            fontFamily: "'Pacifico', cursive", 
            marginBottom: 30, 
            fontSize: "2.5em", 
            color: COLOR_PRIMARY,
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
        }}>
          Change Agent Quiz
        </h1>

        <div style={{ ...cardStyle, width: "90%", maxWidth: 400 }}>
            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Join the Game</h3>
            <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
                padding: 12,
                fontSize: "1.2em",
                borderRadius: 10,
                border: "1px solid #dcd0c0",
                width: "90%",
                textAlign: "center",
                marginBottom: 25,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
            }}
            />

            <div style={{ marginBottom: 25, width: "100%" }}>
                <div style={{ marginBottom: 15, fontWeight: 600 }}>Select Your Avatar:</div>
                <div
                    style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: 15,
                    padding: "5px 0 15px",
                    justifyContent: "center",
                    }}
                >
                    {avatars.map((a, i) => (
                    <img
                        key={i}
                        src={a}
                        alt="avatar"
                        onClick={() => setAvatar(a)}
                        style={{
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: avatar === a ? `4px solid ${COLOR_PRIMARY}` : "2px solid #dcd0c0",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: avatar === a ? `0 0 10px ${COLOR_PRIMARY}` : "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                    />
                    ))}
                </div>
            </div>

            <button
            onClick={joinRoom}
            style={{
                ...ButtonStyle,
                width: "100%",
                background: COLOR_PRIMARY,
                padding: "16px 30px",
                fontSize: "1.3em",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
            🚀 Join Room
            </button>
        </div>

        <button
          onClick={toggleMute}
          style={{
            marginTop: 25,
            padding: "10px 15px",
            borderRadius: 20,
            border: "1px solid #dcd0c0",
            background: "#fff",
            cursor: "pointer",
            fontSize: "1.3em",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}
        >
          {muted ? <FaVolumeMute color="#888" /> : <FaVolumeUp color={COLOR_PRIMARY} />}
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
        background: `linear-gradient(to bottom, ${COLOR_BACKGROUND_LIGHT}, #fbe9e7)`,
        fontFamily: "'Nunito', 'Inter', sans-serif",
        color: COLOR_TEXT_DARK,
        position: "relative",
      }}
    >
      {/* Mute Button */}
      <div style={{ position: "absolute", top: 15, right: 15, zIndex: 10 }}>
        <button
          onClick={toggleMute}
          style={{
            padding: "8px 12px",
            borderRadius: 15,
            border: "1px solid #dcd0c0",
            background: "#fff",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          {muted ? <FaVolumeMute color="#888" /> : <FaVolumeUp color={COLOR_PRIMARY} />}
        </button>
      </div>

      <h1 style={{ 
          fontFamily: "'Pacifico', cursive", 
          marginBottom: 30, 
          fontSize: "2.2em",
          color: COLOR_TEXT_DARK 
      }}>
        Change Agent Quiz
      </h1>

      {question ? (
        // --- Question Screen ---
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: "0 10px" }}>
            <span style={{ fontSize: "1.1em", fontWeight: 600, color: COLOR_TEXT_DARK }}>
              <FaLightbulb color={COLOR_SECONDARY} style={{ marginRight: 5 }} /> Question {question.index}/{question.total}
            </span>
            {timer !== null && (
              <div
                style={{
                  fontSize: "1.5em",
                  color: COLOR_PRIMARY,
                  fontWeight: "bold",
                  padding: "5px 15px",
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.7)',
                  boxShadow: "0 0 10px rgba(255,140,66,0.3)",
                  animation: timer <= 5 ? "pulse 1s infinite" : "none"
                }}
              >
                <span style={{ animation: "glow 1s infinite alternate" }}>
                    {timer}s ⏳
                </span>
              </div>
            )}
          </div>


          {/* Question Text Card */}
          <div
            style={{
              ...cardStyle,
              margin: "20px auto",
              padding: 25,
              fontSize: "1.5em",
              fontWeight: 700,
              lineHeight: 1.4,
              color: COLOR_TEXT_DARK,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
            }}
          >
            {question.text}
          </div>

          {/* 🔹 Animated Answer Buttons */}
          <div
            style={{
              marginTop: 30,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 15,
              width: "100%",
            }}
          >
            {[
              { label: "Strongly Agree", color: "#FF8C42" }, // Primary
              { label: "Agree", color: "#FFB347" }, // Secondary
              { label: "Disagree", color: "#6CC4A1" }, // Green (Neutral/Calm)
              { label: "Strongly Disagree", color: "#6B8DD6" } // Blue (Opposite)
            ].map(({ label, color }, i) => (
              <button
                key={i}
                onClick={(e) => {
                  if (!muted) clickSound.play();
                  answerQuestion(i + 1);
                  e.currentTarget.classList.add("clicked");
                  setTimeout(() => e.currentTarget.classList.remove("clicked"), 400);
                }}
                style={{
                  ...ButtonStyle,
                  width: "90%",
                  maxWidth: 380,
                  background: color,
                  boxShadow: `0 4px 10px ${color}80`, // 80 is for opacity
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {label}
              </button>
            ))}

            <style>
              {`
                @keyframes pulse {
                    0% { box-shadow: 0 0 10px ${COLOR_PRIMARY}60; }
                    50% { box-shadow: 0 0 20px ${COLOR_PRIMARY}; }
                    100% { box-shadow: 0 0 10px ${COLOR_PRIMARY}60; }
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
        // --- Results Screen ---
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ 
              ...cardStyle, 
              padding: "25px 20px",
              background: `linear-gradient(to top right, ${COLOR_BACKGROUND_LIGHT} 50%, #fef3ec)`, 
          }}>
            <h3 style={{ 
                fontSize: "1.8em", 
                color: COLOR_PRIMARY, 
                marginBottom: 20, 
                fontWeight: 800 
            }}>
              Your Change Agent Profile!
            </h3>

            {/* Top Character */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '15px 0' }}>
                    <FaCrown color="#FFD700" size={30} style={{ marginRight: 10 }} />
                    <span style={{ fontSize: "1.4em", fontWeight: 700 }}>Top Character:</span>
                </div>
                
                <Link 
                    to={`/character/${results.topTwo[0][0]}`} 
                    style={{ 
                        color: COLOR_PRIMARY, 
                        textDecoration: "none", 
                        fontSize: "2em", 
                        fontWeight: 900, 
                        display: 'block',
                        textTransform: 'uppercase'
                    }}
                >
                    {results.topTwo[0][0]}
                </Link>

                <img
                    src={`/characters/${results.topTwo[0][0].toLowerCase().replace(/\s+/g, "-")}.png`}
                    alt={results.topTwo[0][0]}
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginTop: 15,
                        marginBottom: 10,
                        border: `5px solid ${COLOR_SECONDARY}`,
                        boxShadow: "0 6px 15px rgba(0,0,0,0.3)"
                    }}
                />
            </div>
            
            {/* Secondary and Hybrid */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                <p style={{ fontWeight: 600 }}>
                    Secondary:{" "}
                    <Link to={`/character/${results.topTwo[1][0]}`} style={{ color: COLOR_TEXT_DARK, textDecoration: "underline" }}>
                        {results.topTwo[1][0]}
                    </Link>
                </p>

                {results.hybrid && (
                    <p style={{ fontWeight: 600 }}>
                        Hybrid:{" "}
                        <Link to={`/character/${results.hybrid}`} style={{ color: COLOR_TEXT_DARK, textDecoration: "underline" }}>
                            {results.hybrid}
                        </Link>
                    </p>
                )}
            </div>
            

            {!topShared && (
                <button
                onClick={shareTopCharacter}
                style={{
                    ...ButtonStyle,
                    marginTop: 10,
                    padding: "15px 30px",
                    fontSize: "1.1em",
                    background: COLOR_PRIMARY,
                }}
                >
                <FaShareAlt style={{ marginRight: 8 }} /> Share My Top Character
                </button>
            )}
          </div>
          
          {/* Radar Chart Card */}
          <div style={{ ...cardStyle, padding: 10, height: 450 }}>
            <h4 style={{ marginBottom: 15, fontWeight: 700 }}>Archetype Strengths</h4>
            <canvas
              ref={chartRef}
              style={{
                width: "100%",
                height: "100%",
                margin: "auto",
              }}
            />
          </div>
 
        </div>
      ) : (
        // --- Waiting Screen ---
        <div style={{
            ...cardStyle, 
            marginTop: 50, 
            padding: 40,
            fontSize: "1.5em",
            fontWeight: 600,
            color: COLOR_TEXT_DARK
        }}>
            <FaUserShield size={40} color={COLOR_SECONDARY} style={{ marginBottom: 15 }} />
            <p>{message}</p>
        </div>
      )}

      {/* Shared List (Simplified for Player Screen) */}
      {sharedList.length > 0 && (
        <div 
            style={{ 
                position: "fixed", 
                bottom: 20, 
                left: 20, 
                padding: "10px 15px", 
                background: "rgba(255, 255, 255, 0.7)", 
                borderRadius: 15,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                backdropFilter: "blur(3px)",
                textAlign: 'left'
            }}
        >
          <h4 style={{ margin: "0 0 5px", fontSize: "1em" }}>Shared Profiles:</h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, fontSize: "0.9em" }}>
            {sharedList.slice(0, 3).map((item, i) => (
              <li key={i} style={{ marginBottom: 2 }}>🌟 {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}