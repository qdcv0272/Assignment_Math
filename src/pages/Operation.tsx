import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { Operation } from "../types/pageType";

const routeTitle = {
  add: "덧셈 계산",
  subtract: "뺄셈 계산",
  multiply: "곱셈 계산",
  divide: "나눗셈 계산",
} as const;

export default function OperationPage() {
  const params = useParams<{ operation: string }>();
  const operation = params.operation as Operation | undefined;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (operation && operation in routeTitle) {
      // 유효한 operation이 URL에 있을 때만 경로를 맞춤
      const target = `/${operation}`;
      if (location.pathname !== target) navigate(target, { replace: true });
    }
  }, [operation, location.pathname, navigate]);

  if (!operation || !(operation in routeTitle)) {
    // 유효하지 않은 URL에 있을 때는 404
    return (
      <section className="not-found-panel">
        <h2>페이지를 찾을 수 없습니다.</h2>
        <button className="secondary-button" onClick={() => navigate("/")}>
          홈으로
        </button>
      </section>
    );
  }

  return null;
}
