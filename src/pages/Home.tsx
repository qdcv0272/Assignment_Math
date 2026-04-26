import React from "react";
import { Link } from "react-router-dom";
import type { Operation } from "../types/pageType";

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

export default function HomePage() {
  return (
    <section className="home-grid">
      <div className="home-header">
        <h2>저학년들을 위한 달빛약속 코딩 학습</h2>
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
