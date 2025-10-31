import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DistrictView from "./pages/DistrictView";
import CompareDistricts from "./pages/CompareDistricts";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/district/:name" element={<DistrictView />} />
        <Route path="/compare" element={<CompareDistricts />} />
      </Routes>
    </Router>
  );
}

export default App;
