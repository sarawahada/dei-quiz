import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { io } from "socket.io-client";

const socket = io();

export default function HostPage() {
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("roomCreated", (id) => {
      setRoomId(id);
    });

    socket.on("updatePlayers", (list) => {
      setPlayers(list);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("updatePlayers");
    };
  }, []);

  const createRoom = () => {
    socket.emit("createRoom");
  };

  const startQuiz = () => {
    socket.emit("hostStart", roomId);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      {!roomId ? (
        <button onClick={createRoom}>Create Room</button>
      ) : (
        <div>
          <h3>Scan this QR code to join:</h3>
          <QRCodeCanvas value={`https://dei-quiz1.onrender.com/join/${roomId}`} />
          <p>Room ID: {roomId}</p>

          <h4>Players:</h4>
          <ul>
            {players.map((p, i) => (
              <li key={i}>{p.name}</li>
            ))}
          </ul>

          {players.length > 0 && (
            <button onClick={startQuiz}>Start Quiz</button>
          )}
        </div>
      )}
    </div>
  );
}
