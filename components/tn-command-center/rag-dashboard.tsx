"use client";

import React, { useState, useEffect } from "react";
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
        <div className="flex items-center space-x-3 mb-8 border-b border-white/10 pb-4">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <h2 className="text-lg font-bold text-white tracking-[0.2em]">
            INGESTION
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div 
              key={item}
              className="p-4 rounded-sm bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-all cursor-crosshair group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-cyan-500 font-semibold tracking-wider group-hover:text-cyan-400">STREAM 0{item}</div>
                <div className="text-[10px] text-gray-500">{(Math.random() * 10).toFixed(1)} MB/s</div>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">Vectorizing corpus...</div>
              <div className="mt-3 h-[2px] w-full bg-gray-800 rounded overflow-hidden">
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
        
        <div className="flex flex-col space-y-8">
          <div className="space-y-3">
            <div className="text-xs text-gray-400 flex justify-between tracking-wider">
              <span>SEARCH</span>
              <span className="text-cyan-400 font-semibold">ONLINE</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-sm text-[11px] text-gray-300 break-words leading-relaxed">
              <span className="text-pink-500">SELECT</span> relevant_nodes <br/>
              <span className="text-pink-500">FROM</span> knowledge_graph <br/>
              <span className="text-pink-500">WHERE</span> similarity &gt; 0.92 <br/>
              <span className="text-pink-500">LIMIT</span> 5;
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs text-gray-400 flex justify-between tracking-wider">
              <span>CONTEXT WINDOW</span>
              <span className="text-cyan-400 font-semibold">128k</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" 
                initial={{ width: "0%" }}
                animate={{ width: "75%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="p-4 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
              <span className="text-3xl font-light text-white group-hover:text-cyan-300 transition-colors">42</span>
              <span className="text-[9px] text-gray-500 uppercase mt-2 tracking-widest">QPS</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-sm flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
              <span className="text-3xl font-light text-white group-hover:text-purple-300 transition-colors">0.99</span>
              <span className="text-[9px] text-gray-500 uppercase mt-2 tracking-widest">Relevance</span>
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
