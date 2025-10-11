// src/HostPage.jsx
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import socket from "./socket";

export default function HostPage() {
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Listen to backend events
    socket.on("roomCreated", (id) => setRoomId(id));
    socket.on("updatePlayers", (list) => setPlayers(list));

    // Cleanup listeners on unmount
    return () => {
      socket.off("roomCreated");
      socket.off("updatePlayers");
    };
  }, []);

  const createRoom = () => {
    if (!roomId) socket.emit("createRoom");
  };

  const startQuiz = () => {
    if (roomId) socket.emit("hostStart", roomId);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Host Page</h2>

      {!roomId ? (
        <button onClick={createRoom}>Create Room</button>
      ) : (
        <div>
          <p>Players Joined: {players.length}</p>
          
          {/* Only render QR code if roomId exists */}
          {roomId && (
            <QRCodeCanvas
              value={`https://dei-quiz1.onrender.com/play/${roomId}`}
              size={200}
            />
          )}

          <div style={{ marginTop: 20 }}>
            <button onClick={startQuiz}>Start Quiz</button>
          </div>
        </div>
      )}
    </div>
  );
}

