import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Brand from "./pages/Brand";

const App = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden antialiased bg-white text-slate-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/brands/:brandName" element={<Brand />} />
      </Routes>
    </div>
  );
};

export default App;
