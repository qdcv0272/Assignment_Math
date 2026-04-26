import React from "react";

type TopBannerProps = {
  title: string;
  label?: string;
};

export default function TopBanner({ title, label = "문제" }: TopBannerProps) {
  return (
    <header className="top-banner">
      <div>
        <span className="top-label">{label}</span>
        <h2>{title}</h2>
      </div>
    </header>
  );
}
