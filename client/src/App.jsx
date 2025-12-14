import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Workspace from "./pages/Workspace";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="w-screen min-h-screen bg-white dark:bg-[#0d0d0f] transition-colors duration-300 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={<Workspace/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
