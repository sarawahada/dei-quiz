import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io();

export default function PlayerPage() {
  const { roomId } = useParams(); // get roomId from URL
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("Waiting for host...");
  const [question, setQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [sharedList, setSharedList] = useState([]);
  const [topShared, setTopShared] = useState(false);

  useEffect(() => {
    socket.on("question", (q) => {
      setQuestion(q);
      setMessage("");
    });

    socket.on("showResults", (res) => {
      setResults(res);
      setQuestion(null);
      setMessage("");
    });

    socket.on("updateShared", (list) => setSharedList(list));

    return () => {
      socket.off("question");
      socket.off("showResults");
      socket.off("updateShared");
    };
  }, []);

  const joinRoom = () => {
    if (!name) return;
    socket.emit("join", { roomId, name, img: "" });
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
      <div style={{ textAlign: "center", padding: 20 }}>
        <h3>Enter your name:</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      {question ? (
        <>
          <h3>Question {question.index}/{question.total}</h3>
          <p>{question.text}</p>
          {[1, 2, 3, 4].map((v) => (
            <button key={v} onClick={() => answerQuestion(v)}>
              Option {v}
            </button>
          ))}
        </>
      ) : results ? (
        <div>
          <h3>Your Results:</h3>
          <p>Top Character: {results.topTwo[0][0]}</p>
          <p>Secondary: {results.topTwo[1][0]}</p>
          {results.hybrid && <p>Hybrid: {results.hybrid}</p>}

          {!topShared && (
            <button onClick={shareTopCharacter}>Share My Top Character</button>
          )}

          {sharedList.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4>Shared Top Characters:</h4>
              <ul>
                {sharedList.map((p, i) => (
                  <li key={i}>{p.name}: {p.topCharacter}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}
