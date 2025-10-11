import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { io } from "socket.io-client";

const socket = io();

export default function HostPage() {
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
  socket.on("updateShared", (list) => setShared(list));
  return () => socket.off("updateShared");
}, []);

{shared.length > 0 && (
  <div>
    <h3>Players' Shared Top Characters:</h3>
    <ul>
      {shared.map((p, i) => (
        <li key={i}>
          {p.name}: {p.topCharacter}
        </li>
      ))}
    </ul>
  </div>
)}


  const createRoom = () => socket.emit("createRoom");
  const startQuiz = () => socket.emit("hostStart", roomId);

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      {!roomId ? (
        <button onClick={createRoom}>Create Room</button>
      ) : (
        <>
          <h3>Scan QR to join:</h3>
          <QRCodeCanvas value={`https://dei-quiz1.onrender.com/play/${roomId}`} size={200} />
          <p>Room ID: {roomId}</p>

          <h4>Players ({players.length}):</h4>
          <ul>{players.map((p, i) => <li key={i}>{p.name}</li>)}</ul>

          {players.length > 0 && <button onClick={startQuiz}>Start Quiz</button>}
        </>
      )}
    </div>
  );
  
}
