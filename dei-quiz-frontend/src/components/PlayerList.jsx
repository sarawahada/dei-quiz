import React from "react";

export default function PlayerList({ players }) {
  return (
    <div className="flex flex-wrap justify-center mt-4">
      {players.map((p,i)=>(
        <div key={i} className="bg-white shadow-md rounded-xl m-2 p-2 w-24 text-center">
          <img src={p.img} alt={p.name} className="w-14 h-14 rounded-full mx-auto"/>
          <div className="text-sm mt-1">{p.name}</div>
        </div>
      ))}
    </div>
  );
}
