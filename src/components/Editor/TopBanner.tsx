import React from "react";

type Props = {
  title: string;
  label?: string;
};

export default function TopBanner({ title, label = "문제" }: Props) {
  return (
    <header className="top-banner">
      <div>
        <span className="top-label">{label}</span>
        <h2>{title}</h2>
      </div>
    </header>
  );
}
