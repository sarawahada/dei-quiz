import React from "react";

export default function SharedCharacters({ shared }) {
  if(shared.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Shared Top Characters</h3>
      <div className="flex flex-wrap justify-center">
        {shared.map((p,i)=>(
          <div key={i} className="bg-white rounded-xl shadow-md p-2 m-2 w-24 text-center">
            <img src={p.img} alt={p.name} className="w-14 h-14 rounded-full mx-auto mb-1"/>
            <div className="text-sm font-medium">{p.name}</div>
            <div className="text-sm font-bold">{p.topCharacter}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
