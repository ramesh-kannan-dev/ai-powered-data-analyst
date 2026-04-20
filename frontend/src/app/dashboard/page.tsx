"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const API_BASE = "https://ai-powered-data-analyst-8bsv.onrender.com";

// Charts (SSR disabled)
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A'];

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [fileId, setFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed");
    }
  };

  // 🚀 FIXED UPLOAD FUNCTION
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${API_BASE}/api/dataset/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("UPLOAD RESPONSE:", res.data);

      if (!res.data?.file_id) {
        throw new Error("Invalid backend response");
      }

      setSummary(res.data.summary);
      setFileId(res.data.file_id);

      await loadAnalysis(res.data.file_id);
      fetchHistory();

    } catch (err: any) {
      console.error("UPLOAD ERROR:", err);

      if (err.response) {
        alert(err.response.data?.detail || "Backend error");
      } else {
        alert("Upload failed. Check backend.");
      }
    } finally {
      setUploading(false);
    }
  };

  // 🚀 LOAD ANALYSIS
  const loadAnalysis = async (id: string) => {
    setLoading(true);

    try {
      const [insightRes, chartRes] = await Promise.all([
        axios.get(`${API_BASE}/api/analysis/${id}/insights`),
        axios.get(`${API_BASE}/api/analysis/${id}/charts`)
      ]);

      setInsights(insightRes.data.insights);
      setCharts(chartRes.data.charts);

    } catch (err) {
      console.error("Analysis fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 text-white">

      <h1 className="text-2xl font-bold mb-6">AI Data Analyst Dashboard</h1>

      {/* Upload */}
      {!summary && (
        <div className="border p-6 rounded-lg">

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) setFile(e.target.files[0]);
            }}
          />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="ml-4 px-4 py-2 bg-blue-500 rounded"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {/* Dashboard */}
      {summary && (
        <div className="mt-10 space-y-6">

          <h2 className="text-xl">Summary</h2>
          <pre>{JSON.stringify(summary, null, 2)}</pre>

          {loading && <p>Loading analysis...</p>}

          {/* Insights */}
          {insights && (
            <div>
              <h2 className="text-xl mt-6">Insights</h2>
              <pre>{JSON.stringify(insights, null, 2)}</pre>
            </div>
          )}

          {/* Charts */}
          {charts?.bar && (
            <div className="h-[300px]">
              <h2 className="text-xl mb-4">Bar Chart</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.bar.data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0A84FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {charts?.pie && (
            <div className="h-[300px]">
              <h2 className="text-xl mb-4">Pie Chart</h2>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.pie.data} dataKey="value" nameKey="name">
                    {charts.pie.data.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
