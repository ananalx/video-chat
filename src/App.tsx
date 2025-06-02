import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateRoom from "./screens/createRoom/CreateRoom";
import Room from "./screens/room/Room";
import ErrorBoundary from "./utils/ErrorBoundary";
// import { Switch } from "@mui/material";
import { View } from "./library";
import "./index.css";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "motion/react";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const animControls = useAnimation();

  useEffect(() => {
    if (darkMode) {
      animControls.start("dark");
      return;
    }
    animControls.start("light");
  }, [darkMode]);

  return (
    <motion.div
      variants={{
        dark: { backgroundColor: "#000000" },
        light: { backgroundColor: "#F8F8FF" },
      }}
      initial="light"
      animate={animControls}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<CreateRoom />} />
            <Route path="/room/:roomID" element={<Room />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <View
        style={{
          position: "absolute",
          bottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          left: "50px",
          cursor: "pointer",
        }}
        onClick={() => setDarkMode((p) => !p)}
      >
        {darkMode ? (
          <LightModeIcon sx={{ fontSize: 40, color: "white" }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 40, color: "Black" }} />
        )}
      </View>
    </motion.div>
  );
}

export default App;
