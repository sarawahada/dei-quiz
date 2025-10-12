import { Routes, Route } from "react-router-dom";
import HostPage from "./HostPage";
import PlayerPage from "./PlayerPage";
import CharacterPage from "./CharacterPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HostPage />} />
      <Route path="/play/:roomId" element={<PlayerPage />} />
      <Route path="/character/:name" element={<CharacterPage />} />
    </Routes>
  );
}
