import React from "react";

export default function QuestionCard({ question, socket }) {
  const labels = ["Strongly Disagree","Disagree","Agree","Strongly Agree"];
  const colors = ["bg-pink-400","bg-yellow-300","bg-green-400","bg-blue-400"];

  const handleAnswer = (value) => {
    socket.emit("answer",{ question: question.text, value });
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6 mb-4 transition-all">
      <p className="text-lg mb-4">{question.text}</p>
      <div className="flex flex-wrap justify-center">
        {labels.map((lbl,i)=>(
          <button
            key={i}
            className={`m-2 px-6 py-3 rounded-2xl text-white font-medium ${colors[i]} shadow-md hover:scale-105 transition-transform`}
            onClick={() => handleAnswer(i)}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}
