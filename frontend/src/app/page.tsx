"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState("Loading...");

  useEffect(() => {
    fetch("https://ai-powered-data-analyst-8bsv.onrender.com")
      .then(res => res.json())
      .then(res => setData(JSON.stringify(res)))
      .catch(() => setData("❌ Backend connection failed"));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Frontend ↔ Backend Connection</h1>
      <p>{data}</p>
    </div>
  );
}
