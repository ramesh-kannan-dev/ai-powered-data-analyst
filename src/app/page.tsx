"use client";

import { ArrowRight, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 premium-bg">
      
      <div className="z-10 max-w-4xl w-full flex flex-col items-center text-center space-y-12">
        
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           className="space-y-4"
        >
          <div className="flex justify-center mb-6">
              <div className="p-4 bg-[#1c1c1e] rounded-[24px]">
                 <Database size={40} className="text-white" />
              </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.04em] leading-[1.05] text-[#f5f5f7]">
             Profound Intelligence. <br/> Effortlessly Rendered.
          </h1>
          
          <p className="text-[#86868b] text-xl max-w-2xl mx-auto leading-[1.4] font-medium pt-2 tracking-tight">
            An advanced analysis engine that ingests raw datasets and delivers statistically precise models, visualizations, and automated reports.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
           className="pt-6 flex gap-4"
        >
            <button 
              onClick={() => router.push('/dashboard')}
              className="apple-button apple-button-primary px-8 py-3.5 text-[17px] tracking-tight flex items-center hover:bg-blue-600"
            >
              Enter Workspace
            </button>
            <button 
              className="apple-button px-8 py-3.5 text-[17px] tracking-tight flex items-center bg-[#1c1c1e] hover:bg-[#2c2c2e]"
            >
              View Documentation <ArrowRight className="ml-2 w-4 h-4 text-[#86868b]" />
            </button>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 0.4 }}
           className="mt-20 border-t border-[#38383a] w-full pt-12 flex justify-between text-left grid grid-cols-1 md:grid-cols-3 gap-8"
        >
           {[
               { t: "Automated Cleansing", d: "Instantly impute anomalies and calculate distributions." },
               { t: "Generative Reasoning", d: "LLM-driven analysis synthesizes immediate business logic." },
               { t: "Temporal Extraction", d: "Heatmaps, distributions, and vectors rendered natively." }
           ].map((k, v) => (
               <div key={v}>
                   <h3 className="text-[#f5f5f7] font-semibold text-[15px] mb-1">{k.t}</h3>
                   <p className="text-[#86868b] text-[15px] leading-relaxed">{k.d}</p>
               </div>
           ))}
        </motion.div>
        
      </div>
    </main>
  );
}
