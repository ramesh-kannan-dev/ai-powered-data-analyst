"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, File as FileIcon, BarChart3, Database, Download, CheckCircle2, ChevronRight, Clock, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import dynamic from 'next/dynamic';
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const ScatterChart = dynamic(() => import('recharts').then(mod => mod.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import('recharts').then(mod => mod.Scatter), { ssr: false });
const ZAxis = dynamic(() => import('recharts').then(mod => mod.ZAxis), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#64D2FF'];

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('bar');
  const [loadingContext, setLoadingContext] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     fetchHistory();
  }, []);

  const fetchHistory = async () => {
      try {
          const res = await axios.get('http://localhost:8000/api/history');
          setHistory(res.data);
      } catch(err) {
          console.error("Failed to fetch history");
      }
  }

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/api/dataset/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadAnalysisResults(res.data.summary, res.data.file_id);
      fetchHistory(); // Refresh
    } catch (err: any) {
      alert("Error parsing file.");
    } finally {
      setUploading(false);
    }
  };

  const loadPastAnalysis = async (item: any) => {
      loadAnalysisResults({
          rows: item.rows,
          columns: item.columns,
          quality_score: item.quality_score,
          missing_values: {} // Mocked since not stored deeply in basic model
      }, item.id);
  }

  const loadAnalysisResults = (summaryData: any, id: string) => {
      setSummary(summaryData);
      setFileId(id);
      setInsights(null);
      setCharts(null);
      
      setLoadingContext(true);
      Promise.all([
        axios.get(`http://localhost:8000/api/analysis/${id}/insights`),
        axios.get(`http://localhost:8000/api/analysis/${id}/charts`)
      ]).then(([insightsRes, chartsRes]) => {
          setInsights(insightsRes.data.insights);
          setCharts(chartsRes.data.charts);
      }).catch(err => {
          console.error("Analysis block failed");
      }).finally(() => {
          setLoadingContext(false);
      });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden tracking-tight premium-bg">
      
      {/* Sidebar */}
      <aside className="w-full md:w-[280px] bg-[#1c1c1e] border-r border-[#38383a] flex flex-col h-screen shrink-0">
         <div className="p-6 border-b border-[#38383a] flex items-center space-x-3">
            <div className="p-2 bg-[#2c2c2e] rounded-xl"><Database size={20} className="text-[#0A84FF]" /></div>
            <span className="font-semibold text-[17px]">Nexus Data</span>
         </div>
         
         <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
             <div className="flex items-center justify-between mb-4 px-2">
                 <h4 className="text-xs uppercase font-semibold text-[#86868b] tracking-wider">Analysis History</h4>
             </div>
             
             <ul className="space-y-1">
                 <li>
                     <button onClick={() => { setSummary(null); setFile(null); }} className={`w-full flex items-center px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${!summary ? 'bg-[#0A84FF] text-white' : 'text-[#f5f5f7] hover:bg-[#2c2c2e]'}`}>
                         <UploadCloud size={16} className="mr-3 shrink-0" />
                         <span>New Analysis</span>
                     </button>
                 </li>
                 
                 {history.map((item, idx) => (
                    <li key={idx} className="mt-1">
                         <button onClick={() => loadPastAnalysis(item)} className={`w-full flex items-center px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${fileId === item.id ? 'bg-[#2c2c2e] text-[#f5f5f7]' : 'text-[#86868b] hover:bg-[#2c2c2e] hover:text-[#f5f5f7]'}`}>
                             <Clock size={16} className="mr-3 shrink-0" />
                             <span className="truncate text-left">{item.filename}</span>
                         </button>
                    </li>
                 ))}
             </ul>
         </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto h-screen w-full relative z-10">
          <div className="max-w-[1200px] mx-auto p-8 md:p-12 space-y-8">
              
              <AnimatePresence mode="wait">
                  {!summary ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full max-w-2xl mx-auto mt-20"
                      >
                         <h1 className="text-3xl font-bold mb-8 text-center text-[#f5f5f7]">Initialize Data Feed</h1>
                         <div className="apple-panel p-10 flex flex-col items-center justify-center border-dashed border-[#38383a]">
                             <div className="p-5 bg-[#2c2c2e] rounded-full mb-6">
                                <Box size={32} className="text-[#0A84FF]" />
                             </div>
                             
                             <h2 className="text-[17px] font-semibold mb-2">Drop Dataset Here</h2>
                             <p className="text-[#86868b] text-[15px] mb-8 text-center max-w-sm">
                                Supported files: CSV, XLSX. All payloads are processed securely and locally.
                             </p>

                             <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { if(e.target.files) setFile(e.target.files[0]) }} accept=".csv, .xlsx, .xls" />
                             
                             <div className="flex gap-4">
                                 <button onClick={() => fileInputRef.current?.click()} className="apple-button px-6 py-2.5 text-[15px]">
                                     {file ? file.name : "Select File"}
                                 </button>
                                 {file && (
                                     <button onClick={handleUpload} disabled={uploading} className="apple-button apple-button-primary px-6 py-2.5 text-[15px] disabled:opacity-50">
                                        {uploading ? "Parsing..." : "Analyze"}
                                     </button>
                                 )}
                             </div>
                         </div>
                      </motion.div>
                  ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                      >
                          <header className="flex justify-between items-end pb-6 border-b border-[#38383a]">
                              <div>
                                 <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                                 <p className="text-[#86868b] text-[15px] mt-1">File ID: {fileId}</p>
                              </div>
                              <button onClick={() => window.open(`http://localhost:8000/api/report/${fileId}/download`)} className="apple-button px-5 py-2.5 flex items-center text-[13px] bg-[#2c2c2e]">
                                  <Download size={14} className="mr-2" /> Export PDF
                              </button>
                          </header>

                          {/* KPIs */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {[
                                  { label: "Integrity Setup", value: `${summary.quality_score}/100` },
                                  { label: "Detected Domain", value: summary.dataset_type || "Generic" },
                                  { label: "Observations", value: summary.rows?.toLocaleString() },
                                  { label: "Variables", value: summary.columns?.toLocaleString() },
                                  { label: "Anomalies", value: summary.missing_values ? Object.values(summary.missing_values).reduce((a:any,b:any)=>a+b,0) : 0 }
                              ].map((kpi, idx) => (
                                  <div key={idx} className="apple-panel p-5">
                                      <h4 className="text-[#86868b] text-[12px] font-semibold uppercase tracking-wider mb-2">{kpi.label}</h4>
                                      <p className="text-3xl font-semibold tracking-tight">{kpi.value}</p>
                                  </div>
                              ))}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Insights Sidebar */}
                              <div className="col-span-1 space-y-6">
                                  <div className="apple-panel p-6 h-full min-h-[400px]">
                                      <h3 className="font-semibold text-[17px] mb-6 border-b border-[#38383a] pb-3">AI Synthesis</h3>

                                      {loadingContext ? (
                                           <div className="space-y-4 animate-pulse">
                                              <div className="h-2.5 bg-[#2c2c2e] rounded-full w-3/4"></div>
                                              <div className="h-2.5 bg-[#2c2c2e] rounded-full w-full"></div>
                                              <div className="h-2.5 bg-[#2c2c2e] rounded-full w-5/6"></div>
                                          </div>
                                      ) : insights ? (
                                          <div className="space-y-6">
                                              <div>
                                                  <h4 className="text-[13px] font-semibold text-[#86868b] mb-3">Core Insights</h4>
                                                  <ul className="space-y-4">
                                                      {insights.business_insights?.map((item:string, i:number) => (
                                                          <li key={i} className="flex text-[14px] leading-relaxed text-[#f5f5f7]">
                                                              <div className="mt-1 mr-3 w-[6px] h-[6px] rounded-full bg-[#0A84FF] shrink-0"></div>
                                                              <span>{item}</span>
                                                          </li>
                                                      ))}
                                                  </ul>
                                              </div>
                                              <div className="pt-4">
                                                  <h4 className="text-[13px] font-semibold text-[#86868b] mb-3">Recommendations</h4>
                                                  <ul className="space-y-2 text-[14px] text-[#86868b] list-disc pl-4 marker:text-[#38383a]">
                                                      {insights.recommendations?.map((item:string, i:number) => (
                                                          <li key={i}>{item}</li>
                                                      ))}
                                                  </ul>
                                              </div>
                                              
                                              {summary.ml_model && (
                                                  <div className="pt-4 border-t border-[#38383a]">
                                                      <h4 className="text-[13px] font-semibold text-[#86868b] mb-3">ML Engine</h4>
                                                      <div className="bg-[#2c2c2e] p-3 rounded-xl border border-[#38383a] text-[13px]">
                                                          <p className="text-[#f5f5f7] mb-1"><span className="text-[#0A84FF]">Model:</span> {summary.ml_model.model_type}</p>
                                                          <p className="text-[#86868b] mb-1">Targeting <span className="text-white">{summary.ml_model.target}</span> via <span className="text-white">{summary.ml_model.predictor}</span></p>
                                                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#38383a]">
                                                              <span className="text-[#0A84FF]">R² Score</span>
                                                              <span className="font-mono text-white">{summary.ml_model.r2_score}</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              )}
                                          </div>
                                      ) : (
                                          <p className="text-[#86868b] text-[14px]">Synthesis data unavailable.</p>
                                      )}
                                  </div>
                              </div>

                              {/* Multi-Chart View */}
                              <div className="col-span-1 lg:col-span-2">
                                  <div className="apple-panel p-6 h-[500px] flex flex-col">
                                      <div className="flex justify-between items-center mb-6">
                                          <h3 className="font-semibold text-[17px]">Data Vectors</h3>
                                          <div className="flex bg-[#2c2c2e] p-1 rounded-[10px]">
                                             {['bar', 'line', 'pie', 'heatmap'].map((t) => (
                                                 <button 
                                                    key={t}
                                                    onClick={() => setActiveTab(t)}
                                                    className={`px-3 py-1 text-[13px] font-medium rounded-md capitalize transition-colors ${activeTab === t ? 'bg-[#48484a] text-white shadow-sm' : 'text-[#86868b] hover:text-[#f5f5f7]'}`}
                                                 >
                                                     {t}
                                                 </button>
                                             ))}
                                          </div>
                                      </div>
                                      
                                      <div className="flex-1 w-full bg-[#151516] rounded-xl p-4 border border-[#2c2c2e]">
                                          {charts && charts[activeTab] ? (
                                              <ResponsiveContainer width="100%" height="100%">
                                                 {activeTab === 'bar' ? (
                                                     <BarChart data={charts.bar.data} margin={{ top: 10, right: 10, left: -20, bottom: 0}}>
                                                        <defs>
                                                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.8}/>
                                                                <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.2}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="name" stroke="#86868b" tick={{fill: '#86868b', fontSize: 12}} axisLine={false} tickLine={false} />
                                                        <YAxis stroke="#86868b" tick={{fill: '#86868b', fontSize: 12}} axisLine={false} tickLine={false} />
                                                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid #38383a', borderRadius: '12px', color: '#f5f5f7' }}/>
                                                        <Bar dataKey="value" fill="url(#colorBar)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                                                     </BarChart>
                                                 ) : activeTab === 'line' ? (
                                                     <LineChart data={charts.line.data} margin={{ top: 10, right: 10, left: -20, bottom: 0}}>
                                                        <defs>
                                                            <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#30D158" stopOpacity={0.5}/>
                                                                <stop offset="95%" stopColor="#30D158" stopOpacity={0.0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="name" stroke="#86868b" tick={{fill: '#86868b', fontSize: 12}} axisLine={false} tickLine={false} />
                                                        <YAxis stroke="#86868b" tick={{fill: '#86868b', fontSize: 12}} axisLine={false} tickLine={false} />
                                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid #38383a', borderRadius: '12px', color: '#f5f5f7' }}/>
                                                        <Line type="monotone" dataKey="value" stroke="#30D158" strokeWidth={3} dot={{r: 4, fill: '#1c1c1e', strokeWidth: 2}} activeDot={{r: 6}} animationDuration={1500} />
                                                     </LineChart>
                                                 ) : activeTab === 'pie' ? (
                                                     <PieChart>
                                                        <Pie data={charts.pie.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} stroke="#1c1c1e" strokeWidth={3} animationDuration={1500}>
                                                            {charts.pie.data.map((entry:any, index:number) => (
                                                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid #38383a', borderRadius: '12px', color: '#f5f5f7' }}/>
                                                     </PieChart>
                                                 ) : (
                                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                        <XAxis type="category" dataKey="x" name="Feature X" tick={{fill: '#86868b', fontSize: 11}} axisLine={false} tickLine={false}/>
                                                        <YAxis type="category" dataKey="y" name="Feature Y" tick={{fill: '#86868b', fontSize: 11}} axisLine={false} tickLine={false}/>
                                                        <ZAxis type="number" dataKey="value" range={[100, 800]} />
                                                        <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid #38383a', borderRadius: '12px', color: '#f5f5f7' }}/>
                                                        <Scatter data={charts.heatmap} fill="#BF5AF2" animationDuration={1500} />
                                                    </ScatterChart>
                                                 )}
                                              </ResponsiveContainer>
                                          ) : (
                                              <div className="h-full flex items-center justify-center text-[#86868b]">
                                                  <p className="text-[14px]">No {activeTab} data compiled for this dataset.</p>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>

          </div>
      </main>
    </div>
  );
}
