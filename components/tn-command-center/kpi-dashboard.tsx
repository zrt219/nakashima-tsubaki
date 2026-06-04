"use client";

import { motion, Transition } from "framer-motion";
import { overviewEvents } from "@/lib/tn-ai-data";
import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { Icon } from "@/components/tn-command-center/command-center-primitives";

const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export function KpiDashboard() {
  return (
    <CommandCenterShell
      activeAreaId="kpis"
      eventStream={overviewEvents}
      rightRail={<RightRailAnomalies />}
    >
      <div className="flex flex-col justify-between h-[calc(100vh-140px)] pointer-events-none">
        
        {/* TOP: Header metrics */}
        <motion.div 
          className="pointer-events-auto shrink-0"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <TopHeaderMetrics />
        </motion.div>

        {/* MIDDLE: Left Rail & Open Center */}
        <div className="flex flex-1 my-4 min-h-0">
          <motion.div 
            className="w-80 flex flex-col gap-3 h-full pointer-events-auto overflow-y-auto pr-2 custom-scrollbar"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...springTransition, delay: 0.2 }}
          >
            <LeftRailTrendMatrices />
          </motion.div>
          {/* OPEN CENTER */}
          <div className="flex-1" />
        </div>

        {/* BOTTOM: Fleet overview */}
        <motion.div 
          className="pointer-events-auto shrink-0"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springTransition, delay: 0.3 }}
        >
          <BottomRailFleetOverview />
        </motion.div>

      </div>
    </CommandCenterShell>
  );
}

// ----------------------------------------------------------------------
// Right Rail Active Anomalies (Used as rightRail prop)
// ----------------------------------------------------------------------
function RightRailAnomalies() {
  return (
    <motion.div 
      className="glass-panel relative flex h-full flex-col overflow-hidden bg-black/40"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ ...springTransition, delay: 0.4 }}
    >
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-red-500/25 to-transparent" />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400">Right Rail Active Anomalies</p>
          <div className="mt-4 space-y-3">
            <AnomalyCard 
              id="ANM-089" 
              title="Spindle Vibration Spike" 
              location="Cell 4 - Spindle B" 
              severity="critical" 
              time="2 min ago" 
            />
            <AnomalyCard 
              id="ANM-090" 
              title="Coolant Flow Restriction" 
              location="Cell 2 - Pump A" 
              severity="warning" 
              time="14 min ago" 
            />
            <AnomalyCard 
              id="ANM-091" 
              title="Thermal Drift Detected" 
              location="Cell 5 - Main Axis" 
              severity="warning" 
              time="45 min ago" 
            />
          </div>
        </section>

        <section className="border border-red-500/30 bg-red-500/[0.05] p-4 mt-6">
          <p className="text-[10px] font-semibold uppercase text-red-400/80">Anomaly Escalation</p>
          <div className="mt-2 flex flex-col gap-2">
            <button className="border border-red-500/50 bg-red-500/10 px-3 py-2 text-[10px] text-red-400 uppercase tracking-wider hover:bg-red-500/20 transition-colors">
              Halt Affected Cells
            </button>
            <button className="border border-command-line/50 bg-black/40 px-3 py-2 text-[10px] text-slate-300 uppercase tracking-wider hover:bg-white/10 transition-colors">
              Dispatch Maintenance
            </button>
          </div>
        </section>
        
      </div>
    </motion.div>
  );
}

function AnomalyCard({ id, title, location, severity, time }: { id: string, title: string, location: string, severity: "critical" | "warning", time: string }) {
  const isCritical = severity === "critical";
  return (
    <div className={`border p-3 relative overflow-hidden group ${isCritical ? "border-red-500/50 bg-red-900/10" : "border-amber-500/40 bg-amber-900/10"}`}>
      {isCritical && <div className="absolute top-0 left-0 right-0 h-[1px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
      <div className="flex justify-between items-start">
        <span className={`text-[9px] font-mono ${isCritical ? "text-red-400" : "text-amber-400"}`}>{id}</span>
        <span className="text-[9px] text-slate-400">{time}</span>
      </div>
      <p className="mt-1 text-xs font-bold text-white">{title}</p>
      <p className="text-[10px] text-slate-300 mt-1">{location}</p>
      <div className="mt-2 flex items-center justify-between">
         <span className={`text-[10px] uppercase tracking-wider ${isCritical ? "text-red-500 font-bold animate-pulse" : "text-amber-400"}`}>
           {severity}
         </span>
         <Icon name={isCritical ? "shield" : "flow"} className={`h-3 w-3 ${isCritical ? "text-red-400" : "text-amber-400"}`} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Top Header Metrics
// ----------------------------------------------------------------------
function TopHeaderMetrics() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <TopMetricBox label="Global OEE" value="87.4%" trend="+1.2%" status="good" />
      <TopMetricBox label="Active Cells" value="14 / 16" trend="2 offline" status="warning" />
      <TopMetricBox label="Yield Rate" value="99.8%" trend="stable" status="good" />
      <TopMetricBox label="Energy Draw" value="4.2 MW" trend="-5%" status="good" />
      <TopMetricBox label="Critical Alerts" value="3" trend="Action Req." status="critical" />
    </div>
  );
}

function TopMetricBox({ label, value, trend, status }: { label: string, value: string, trend: string, status: "good" | "warning" | "critical" }) {
  const colorMap = {
    good: "text-emerald-400",
    warning: "text-amber-400",
    critical: "text-red-400"
  };
  const borderMap = {
    good: "border-emerald-500/30",
    warning: "border-amber-500/30",
    critical: "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
  };
  
  return (
    <div className={`border bg-black/50 p-3 backdrop-blur-md flex flex-col justify-between relative overflow-hidden ${borderMap[status]}`}>
      <div className="absolute top-0 right-0 p-2 opacity-20">
         <Icon name="chart" className="w-8 h-8 text-white" />
      </div>
      <p className="text-[10px] font-semibold text-command-muted uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-end justify-between relative z-10">
         <span className="text-2xl font-mono font-bold text-white drop-shadow-md">{value}</span>
         <span className={`text-[10px] font-semibold ${colorMap[status]}`}>{trend}</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Left Rail Trend Matrices
// ----------------------------------------------------------------------
function LeftRailTrendMatrices() {
  return (
    <>
      <div className="border border-command-line/50 bg-black/50 backdrop-blur-md p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-400 mb-3">Vibration Matrix</p>
        <div className="space-y-2">
          <TrendBar label="Spindle A" value={45} max={100} color="emerald" />
          <TrendBar label="Spindle B" value={85} max={100} color="red" />
          <TrendBar label="Spindle C" value={30} max={100} color="emerald" />
          <TrendBar label="Spindle D" value={60} max={100} color="amber" />
        </div>
      </div>
      
      <div className="border border-command-line/50 bg-black/50 backdrop-blur-md p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-400 mb-3">Thermal Drift Profiles</p>
        <div className="grid grid-cols-2 gap-2">
          <Gauge title="Z-Axis" value={72} color="amber" />
          <Gauge title="X-Axis" value={41} color="emerald" />
          <Gauge title="Y-Axis" value={38} color="emerald" />
          <Gauge title="Rotary" value={88} color="red" />
        </div>
      </div>

      <div className="border border-command-line/50 bg-black/50 backdrop-blur-md p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-400 mb-2">Telemetry Streams</p>
        <Sparkline label="Power Draw (kW)" data={[20,25,22,30,28,35,40,38,42,39,45]} color="cyan" />
        <div className="h-4" />
        <Sparkline label="Coolant Temp (°C)" data={[20,21,21,22,23,24,25,26,26,27,27]} color="amber" />
      </div>
    </>
  );
}

function TrendBar({ label, value, max, color }: { label: string, value: number, max: number, color: "emerald" | "amber" | "red" }) {
  const percent = (value / max) * 100;
  const bgMap = {
    emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
    amber: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    red: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
  };
  
  return (
    <div>
      <div className="flex justify-between text-[9px] text-slate-300 mb-1">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 overflow-hidden">
         <motion.div 
           className={`h-full ${bgMap[color]}`}
           initial={{ width: 0 }}
           animate={{ width: `${percent}%` }}
           transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1, delay: 0.5 }}
         />
      </div>
    </div>
  );
}

function Gauge({ title, value, color }: { title: string, value: number, color: "emerald" | "amber" | "red" }) {
  const strokeMap = {
    emerald: "#10b981",
    amber: "#fbbf24",
    red: "#ef4444"
  };
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
       <div className="relative w-16 h-16 flex items-center justify-center">
         <svg className="w-full h-full transform -rotate-90">
           <circle cx="32" cy="32" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
           <motion.circle 
             cx="32" cy="32" r={radius} 
             stroke={strokeMap[color]} 
             strokeWidth="4" 
             fill="transparent" 
             strokeDasharray={circumference}
             initial={{ strokeDashoffset: circumference }}
             animate={{ strokeDashoffset: offset }}
             transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1, delay: 0.6 }}
             strokeLinecap="round"
             style={{ filter: `drop-shadow(0 0 4px ${strokeMap[color]})` }}
           />
         </svg>
         <span className="absolute text-xs font-mono font-bold text-white">{value}</span>
       </div>
       <span className="text-[9px] text-command-muted mt-1 uppercase tracking-widest">{title}</span>
    </div>
  );
}

function Sparkline({ label, data, color }: { label: string, data: number[], color: "cyan" | "amber" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");
  
  const strokeColor = color === "cyan" ? "#00d4ff" : "#fbbf24";
  
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="text-[9px] text-slate-300">{label}</span>
        <span className="text-[10px] font-mono text-white">{data[data.length-1]}</span>
      </div>
      <div className="h-8 w-full bg-black/30 border border-white/5 relative">
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
           <motion.polyline 
             points={points} 
             fill="none" 
             stroke={strokeColor} 
             strokeWidth="2" 
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1, delay: 0.7 }}
             style={{ filter: `drop-shadow(0 0 2px ${strokeColor})` }}
           />
        </svg>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Bottom Rail Fleet Overview
// ----------------------------------------------------------------------
function BottomRailFleetOverview() {
  return (
    <div className="border border-command-line/50 bg-black/60 backdrop-blur-md p-3">
       <div className="flex justify-between items-center mb-3">
         <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-400">Fleet Overview (16 Cells)</p>
         <div className="flex gap-4">
           <span className="flex items-center gap-1 text-[9px] text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimal</span>
           <span className="flex items-center gap-1 text-[9px] text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> Warning</span>
           <span className="flex items-center gap-1 text-[9px] text-red-400"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical</span>
         </div>
       </div>
       
       <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
         {Array.from({ length: 16 }).map((_, i) => {
           let status: "optimal" | "warning" | "critical" = "optimal";
           if (i === 3 || i === 7) status = "critical";
           else if (i === 1 || i === 12) status = "warning";
           
           return <FleetCell key={i} index={i+1} status={status} />;
         })}
       </div>
    </div>
  );
}

function FleetCell({ index, status }: { index: number, status: "optimal" | "warning" | "critical" }) {
  const bgMap = {
    optimal: "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
    warning: "border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30",
    critical: "border-red-500/60 bg-red-500/30 hover:bg-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
  };
  const textMap = {
    optimal: "text-emerald-400",
    warning: "text-amber-400",
    critical: "text-red-300 font-bold"
  };
  
  return (
    <motion.div 
      className={`border p-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${bgMap[status]}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
       <span className="text-[10px] text-slate-400 mb-1">C-{index.toString().padStart(2, '0')}</span>
       <span className={`text-xs ${textMap[status]}`}>
         {status === "optimal" ? "98%" : status === "warning" ? "82%" : "45%"}
       </span>
    </motion.div>
  );
}
