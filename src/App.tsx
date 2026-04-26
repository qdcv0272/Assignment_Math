import React from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import HomePage from "./pages/Home";
import AddPage from "./pages/Add";
import SubtractPage from "./pages/Subtract";
import MultiplyPage from "./pages/Multiply";
import DividePage from "./pages/Divide";
import OperationPage from "./pages/Operation";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddPage />} />
        <Route path="/subtract" element={<SubtractPage />} />
        <Route path="/multiply" element={<MultiplyPage />} />
        <Route path="/divide" element={<DividePage />} />
        <Route path="/:operation" element={<OperationPage />} />
      </Routes>
    </div>
  );
}
