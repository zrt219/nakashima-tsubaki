"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RagDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden text-cyan-400 font-mono">
      {/* Background/WebGL Placeholder (The hologram lives here) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <motion.div 
          className="w-[800px] h-[800px] rounded-full border border-cyan-900/30 bg-cyan-900/5 flex items-center justify-center"
          animate={{ rotate: 360, scale: [1, 1.02, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-[600px] h-[600px] rounded-full border border-cyan-700/20 bg-cyan-800/10 flex items-center justify-center border-dashed">
            <div className="text-cyan-800/60 text-sm tracking-widest font-bold">
              [ WEBGL KNOWLEDGE GRAPH HOLOGRAM ]
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Metric Tags (Absolute positioned around the open center) */}
      <motion.div
        className="absolute top-1/4 left-[35%] z-10 px-5 py-3 rounded border border-cyan-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
      >
        <span className="text-xs uppercase tracking-widest text-cyan-300/80">Corpus Health</span>
        <span className="ml-3 font-bold text-cyan-100 text-lg">99.9%</span>
      </motion.div>

      <motion.div
        className="absolute top-[30%] right-[30%] z-10 px-5 py-3 rounded border border-emerald-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.4 }}
      >
        <span className="text-xs uppercase tracking-widest text-emerald-300/80">Retrieval Latency</span>
        <span className="ml-3 font-bold text-emerald-100 text-lg">12ms</span>
      </motion.div>

      <motion.div
        className="absolute bottom-[35%] left-[30%] z-10 px-5 py-3 rounded border border-purple-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.6 }}
      >
        <span className="text-xs uppercase tracking-widest text-purple-300/80">Active Nodes</span>
        <span className="ml-3 font-bold text-purple-100 text-lg">14.2M</span>
      </motion.div>

      <motion.div
        className="absolute bottom-[40%] right-[35%] z-10 px-5 py-3 rounded border border-amber-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.8 }}
      >
        <span className="text-xs uppercase tracking-widest text-amber-300/80">Vector Dimensions</span>
        <span className="ml-3 font-bold text-amber-100 text-lg">1536</span>
      </motion.div>


      {/* Left Panel */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-80 bg-black/20 backdrop-blur-3xl border-r border-white/10 z-20 flex flex-col p-6 shadow-[20px_0_30px_rgba(0,0,0,0.5)]"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Back Button inside Panel */}
        <div className="mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-cyan-500/30 bg-cyan-500/5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/15 transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)]"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <h2 className="text-lg font-bold text-white tracking-[0.2em]">
            INGESTION & VECTORS
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {/* Vector Space Embeddings Map */}
          <div className="p-4 rounded-sm bg-black/40 border border-white/10">
            <h3 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3">Vector Space Map (2D Projection)</h3>
            <div className="relative h-32 w-full bg-cyan-950/20 border border-cyan-500/20 overflow-hidden">
              {/* Scatter plot grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
              {/* Scatter dots */}
              {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`absolute rounded-full ${i % 3 === 0 ? 'bg-emerald-400 h-1.5 w-1.5' : i % 5 === 0 ? 'bg-purple-400 h-2 w-2' : 'bg-cyan-400 h-1 w-1'}`}
                  style={{
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 90 + 5}%`,
                    opacity: Math.random() * 0.5 + 0.3
                  }}
                />
              ))}
              {/* Active search radius */}
              <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/50 bg-emerald-400/10" />
            </div>
          </div>

          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Active Streams</h3>
          {[1, 2, 3].map((item) => (
            <motion.div 
              key={item}
              className="p-3 rounded-sm bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-all cursor-crosshair group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="text-[10px] text-cyan-500 font-semibold tracking-wider group-hover:text-cyan-400">STREAM 0{item}</div>
                <div className="text-[9px] text-gray-500">{(Math.random() * 10).toFixed(1)} MB/s</div>
              </div>
              <div className="mt-2 h-[2px] w-full bg-gray-800 rounded overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan-500/80" 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.random() * 60 + 20}%` }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-80 bg-black/20 backdrop-blur-3xl border-l border-white/10 z-20 flex flex-col p-6 shadow-[-20px_0_30px_rgba(0,0,0,0.5)]"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
      >
        <div className="flex items-center justify-end space-x-3 mb-8 border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white tracking-[0.2em] text-right">
            PIPELINE
          </h2>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="text-[10px] text-cyan-400 flex justify-between tracking-wider font-bold">
              <span>SEMANTIC SEARCH PLAYGROUND</span>
            </div>
            <div className="flex flex-col gap-2">
              <textarea 
                className="w-full h-16 bg-black/40 border border-cyan-500/30 rounded p-2 text-xs text-white outline-none focus:border-cyan-400 resize-none"
                placeholder="Query the engineering corpus..."
                defaultValue="What is the acceptable vibration tolerance for spindle SP-44 at 1200 RPM?"
              />
              <button className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-300 text-[10px] uppercase font-bold py-1.5 transition-colors">
                Execute Query
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-[10px] text-gray-400 flex justify-between tracking-wider">
              <span>ACTIVE RETRIEVAL</span>
              <span className="text-cyan-400 font-semibold">ONLINE</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-sm text-[10px] text-gray-300 break-words leading-relaxed">
              <span className="text-pink-500">SELECT</span> relevant_nodes <br/>
              <span className="text-pink-500">FROM</span> knowledge_graph <br/>
              <span className="text-pink-500">WHERE</span> similarity &gt; 0.92 <br/>
              <span className="text-pink-500">LIMIT</span> 5;
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div className="p-3 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
              <span className="text-2xl font-light text-white group-hover:text-cyan-300 transition-colors">42</span>
              <span className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">QPS</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
              <span className="text-2xl font-light text-white group-hover:text-purple-300 transition-colors">0.99</span>
              <span className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">Relevance</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Panel */}
      <motion.div
        className="absolute bottom-0 left-80 right-80 h-56 bg-black/20 backdrop-blur-3xl border-t border-white/10 z-20 p-6 flex flex-col shadow-[0_-20px_30px_rgba(0,0,0,0.5)]"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
          <h2 className="text-xs font-bold text-gray-400 tracking-[0.2em]">TERMINAL_STDOUT</h2>
          <div className="flex space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-red-500 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-yellow-500 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-green-500 transition-colors cursor-pointer" />
          </div>
        </div>
        
        <div className="flex-1 font-mono text-[11px] text-cyan-600/80 overflow-y-auto space-y-1.5 custom-scrollbar">
          <p>[SYS] Initializing RAG cluster node alpha-01...</p>
          <p>[SYS] Connecting to vector database...</p>
          <p className="text-green-500/90">[OK] Vector DB connected. Index size: 4.2TB.</p>
          <p>[SYS] Loading embedding models into VRAM...</p>
          <p className="text-green-500/90">[OK] Models loaded. Tensors ready.</p>
          <p className="text-cyan-400/90 mt-2 flex items-center">
            <span className="mr-2">&gt;</span> Waiting for incoming query streams
            <motion.span 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ duration: 1, repeat: Infinity }}
            >
              _
            </motion.span>
          </p>
        </div>
      </motion.div>
      
      {/* Global styles for scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}} />
    </div>
  );
}
