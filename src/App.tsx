import React, { useEffect, useRef, useState } from "react";
import { Link, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { gsap } from "gsap";
import AddPage from "./pages/Add";
import SubtractPage from "./pages/Subtract";
import MultiplyPage from "./pages/Multiply";
import DividePage from "./pages/Divide";

type Operation = "add" | "subtract" | "multiply" | "divide";

const pages: Array<{
  id: Operation;
  symbol: string;
  title: string;
  description: string;
}> = [
  { id: "add", symbol: "+", title: "덧셈 페이지", description: "두 숫자의 합을 계산합니다." },
  { id: "subtract", symbol: "-", title: "뺄셈 페이지", description: "두 숫자의 차를 계산합니다." },
  { id: "multiply", symbol: "×", title: "곱셈 페이지", description: "두 숫자의 곱을 계산합니다." },
  {
    id: "divide",
    symbol: "÷",
    title: "나눗셈 페이지",
    description: "두 숫자의 나눗셈을 계산합니다.",
  },
];

const routeTitle = {
  add: "덧셈 계산",
  subtract: "뺄셈 계산",
  multiply: "곱셈 계산",
  divide: "나눗셈 계산",
} as const;

function HomePage() {
  return (
    <section className="home-grid">
      <div className="home-header">
        <h2>연산 선택</h2>
        <p>원하는 연산 버튼을 눌러 해당 달빛약속 문제 화면으로 이동하세요.</p>
      </div>
      <div className="home-button-grid">
        {pages.map(item => (
          <Link key={item.id} to={`/${item.id}`} className="home-nav-button">
            <span className="home-nav-symbol">{item.symbol}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OperationPage() {
  const params = useParams<{ operation: string }>();
  const operation = params.operation as Operation | undefined;
  const navigate = useNavigate();

  if (!operation || !(operation in routeTitle)) {
    return (
      <section className="not-found-panel">
        <h2>페이지를 찾을 수 없습니다.</h2>
        <button className="secondary-button" onClick={() => navigate("/")}>
          홈으로
        </button>
      </section>
    );
  }
}

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
