import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateRoom />} />
        <Route path="/room/:roomID" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
