import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {QRCodeCanvas} from "qrcode.react";

// --- Create a single socket instance for the host ---
const socket = io();

export default function HostPage() {
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    // Listen for room creation
    socket.on("roomCreated", (id) => {
      setRoomId(id);
    });

    // Listen for player updates
    socket.on("updatePlayers", (playersList) => {
      setPlayers(playersList);
    });

    // Cleanup on unmount
    return () => {
      socket.off("roomCreated");
      socket.off("updatePlayers");
    };
  }, []);

  const createRoom = () => {
    if (!roomId) {
      socket.emit("createRoom");
    }
  };

  const startQuiz = () => {
    if (roomId) {
      socket.emit("hostStart", roomId);
      setQuizStarted(true);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Host Page</h2>

      {!roomId && (
        <button onClick={createRoom}>Create Room</button>
      )}

      {roomId && (
        <div>
          <p>Room ID: {roomId}</p>
            <QRCode value={`https://dei-quiz1.onrender.com/player?room=${roomId}`} />
          <h3>Players Joined:</h3>
          <ul>
            {players.map((p, idx) => (
              <li key={idx}>{p.name}</li>
            ))}
          </ul>
          {!quizStarted && <button onClick={startQuiz}>Start Quiz</button>}
          {quizStarted && <p>Quiz Started!</p>}
        </div>
      )}
    </div>
  );
}
