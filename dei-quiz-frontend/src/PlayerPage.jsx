import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const socket = io("https://dei-quiz1.onrender.com");

const avatars = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png"
];

export default function PlayerPage() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("Waiting for host...");
  const [question, setQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [sharedList, setSharedList] = useState([]);
  const [topShared, setTopShared] = useState(false);

  const [bgMusic, setBgMusic] = useState(null);
  const [clickSound, setClickSound] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    setBgMusic(document.getElementById("bgMusic"));
    setClickSound(document.getElementById("clickSound"));
  }, []);

  useEffect(() => {
    socket.on("question", (q) => {
      setQuestion(q);
      setMessage("");
      setResults(null);
    });

    socket.on("showResults", (data) => {
      setResults(data);
      setQuestion(null);
      setMessage("");
    });

    socket.on("updateShared", (list) => setSharedList(list));

    socket.on("updatePlayers", (players) => {
      // handled in sharedList or elsewhere if needed
    });

    return () => {
      socket.off("question");
      socket.off("showResults");
      socket.off("updateShared");
      socket.off("updatePlayers");
    };
  }, []);

  const joinRoom = () => {
    if (!name || !roomId) return;
    socket.emit("join", { roomId, name, img: avatar });
    setJoined(true);
  };

  const answerQuestion = (value) => {
    clickSound?.play();
    socket.emit("answer", { roomId, value });
    setQuestion(null);
    setMessage("Waiting for other players...");
  };

  const shareTopCharacter = () => {
    socket.emit("shareTop", roomId);
    setTopShared(true);
  };

  const toggleMusic = () => {
    if (!bgMusic) return;
    if (musicPlaying) {
      bgMusic.pause();
      setMusicPlaying(false);
    } else {
      bgMusic.play();
      setMusicPlaying(true);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 20, fontFamily: "Inter, sans-serif", background: "#fffaf8" }}>
      <h2>DEI Change Agent Quiz – Player</h2>

      {!joined ? (
        <div>
          <h3>Enter your name:</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <h3>Choose your avatar:</h3>
          {avatars.map((a, i) => (
            <img
              key={i}
              src={a}
              style={{ width: 60, height: 60, borderRadius: "50%", margin: 5, border: avatar === a ? "2px solid black" : "none", cursor: "pointer" }}
              onClick={() => setAvatar(a)}
            />
          ))}
          <div>
            <button onClick={joinRoom} style={{ marginTop: 10 }}>Join Room</button>
          </div>
        </div>
      ) : question ? (
        <div>
          <div id="progress">Question {question.index} of {question.total}</div>
          <div id="question" style={{ fontSize: "1.5em", margin: "20px 0" }}>{question.text}</div>
          <div id="buttons">
            {["Strongly Disagree", "Disagree", "Agree", "Strongly Agree"].map((lbl, i) => (
              <button
                key={i}
                className={`btn${i+1}`}
                style={{ margin: 10, padding: "20px 40px", borderRadius: 12, color: "white", fontSize: "1.2em", border: "none" }}
                onClick={() => answerQuestion(i)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      ) : results ? (
        <div>
          <h3>Quiz Complete!</h3>
          <div id="result-title">
            Top Character: {results.topTwo[0][0]} ({results.topTwo[0][1].toFixed(2)}) | 
            Secondary: {results.topTwo[1][0]} ({results.topTwo[1][1].toFixed(2)}) | 
            Hybrid: {results.hybrid || "Unique Mix"} 
            {!topShared && <button onClick={shareTopCharacter}>Share My Top Character</button>}
          </div>

          {sharedList.length > 0 && (
            <div id="shared-players">
              <h4>Shared Top Characters</h4>
              {sharedList.map((p, i) => (
                <div key={i} style={{ display: "inline-block", margin: 10, textAlign: "center" }}>
                  <img src={p.img} style={{ width: 60, height: 60, borderRadius: "50%" }} />
                  <div>{p.name}</div>
                  <div style={{ fontWeight: "bold" }}>{p.topCharacter}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p>{message}</p>
      )}

      <div id="musicControls" style={{ marginTop: 15 }}>
        <button onClick={toggleMusic}>{musicPlaying ? "Mute Music" : "Play Music"}</button>
      </div>
      <audio id="bgMusic" loop src="/music/background.mp3"></audio>
      <audio id="clickSound" src="/music/click.mp3"></audio>
    </div>
  );
}
