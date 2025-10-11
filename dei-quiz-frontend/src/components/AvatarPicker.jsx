import React, { useState } from "react";

export default function AvatarPicker({ avatars, onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-wrap justify-center mb-6">
      {avatars.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Avatar ${i+1}`}
          className={`w-20 h-20 rounded-full m-2 cursor-pointer transition-transform duration-200 shadow-md ${selected===src ? "border-4 border-purple-400 shadow-lg" : ""}`}
          onClick={() => {
            setSelected(src);
            onSelect(src);
          }}
        />
      ))}
    </div>
  );
}
