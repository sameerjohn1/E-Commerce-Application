import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Brand from "./pages/Brand";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import Watch from "./pages/Watch";
import Contact from "./pages/Contact";

const App = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden antialiased bg-white text-slate-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/brands/:brandName" element={<Brand />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/watches" element={<Watch />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
};

export default App;
