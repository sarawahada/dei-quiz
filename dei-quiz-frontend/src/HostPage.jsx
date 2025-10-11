import React, { useState } from "react";
import QRCode from "react-qr-code";
import { v4 as uuidv4 } from "uuid";

export default function HostPage() {
  const [roomId, setRoomId] = useState(null);

  const createRoom = () => {
    const id = uuidv4();
    setRoomId(id);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      {!roomId ? (
        <button onClick={createRoom}>Create Room</button>
      ) : (
        <div>
          <h3>Scan this QR code to join:</h3>
          <QRCode value={`${window.location.origin}/play/${roomId}`} size={200} />
          <p>Room ID: {roomId}</p>
        </div>
      )}
    </div>
  );
}
