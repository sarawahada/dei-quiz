import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io();

export default function PlayerPage() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [img, setImg] = useState("");
  const [joined, setJoined] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [results, setResults] = useState(null);

  useEffect(() => {
    socket.on("question", ({ text, index, total }) => {
      setCurrentQuestion(text);
      setQuestionIndex(index);
      setTotalQuestions(total);
    });

    socket.on("showResults", (data) => setResults(data));

    return () => socket.off();
  }, []);

  const joinRoom = () => {
    if (!name) return alert("Enter your name");
    socket.emit("join", { roomId, name, img });
    setJoined(true);
  };

  const submitAnswer = (value) => {
    socket.emit("answer", { roomId, value });
    setCurrentQuestion(null);
  };

  const shareTop = () => socket.emit("shareTop", roomId);

  if (!joined)
    return (
      <div className="p-6 text-center">
        <h3>Enter your name to join room {roomId}</h3>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 m-2"
        />
        <button onClick={joinRoom} className="btn">
          Join
        </button>
      </div>
    );

  if (results)
    return (
      <div className="p-6 text-center">
        <h3>Results:</h3>
        <pre>{JSON.stringify(results, null, 2)}</pre>
        <button onClick={shareTop} className="btn mt-2">
          Share Top Character
        </button>
      </div>
    );

  if (currentQuestion)
    return (
      <div className="p-6 text-center">
        <h4>
          Question {questionIndex}/{totalQuestions}
        </h4>
        <p>{currentQuestion}</p>
        <div className="mt-4">
          {[1, 2, 3, 4, 5].map((v) => (
            <button key={v} onClick={() => submitAnswer(v)} className="btn m-1">
              {v}
            </button>
          ))}
        </div>
      </div>
    );

  return <div className="p-6 text-center">Waiting for next question...</div>;
}
