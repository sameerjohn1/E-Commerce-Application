import React from "react";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Booking from "./pages/Booking";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Add />} />
        <Route path="/list" element={<List />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>
    </>
  );
};

export default App;
