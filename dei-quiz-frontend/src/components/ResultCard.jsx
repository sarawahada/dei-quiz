import React, { useEffect } from "react";
import Chart from "chart.js/auto";

export default function ResultCard({ result, socket }) {
  useEffect(() => {
    const ctx = document.getElementById("playerChart").getContext("2d");
    new Chart(ctx, {
      type: "radar",
      data: {
        labels: Object.keys(result.characters),
        datasets: [{
          label: "Your Archetype Strengths",
          data: Object.values(result.characters),
          backgroundColor: Object.keys(result.characters).map(l=>{
            const colors = { Equalizer:"rgba(0,123,255,0.6)", Bridgebuilder:"rgba(0,200,100,0.6)", Catalyst:"rgba(255,205,0,0.6)", "Devil Advocate":"rgba(255,50,50,0.6)" };
            return colors[l] || "rgba(200,200,200,0.5)";
          }),
          borderColor: Object.keys(result.characters).map(l=>{
            const colors = { Equalizer:"rgba(0,123,255,1)", Bridgebuilder:"rgba(0,200,100,1)", Catalyst:"rgba(255,205,0,1)", "Devil Advocate":"rgba(255,50,50,1)" };
            return colors[l] || "#888";
          }),
          borderWidth:2,
          pointBackgroundColor:Object.keys(result.characters).map(l=>"#fff")
        }]
      },
      options:{ scales:{ r:{ beginAtZero:true, suggestedMax:4, ticks:{stepSize:1} } }, plugins:{legend:{display:false}} }
    });
  }, [result]);

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-semibold text-lg mb-2">
        Top Character: {result.topTwo[0][0]} ({result.topTwo[0][1].toFixed(2)}) | 
        Secondary: {result.topTwo[1][0]} ({result.topTwo[1][1].toFixed(2)}) | 
        Hybrid: {result.hybrid || "Unique Mix"}
        <button className="ml-3 px-3 py-1 bg-purple-400 text-white rounded-md hover:bg-purple-500" onClick={()=>socket.emit("shareTop")}>
          Share
        </button>
      </h3>
      <canvas id="playerChart" className="my-4"></canvas>
      <ul className="text-gray-600 mt-2">
        {Object.entries(result.characters).map(([k,v]) => (
          <li key={k}>{k}: {v.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
