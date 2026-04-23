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
  { id: "divide", symbol: "÷", title: "나눗셈 페이지", description: "두 숫자의 나눗셈을 계산합니다." },
];

const routeTitle = {
  add: "덧셈 계산",
  subtract: "뺄셈 계산",
  multiply: "곱셈 계산",
  divide: "나눗셈 계산",
} as const;

const routeDescription = {
  add: "두 숫자를 더하는 화면입니다.",
  subtract: "두 숫자를 빼는 화면입니다.",
  multiply: "두 숫자를 곱하는 화면입니다.",
  divide: "두 숫자를 나누는 화면입니다.",
} as const;

const grammarItems = [
  { title: "변수 선언", detail: "변수 이름 = 값" },
  { title: "약속 정의", detail: "약속, 이름 (값) ... 반환하기" },
  { title: "보여주기", detail: "값 보여주기" },
  { title: "리스트", detail: "목록 = [1, 2, 3]" },
  { title: "조건문", detail: "만약 (조건) ..." },
  { title: "반복문", detail: "(횟수) 반복하기 ..." },
];

const sampleCode = `변수, a = 10
변수, b = 5

약속, 더하기 (x, y)
    x + y 반환하기

더하기 (a, b) 보여주기`;

function WorkspaceLayout({ pageTitle, pageDescription, problemText }: { pageTitle: string; pageDescription: string; problemText: string }) {
  const [isMenuOpen, setMenuOpen] = useState(true);
  const grammarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!grammarRef.current) return;

    gsap.to(grammarRef.current, {
      duration: 0.35,
      x: isMenuOpen ? 0 : 260,
      autoAlpha: isMenuOpen ? 1 : 0.72,
      ease: "power3.out",
    });
  }, [isMenuOpen]);

  return (
    <>
      <div className="workspace-layout">
        <main className="workspace-main">
          <section className="problem-panel">
            <div className="problem-header">
              <span className="label">문제</span>
              <h2>{pageTitle}</h2>
            </div>
            <p>{problemText}</p>
          </section>

          <section className="editor-panel">
            <div className="editor-header">
              <div>
                <p className="editor-label">코드 작성 영역</p>
                <p className="editor-subtitle">달빛약속 문법으로 코드를 작성해보세요.</p>
              </div>
            </div>
            <pre className="code-block">{sampleCode}</pre>
          </section>

          <div className="action-row">
            <button className="primary-button">시작</button>
            <button className="secondary-button">초기화</button>
          </div>
        </main>

        <aside className="grammar-panel" ref={grammarRef}>
          <div className="grammar-header">
            <div>
              <p className="grammar-label">달빛약속 문법</p>
              <p className="grammar-info">사용 가능한 문법을 보관하는 공간입니다.</p>
            </div>
            <button className="menu-toggle-button" onClick={() => setMenuOpen((open: boolean) => !open)}>
              {isMenuOpen ? "닫기" : "열기"}
            </button>
          </div>
          <div className="grammar-list">
            {grammarItems.map((item) => (
              <article key={item.title} className="grammar-item">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <section className="page-intro">
        <p>{pageDescription}</p>
      </section>
    </>
  );
}

function HomePage() {
  return (
    <section className="home-grid">
      <div className="home-header">
        <h2>연산 선택</h2>
        <p>원하는 연산 버튼을 눌러 해당 달빛약속 문제 화면으로 이동하세요.</p>
      </div>
      <div className="home-button-grid">
        {pages.map((item) => (
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

  return <WorkspaceLayout pageTitle={routeTitle[operation]} pageDescription={routeDescription[operation]} problemText={`달빛약속을 사용해 ${routeTitle[operation]}을 구현하고, 결과를 보여주세요.`} />;
}

export default function App() {
  return (
    <div className="app-root">
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
