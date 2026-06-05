import type { TwinScenario } from "./types";

export const SCENARIOS: TwinScenario[] = [
  {
    id: "thermal_excursion",
    name: "Thermal Excursion",
    description: "Coolant temperature begins rising rapidly, causing spindle thermal drift and dimensional quality risk.",
    modelId: "thermal-heat-field",
    incidentType: "thermal",
    difficulty: "Beginner",
    riskLevel: "Medium",
    signals: [
      {
        id: "coolant_temp",
        label: "Coolant Temp",
        unit: "°C",
        baseline: 22.0,
        current: 31.5,
        threshold: 28.0,
        trend: [22.0, 22.2, 23.5, 26.8, 30.1, 31.5],
        status: "critical"
      },
      {
        id: "thermal_drift",
        label: "Spindle Thermal Drift",
        unit: "µm",
        baseline: 2.0,
        current: 8.5,
        threshold: 6.0,
        trend: [2.0, 2.1, 3.0, 5.5, 7.8, 8.5],
        status: "warning"
      }
    ],
    recommendations: [
      {
        id: "rec_thermal_offset",
        title: "Thermal Offset Compensation",
        summary: "Apply dynamic CNC offsets to counter spindle growth.",
        confidence: 94.2,
        expectedImpact: "Returns dimensional accuracy to Cpk > 1.33 within 4 minutes.",
        safetyMode: "approval-required",
        rationale: ["Coolant chiller fault detected in logs", "Historical success rate 98%"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_sensor_log",
        title: "Chiller Telemetry Log",
        type: "sensor",
        confidence: 99.9,
        hash: "0x8fa3...b21c"
      },
      {
        id: "ev_procedure",
        title: "SOP-14: Thermal Growth Compensation",
        type: "procedure",
        confidence: 100.0,
        hash: "0x11ab...ff4d"
      }
    ],
    requiredApprovals: [
      {
        id: "app_thermal_offset",
        label: "Apply Offset Parameters",
        requiredRole: "CNC Operator",
        reason: "Modifying live cutting trajectory offsets requires human validation.",
        status: "pending"
      }
    ]
  },
  {
    id: "spindle_degradation",
    name: "Spindle Degradation",
    description: "Vibration RMS rises steadily and bearing health drops, risking severe tool chatter.",
    modelId: "vibration-wave-tunnel",
    incidentType: "vibration",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      {
        id: "vib_rms",
        label: "Vibration RMS",
        unit: "mm/s",
        baseline: 0.8,
        current: 4.2,
        threshold: 3.5,
        trend: [0.8, 1.0, 1.5, 2.2, 3.4, 4.2],
        status: "critical"
      },
      {
        id: "bearing_health",
        label: "Bearing Health",
        unit: "%",
        baseline: 100,
        current: 68,
        threshold: 75,
        trend: [100, 99, 92, 85, 74, 68],
        status: "critical"
      }
    ],
    recommendations: [
      {
        id: "rec_reduce_feed",
        title: "Reduce Feed & Schedule Maintenance",
        summary: "Reduce feed rate by 15% to suppress chatter, schedule bearing inspection.",
        confidence: 88.5,
        expectedImpact: "Extends spindle life by 48 hours to reach scheduled downtime.",
        safetyMode: "advisory",
        rationale: ["Vibration signature matches bearing outer race fault (BPFO)"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_fft_analysis",
        title: "FFT Vibration Spectrum",
        type: "sensor",
        confidence: 96.0,
        hash: "0x22de...a111"
      }
    ],
    requiredApprovals: []
  },
  {
    id: "tool_wear_accel",
    name: "Tool Wear Acceleration",
    description: "Tool wear crosses predictive threshold early, raising surface roughness risk.",
    modelId: "tool-wear-geometry",
    incidentType: "wear",
    difficulty: "Intermediate",
    riskLevel: "Medium",
    signals: [
      {
        id: "tool_wear_est",
        label: "Estimated Wear",
        unit: "mm",
        baseline: 0.05,
        current: 0.28,
        threshold: 0.25,
        trend: [0.05, 0.1, 0.15, 0.2, 0.25, 0.28],
        status: "warning"
      }
    ],
    recommendations: [
      {
        id: "rec_tool_change",
        title: "Execute Preemptive Tool Change",
        summary: "Swap to twin tool in magazine slot T04.",
        confidence: 92.0,
        expectedImpact: "Prevents estimated 12% scrap rate on next 50 parts.",
        safetyMode: "approval-required",
        rationale: ["Spindle load matched against wear progression model"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_spindle_load",
        title: "Spindle Load Curve",
        type: "sensor",
        confidence: 94.0,
        hash: "0x44aa...bc99"
      }
    ],
    requiredApprovals: [
      {
        id: "app_tool_change",
        label: "Confirm Tool Change",
        requiredRole: "Machinist",
        reason: "Physical tool change execution requires safety lockout confirmation.",
        status: "pending"
      }
    ]
  },
  {
    id: "dimensional_quality_hold",
    name: "Dimensional Quality Hold",
    description: "Part measurement drifts near tolerance limit due to material variation.",
    modelId: "qa-inspection-torus",
    incidentType: "quality",
    difficulty: "Intermediate",
    riskLevel: "High",
    signals: [
      {
        id: "cpk_score",
        label: "Process Capability (Cpk)",
        unit: "idx",
        baseline: 1.67,
        current: 0.95,
        threshold: 1.33,
        trend: [1.67, 1.60, 1.45, 1.20, 1.05, 0.95],
        status: "critical"
      }
    ],
    recommendations: [
      {
        id: "rec_quality_hold",
        title: "Automated Quality Hold",
        summary: "Halt production and generate 100% inspection packet for last 50 parts.",
        confidence: 99.9,
        expectedImpact: "Contains non-conforming material before shipping.",
        safetyMode: "approval-required",
        rationale: ["Cpk dropped below 1.0; statistically likely scrap produced"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_cmm_data",
        title: "CMM Inspection Stream",
        type: "qa-record",
        confidence: 100.0,
        hash: "0x99ff...eec2"
      }
    ],
    requiredApprovals: [
      {
        id: "app_quality_hold",
        label: "Authorize QA Hold",
        requiredRole: "Quality Engineer",
        reason: "Production halt requires QE signature.",
        status: "pending"
      }
    ]
  },
  {
    id: "retrieval_gap",
    name: "Retrieval Gap / Missing Context",
    description: "RAG system cannot find enough approved maintenance evidence for a rare fault.",
    modelId: "rag-knowledge-graph",
    incidentType: "knowledge",
    difficulty: "Advanced",
    riskLevel: "Medium",
    signals: [
      {
        id: "retrieval_coverage",
        label: "RAG Coverage",
        unit: "%",
        baseline: 98,
        current: 42,
        threshold: 80,
        trend: [98, 98, 97, 85, 60, 42],
        status: "warning"
      }
    ],
    recommendations: [
      {
        id: "rec_escalate_curator",
        title: "Block Action & Escalate",
        summary: "Confidence too low for action. Request knowledge curator review.",
        confidence: 30.0,
        expectedImpact: "Prevents unverified AI hallucination or unsafe action.",
        safetyMode: "advisory",
        rationale: ["No exact match found in SOP vector database"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_rag_logs",
        title: "Vector Search Logs",
        type: "simulation",
        confidence: 100.0,
        hash: "0xaa11...bb22"
      }
    ],
    requiredApprovals: [
      {
        id: "app_curator_review",
        label: "Knowledge Review",
        requiredRole: "Subject Matter Expert",
        reason: "Must manually link correct procedure to this new fault signature.",
        status: "pending"
      }
    ]
  },
  {
    id: "sensor_drift",
    name: "Sensor Drift / Calibration Fault",
    description: "Sensor slowly drifts away from expected baseline, indicating calibration fault.",
    modelId: "kpi-telemetry-cylinder",
    incidentType: "sensor",
    difficulty: "Intermediate",
    riskLevel: "Medium",
    signals: [
      {
        id: "sensor_divergence",
        label: "Sensor Divergence",
        unit: "%",
        baseline: 0.1,
        current: 5.2,
        threshold: 3.0,
        trend: [0.1, 0.5, 1.2, 2.5, 4.0, 5.2],
        status: "critical"
      },
      {
        id: "data_confidence",
        label: "Data Confidence",
        unit: "%",
        baseline: 99.9,
        current: 72.0,
        threshold: 85.0,
        trend: [99.9, 99.5, 95.0, 88.0, 79.0, 72.0],
        status: "warning"
      }
    ],
    recommendations: [
      {
        id: "rec_recalibrate",
        title: "Recalibrate Sensor",
        summary: "Recalibrate sensor and mark affected signals as lower trust.",
        confidence: 89.0,
        expectedImpact: "Restores data confidence to >99%.",
        safetyMode: "approval-required",
        rationale: ["Redundant sensor mismatch detected", "Calibration age > 6 months"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_cal_log",
        title: "Calibration Log CAL-021",
        type: "procedure",
        confidence: 98.0,
        hash: "0x33bc...d44a"
      }
    ],
    requiredApprovals: [
      {
        id: "app_recalibrate",
        label: "Operator Review",
        requiredRole: "Operator",
        reason: "Simulating recalibrated signal alignment requires operator review.",
        status: "pending"
      }
    ]
  },
  {
    id: "cyber_anomaly",
    name: "Cyber-Anomalous Command Pattern",
    description: "A command pattern appears unusual compared to normal workflow, triggering safety boundary alert.",
    modelId: "governance-shield",
    incidentType: "security",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      {
        id: "anomaly_score",
        label: "Command Anomaly Score",
        unit: "idx",
        baseline: 0.1,
        current: 0.92,
        threshold: 0.75,
        trend: [0.1, 0.12, 0.15, 0.45, 0.88, 0.92],
        status: "critical"
      }
    ],
    recommendations: [
      {
        id: "rec_block_exec",
        title: "Block Execution Path",
        summary: "Block execution path, require supervisor review, capture forensic evidence.",
        confidence: 99.5,
        expectedImpact: "Prevents unauthorized PLC parameter changes.",
        safetyMode: "approval-required",
        rationale: ["User/session mismatch", "OT safety boundary alert triggered"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_sec_policy",
        title: "SEC-209 No Direct PLC Control",
        type: "procedure",
        confidence: 100.0,
        hash: "0x55ef...c77b"
      }
    ],
    requiredApprovals: [
      {
        id: "app_supervisor",
        label: "Supervisor Review",
        requiredRole: "Supervisor",
        reason: "Security anomaly requires elevated supervisor override.",
        status: "pending"
      }
    ]
  },
  {
    id: "energy_spike",
    name: "Energy Spike / Power Draw Instability",
    description: "Power draw rises unexpectedly during operation, indicating mechanical load issues.",
    modelId: "kpi-telemetry-cylinder",
    incidentType: "energy",
    difficulty: "Intermediate",
    riskLevel: "High",
    signals: [
      {
        id: "power_draw",
        label: "Spindle Power Draw",
        unit: "kW",
        baseline: 12.5,
        current: 18.2,
        threshold: 16.0,
        trend: [12.5, 12.8, 13.5, 15.2, 17.5, 18.2],
        status: "critical"
      },
      {
        id: "torque_est",
        label: "Torque Estimate",
        unit: "Nm",
        baseline: 45.0,
        current: 68.5,
        threshold: 60.0,
        trend: [45.0, 46.2, 49.5, 55.0, 64.0, 68.5],
        status: "warning"
      }
    ],
    recommendations: [
      {
        id: "rec_load_reduction",
        title: "Investigate Mechanical Load",
        summary: "Adjust process envelope in shadow mode to reduce spindle load.",
        confidence: 85.5,
        expectedImpact: "Stabilizes power draw below 15kW.",
        safetyMode: "approval-required",
        rationale: ["Power trend correlates with torque model instability"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_power_trend",
        title: "Energy Telemetry Trace",
        type: "sensor",
        confidence: 97.5,
        hash: "0x66ab...88cc"
      }
    ],
    requiredApprovals: [
      {
        id: "app_setting_change",
        label: "Approve Parameter Change",
        requiredRole: "Process Engineer",
        reason: "Process envelope adjustments require engineering approval.",
        status: "pending"
      }
    ]
  },
  {
    id: "supply_chain_gap",
    name: "Supply Chain Traceability Gap",
    description: "A material lot lacks complete upstream evidence, blocking QA release.",
    modelId: "supply-chain-flow",
    incidentType: "provenance",
    difficulty: "Beginner",
    riskLevel: "Medium",
    signals: [
      {
        id: "prov_confidence",
        label: "Provenance Confidence",
        unit: "%",
        baseline: 100,
        current: 45,
        threshold: 95,
        trend: [100, 100, 100, 80, 60, 45],
        status: "critical"
      }
    ],
    recommendations: [
      {
        id: "rec_hold_release",
        title: "Hold Material Release",
        summary: "Hold release until source evidence is verified from supplier network.",
        confidence: 96.0,
        expectedImpact: "Prevents non-compliant material shipment.",
        safetyMode: "approval-required",
        rationale: ["Missing material certificate hash from upstream supplier"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_ledger_gap",
        title: "Blockchain Ledger Query",
        type: "qa-record",
        confidence: 100.0,
        hash: "0x77cd...e99d"
      }
    ],
    requiredApprovals: [
      {
        id: "app_prov_review",
        label: "Provenance Review",
        requiredRole: "QA Manager",
        reason: "QA Manager must manually verify upstream supplier certificate.",
        status: "pending"
      }
    ]
  },
  {
    id: "compound_incident",
    name: "Multi-Factor Compound Incident",
    description: "Thermal drift, vibration, and tool wear combine into a critical quality risk.",
    modelId: "simulator-chaotic-spindle",
    incidentType: "compound",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      {
        id: "cpk_score_compound",
        label: "Process Capability (Cpk)",
        unit: "idx",
        baseline: 1.80,
        current: 0.85,
        threshold: 1.33,
        trend: [1.80, 1.65, 1.40, 1.15, 0.95, 0.85],
        status: "critical"
      },
      {
        id: "vib_rms_compound",
        label: "Vibration RMS",
        unit: "mm/s",
        baseline: 0.8,
        current: 3.8,
        threshold: 3.5,
        trend: [0.8, 0.9, 1.4, 2.8, 3.5, 3.8],
        status: "critical"
      },
      {
        id: "coolant_temp_compound",
        label: "Coolant Temp",
        unit: "°C",
        baseline: 22.0,
        current: 29.5,
        threshold: 28.0,
        trend: [22.0, 23.5, 25.8, 27.5, 28.8, 29.5],
        status: "warning"
      }
    ],
    recommendations: [
      {
        id: "rec_compound_mitigation",
        title: "Execute Multi-Factor Mitigation",
        summary: "Quality hold, inspect tool, reduce feed in shadow simulation, schedule maintenance.",
        confidence: 91.5,
        expectedImpact: "Stabilizes spindle environment and halts defective parts.",
        safetyMode: "approval-required",
        rationale: ["Cpk < 1.0 correlated with vibration and thermal spikes simultaneously"]
      }
    ],
    evidenceSources: [
      {
        id: "ev_multi_signal",
        title: "Multi-Signal Correlation Model",
        type: "simulation",
        confidence: 95.0,
        hash: "0x88de...f00e"
      }
    ],
    requiredApprovals: [
      {
        id: "app_multi_role",
        label: "Multi-Role Authorization",
        requiredRole: "Plant Manager",
        reason: "Compound incidents affecting multiple sub-systems require executive override.",
        status: "pending"
      }
    ]
  },
  {
    id: "ics_stuxnet_spoof",
    name: "ICS Logic Spoof (Stuxnet Vector)",
    description: "A MITRE ATT&CK for ICS vector: SCADA UI is spoofed to report normal telemetry, while the Level 0 Physical Twin spins dangerously out of control.",
    modelId: "stuxnet-centrifuge",
    incidentType: "security",
    difficulty: "Expert",
    riskLevel: "Critical",
    signals: [
      {
        id: "spoofed_rpm",
        label: "SCADA RPM (Spoofed)",
        unit: "RPM",
        baseline: 12000,
        current: 12000,
        threshold: 15000,
        trend: [12000, 12000, 12000, 12000, 12000, 12000],
        status: "normal"
      },
      {
        id: "actual_rpm",
        label: "L0 Physical Twin (Actual)",
        unit: "RPM",
        baseline: 12000,
        current: 28500,
        threshold: 15000,
        trend: [12000, 14500, 18000, 22000, 26000, 28500],
        status: "critical"
      }
    ],
    recommendations: [
      {
        id: "rec_airgap_kill",
        title: "Initiate Air-Gapped E-Stop",
        summary: "Bypass Level 2 SCADA and trigger hard physical E-Stop relay.",
        confidence: 99.9,
        expectedImpact: "Prevents catastrophic kinetic destruction of the centrifuge/spindle.",
        safetyMode: "approval-required",
        rationale: ["Level 0 vibration envelope fundamentally contradicts Level 2 reported RPM.", "Cryptographic heartbeat failure on Modbus TCP stream."]
      }
    ],
    evidenceSources: [
      {
        id: "ev_mitre_ics",
        title: "T814: Denial of View / Spoofing",
        type: "procedure",
        confidence: 100.0,
        hash: "0xff11...00aa"
      }
    ],
    requiredApprovals: [
      {
        id: "app_kinetic_kill",
        label: "Authorize Kinetic Kill",
        requiredRole: "Plant Manager",
        reason: "Hard E-Stop drops power to the entire cell and requires a 4-hour restart sequence.",
        status: "pending"
      }
    ]
  },
  {
    id: "modbus_flooding_dos",
    name: "Modbus Flooding / DoS",
    description: "Network packet storms on Level 1 switches causing extreme telemetry latency.",
    modelId: "architecture-lattice",
    incidentType: "cybersecurity",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      { id: "network_latency", label: "Packet Latency", unit: "ms", baseline: 5, current: 850, threshold: 100, trend: [5, 6, 12, 140, 850], status: "critical" }
    ],
    recommendations: [
      { id: "rec_quarantine_subnet", title: "Quarantine Subnet", summary: "Isolate affected cell via managed switch.", confidence: 92.5, expectedImpact: "Restores bandwidth to remaining cells.", safetyMode: "approval-required", rationale: ["Latency exceeds TCP timeout thresholds."] }
    ],
    evidenceSources: [{ id: "ev_wireshark", title: "PCAP Analysis", type: "sensor", confidence: 99.0 }],
    requiredApprovals: [{ id: "app_isolate", label: "Authorize Isolation", requiredRole: "Network Admin", reason: "Drops cell offline", status: "pending" }]
  },
  {
    id: "ransomware_mes_lock",
    name: "Ransomware / MES Encryption",
    description: "Level 3 MES data gets locked, halting production orders.",
    modelId: "governance-shield",
    incidentType: "cybersecurity",
    difficulty: "Expert",
    riskLevel: "Critical",
    signals: [
      { id: "disk_io_spike", label: "Disk I/O Wait", unit: "%", baseline: 10, current: 98, threshold: 80, trend: [10, 15, 80, 95, 98], status: "critical" }
    ],
    recommendations: [
      { id: "rec_sever_ot", title: "Sever IT/OT Link", summary: "Cut DMZ connection to prevent lateral spread.", confidence: 99.9, expectedImpact: "Prevents Level 1/2 infection.", safetyMode: "approval-required", rationale: ["Known ransomware signatures detected."] }
    ],
    evidenceSources: [{ id: "ev_snort", title: "IDS Alert", type: "procedure", confidence: 99.0 }],
    requiredApprovals: [{ id: "app_sever", label: "Sever Link", requiredRole: "CISO", reason: "Isolates entire factory", status: "pending" }]
  },
  {
    id: "insider_threat_sabotage",
    name: "Insider Threat / Parameter Sabotage",
    description: "Malicious feed rate overrides detected by RAG anomaly scoring.",
    modelId: "advisory-decision-core",
    incidentType: "security",
    difficulty: "Intermediate",
    riskLevel: "High",
    signals: [
      { id: "feed_rate_override", label: "Feed Override", unit: "%", baseline: 100, current: 200, threshold: 120, trend: [100, 100, 100, 200], status: "critical" }
    ],
    recommendations: [
      { id: "rec_lockout", title: "HMI Lockout", summary: "Disable local operator panel.", confidence: 85.0, expectedImpact: "Prevents further overrides.", safetyMode: "shadow", rationale: ["Override violates active SOP."] }
    ],
    evidenceSources: [{ id: "ev_hmi_log", title: "HMI Audit Log", type: "maintenance-log", confidence: 90.0 }],
    requiredApprovals: [{ id: "app_lock", label: "Lock HMI", requiredRole: "Supervisor", reason: "Locks out local user", status: "pending" }]
  },
  {
    id: "firmware_downgrade",
    name: "Firmware Downgrade Attack",
    description: "Unauthorized flashing of PLC to a vulnerable state.",
    modelId: "ledger-blockchain-grid",
    incidentType: "cybersecurity",
    difficulty: "Expert",
    riskLevel: "Critical",
    signals: [
      { id: "fw_checksum", label: "FW Hash Match", unit: "%", baseline: 100, current: 0, threshold: 100, trend: [100, 100, 0], status: "critical" }
    ],
    recommendations: [
      { id: "rec_flash", title: "Restore Firmware", summary: "Flash golden image from immutable ledger.", confidence: 98.0, expectedImpact: "Restores PLC integrity.", safetyMode: "approval-required", rationale: ["Hash mismatch detected."] }
    ],
    evidenceSources: [{ id: "ev_ledger", title: "Blockchain Ledger", type: "qa-record", confidence: 100.0 }],
    requiredApprovals: [{ id: "app_flash", label: "Authorize Flash", requiredRole: "Maintenance Lead", reason: "Requires machine stop", status: "pending" }]
  },
  {
    id: "gps_spoofing",
    name: "Time-Sync Spoofing (PTP)",
    description: "Desyncing high-speed coordination between robot arms.",
    modelId: "simulator-chaotic-spindle",
    incidentType: "cybersecurity",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      { id: "ptp_offset", label: "PTP Offset", unit: "ns", baseline: 50, current: 15000, threshold: 1000, trend: [50, 60, 500, 15000], status: "critical" }
    ],
    recommendations: [
      { id: "rec_halt", title: "Halt Coordinated Motion", summary: "Stop multi-axis interpolation.", confidence: 95.0, expectedImpact: "Prevents mechanical collision.", safetyMode: "approval-required", rationale: ["PTP offset exceeds safety envelope."] }
    ],
    evidenceSources: [{ id: "ev_ptp", title: "Grandmaster Clock Log", type: "sensor", confidence: 99.0 }],
    requiredApprovals: [{ id: "app_halt", label: "Halt Motion", requiredRole: "Supervisor", reason: "Stops production line", status: "pending" }]
  },
  {
    id: "ball_screw_backlash",
    name: "Ball Screw Backlash",
    description: "Micro-dimensional errors appearing only on G01 interpolation moves.",
    modelId: "tool-wear-geometry",
    incidentType: "hardware",
    difficulty: "Intermediate",
    riskLevel: "Medium",
    signals: [
      { id: "axis_following_err", label: "Following Error", unit: "µm", baseline: 2, current: 18, threshold: 10, trend: [2, 3, 5, 12, 18], status: "warning" }
    ],
    recommendations: [
      { id: "rec_comp", title: "Update Backlash Comp", summary: "Adjust pitch error compensation matrix.", confidence: 88.0, expectedImpact: "Restores positional accuracy.", safetyMode: "advisory", rationale: ["Error isolated to direction reversal."] }
    ],
    evidenceSources: [{ id: "ev_servo", title: "Servo Trace", type: "sensor", confidence: 95.0 }],
    requiredApprovals: [{ id: "app_comp", label: "Apply Comp", requiredRole: "Engineer", reason: "Modifies machine parameters", status: "pending" }]
  },
  {
    id: "coolant_pump_cavitation",
    name: "Coolant Pump Cavitation",
    description: "Pressure drops causing localized tool overheating.",
    modelId: "vibration-wave-tunnel",
    incidentType: "hardware",
    difficulty: "Beginner",
    riskLevel: "Medium",
    signals: [
      { id: "coolant_pressure", label: "Coolant Pressure", unit: "bar", baseline: 70, current: 45, threshold: 50, trend: [70, 68, 55, 45], status: "critical" }
    ],
    recommendations: [
      { id: "rec_clean", title: "Clean Intake Filter", summary: "Schedule immediate filter replacement.", confidence: 96.0, expectedImpact: "Restores nominal pressure.", safetyMode: "advisory", rationale: ["Pressure drop matches clogged filter profile."] }
    ],
    evidenceSources: [{ id: "ev_pump", title: "Pump Telemetry", type: "sensor", confidence: 98.0 }],
    requiredApprovals: [{ id: "app_maint", label: "Dispatch Maint", requiredRole: "Supervisor", reason: "Requires human intervention", status: "pending" }]
  },
  {
    id: "harmonic_resonance",
    name: "Harmonic Drive Resonance",
    description: "Specific RPM triggers sympathetic vibrations tearing the spindle.",
    modelId: "simulator-chaotic-spindle",
    incidentType: "hardware",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      { id: "vib_hz", label: "Peak Vibration", unit: "Hz", baseline: 120, current: 450, threshold: 300, trend: [120, 125, 450], status: "critical" }
    ],
    recommendations: [
      { id: "rec_avoid", title: "RPM Avoidance Zone", summary: "Dynamic G-Code alteration to skip 14,500 RPM.", confidence: 91.0, expectedImpact: "Eliminates resonant vibration.", safetyMode: "shadow", rationale: ["Resonance mapped to specific RPM band."] }
    ],
    evidenceSources: [{ id: "ev_accel", title: "Spindle Accelerometer", type: "sensor", confidence: 99.0 }],
    requiredApprovals: [{ id: "app_gcode", label: "Rewrite G-Code", requiredRole: "NC Programmer", reason: "Alters validated machining program", status: "pending" }]
  },
  {
    id: "linear_guide_lube",
    name: "Linear Guide Lube Failure",
    description: "Friction spikes causing servo amplifier overload.",
    modelId: "kpi-telemetry-cylinder",
    incidentType: "hardware",
    difficulty: "Intermediate",
    riskLevel: "High",
    signals: [
      { id: "servo_current", label: "Servo Current", unit: "A", baseline: 5, current: 18, threshold: 15, trend: [5, 8, 12, 18], status: "critical" }
    ],
    recommendations: [
      { id: "rec_lube", title: "Force Lube Cycle", summary: "Manually trigger auto-lubricator.", confidence: 89.0, expectedImpact: "Reduces friction by 60%.", safetyMode: "shadow", rationale: ["Current spike correlates with dry guides."] }
    ],
    evidenceSources: [{ id: "ev_current", title: "Amp Monitor", type: "sensor", confidence: 95.0 }],
    requiredApprovals: [{ id: "app_lube", label: "Trigger Lube", requiredRole: "Operator", reason: "Consumes consumables", status: "pending" }]
  },
  {
    id: "tool_magazine_jam",
    name: "Tool Magazine Jam",
    description: "Mechanical obstruction during Automatic Tool Change.",
    modelId: "executive-globe",
    incidentType: "hardware",
    difficulty: "Beginner",
    riskLevel: "High",
    signals: [
      { id: "atc_time", label: "ATC Time", unit: "s", baseline: 1.5, current: 8.5, threshold: 3.0, trend: [1.5, 1.6, 8.5], status: "critical" }
    ],
    recommendations: [
      { id: "rec_abort", title: "Abort Tool Change", summary: "Retract arm to safe position.", confidence: 100.0, expectedImpact: "Prevents mechanical damage.", safetyMode: "approval-required", rationale: ["ATC timeout exceeded."] }
    ],
    evidenceSources: [{ id: "ev_atc", title: "ATC Sensor", type: "sensor", confidence: 100.0 }],
    requiredApprovals: [{ id: "app_abort", label: "Abort ATC", requiredRole: "Operator", reason: "Requires manual reset", status: "pending" }]
  },
  {
    id: "material_hardness_variance",
    name: "Material Hardness Variance",
    description: "Forgings arrive with inconsistent Rockwell hardness, accelerating tool wear.",
    modelId: "qa-inspection-torus",
    incidentType: "quality",
    difficulty: "Intermediate",
    riskLevel: "Medium",
    signals: [
      { id: "spindle_load", label: "Spindle Load", unit: "%", baseline: 40, current: 75, threshold: 60, trend: [40, 42, 65, 75], status: "warning" }
    ],
    recommendations: [
      { id: "rec_speed", title: "Adaptive Feedrate", summary: "Reduce feed by 20% to save tool life.", confidence: 93.0, expectedImpact: "Increases cycle time but saves tool.", safetyMode: "shadow", rationale: ["Load variance indicates material change."] }
    ],
    evidenceSources: [{ id: "ev_load", title: "Load Monitor", type: "sensor", confidence: 96.0 }],
    requiredApprovals: [{ id: "app_feed", label: "Reduce Feed", requiredRole: "Supervisor", reason: "Impacts production schedule", status: "pending" }]
  },
  {
    id: "thermal_asymmetry",
    name: "Thermal Expansion Asymmetry",
    description: "Ambient factory temperature gradients warping the machine bed.",
    modelId: "thermal-heat-field",
    incidentType: "quality",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      { id: "bed_temp_diff", label: "Bed Temp Delta", unit: "°C", baseline: 0.5, current: 4.2, threshold: 2.0, trend: [0.5, 1.2, 3.0, 4.2], status: "critical" }
    ],
    recommendations: [
      { id: "rec_hvac", title: "Adjust Factory HVAC", summary: "Redirect airflow from overhead vents.", confidence: 85.0, expectedImpact: "Normalizes thermal gradient in 2 hours.", safetyMode: "advisory", rationale: ["Ambient sensors detect draft."] }
    ],
    evidenceSources: [{ id: "ev_ambient", title: "Ambient Sensors", type: "sensor", confidence: 90.0 }],
    requiredApprovals: [{ id: "app_hvac", label: "Adjust HVAC", requiredRole: "Facilities", reason: "Affects entire plant", status: "pending" }]
  },
  {
    id: "cmm_calibration_drift",
    name: "CMM Calibration Drift",
    description: "The inspection machine itself is failing, rejecting good parts.",
    modelId: "qa-inspection-torus",
    incidentType: "quality",
    difficulty: "Expert",
    riskLevel: "Critical",
    signals: [
      { id: "scrap_rate", label: "Scrap Rate", unit: "%", baseline: 1.5, current: 18.0, threshold: 5.0, trend: [1.5, 2.0, 10.0, 18.0], status: "critical" }
    ],
    recommendations: [
      { id: "rec_recal", title: "Recalibrate CMM", summary: "Run artifact sphere calibration routine.", confidence: 99.0, expectedImpact: "Validates measurement integrity.", safetyMode: "approval-required", rationale: ["Sudden spike in rejects across all machines."] }
    ],
    evidenceSources: [{ id: "ev_spc", title: "SPC Trends", type: "qa-record", confidence: 98.0 }],
    requiredApprovals: [{ id: "app_recal", label: "Recalibrate", requiredRole: "Quality Manager", reason: "Halts all inspections", status: "pending" }]
  },
  {
    id: "coolant_decay",
    name: "Coolant Concentration Decay",
    description: "Bacterial growth in the sump altering lubricity.",
    modelId: "supply-chain-flow",
    incidentType: "quality",
    difficulty: "Beginner",
    riskLevel: "Low",
    signals: [
      { id: "brix_level", label: "Brix Concentration", unit: "%", baseline: 8.0, current: 4.5, threshold: 6.0, trend: [8.0, 7.5, 5.5, 4.5], status: "warning" }
    ],
    recommendations: [
      { id: "rec_topoff", title: "Auto-Dose Coolant", summary: "Inject neat coolant into sump.", confidence: 95.0, expectedImpact: "Restores lubricity.", safetyMode: "shadow", rationale: ["Refractometer reads low concentration."] }
    ],
    evidenceSources: [{ id: "ev_fluid", title: "Fluid Sensor", type: "sensor", confidence: 99.0 }],
    requiredApprovals: [{ id: "app_dose", label: "Dose Coolant", requiredRole: "Operator", reason: "Consumes inventory", status: "pending" }]
  },
  {
    id: "chip_evacuation",
    name: "Chip Evacuation Failure",
    description: "Swarf build-up scoring the machined surface.",
    modelId: "tool-wear-geometry",
    incidentType: "quality",
    difficulty: "Intermediate",
    riskLevel: "Medium",
    signals: [
      { id: "conveyor_load", label: "Conveyor Load", unit: "%", baseline: 20, current: 95, threshold: 80, trend: [20, 30, 60, 95], status: "critical" }
    ],
    recommendations: [
      { id: "rec_wash", title: "High-Pressure Wash", summary: "Trigger internal washdown cycle.", confidence: 92.0, expectedImpact: "Clears swarf from cutting zone.", safetyMode: "shadow", rationale: ["Conveyor overload implies chip nest."] }
    ],
    evidenceSources: [{ id: "ev_conv", title: "Conveyor Motor", type: "sensor", confidence: 96.0 }],
    requiredApprovals: [{ id: "app_wash", label: "Trigger Wash", requiredRole: "Operator", reason: "Interrupts cycle", status: "pending" }]
  },
  {
    id: "model_drift",
    name: "Predictive Model Drift",
    description: "The predictive wear model loses accuracy over time.",
    modelId: "rag-knowledge-graph",
    incidentType: "ai_system",
    difficulty: "Advanced",
    riskLevel: "High",
    signals: [
      { id: "pred_error", label: "Prediction Error", unit: "%", baseline: 2.0, current: 15.0, threshold: 10.0, trend: [2.0, 3.5, 8.0, 15.0], status: "critical" }
    ],
    recommendations: [
      { id: "rec_retrain", title: "Retrain Model", summary: "Initiate federated learning sync with fleet.", confidence: 98.0, expectedImpact: "Restores predictive accuracy.", safetyMode: "approval-required", rationale: ["Error distribution has shifted significantly."] }
    ],
    evidenceSources: [{ id: "ev_mlops", title: "MLOps Dashboard", type: "simulation", confidence: 100.0 }],
    requiredApprovals: [{ id: "app_retrain", label: "Authorize Retrain", requiredRole: "Data Scientist", reason: "Consumes heavy compute", status: "pending" }]
  },
  {
    id: "ledger_desync",
    name: "Blockchain Ledger Desync",
    description: "The local evidence hash doesn't match the network consensus.",
    modelId: "ledger-blockchain-grid",
    incidentType: "ai_system",
    difficulty: "Expert",
    riskLevel: "Critical",
    signals: [
      { id: "block_height_diff", label: "Block Delta", unit: "blocks", baseline: 0, current: 45, threshold: 5, trend: [0, 2, 10, 45], status: "critical" }
    ],
    recommendations: [
      { id: "rec_resync", title: "Force Resync", summary: "Drop local chain and download from peers.", confidence: 99.0, expectedImpact: "Restores consensus.", safetyMode: "approval-required", rationale: ["Local node is isolated."] }
    ],
    evidenceSources: [{ id: "ev_node", title: "Node Status", type: "procedure", confidence: 100.0 }],
    requiredApprovals: [{ id: "app_resync", label: "Force Resync", requiredRole: "IT Admin", reason: "Deletes local unconfirmed transactions", status: "pending" }]
  },
  {
    id: "rag_hallucination",
    name: "RAG Hallucination Risk",
    description: "High-confidence but contradictory procedures retrieved.",
    modelId: "rag-knowledge-graph",
    incidentType: "ai_system",
    difficulty: "Intermediate",
    riskLevel: "Medium",
    signals: [
      { id: "semantic_conflict", label: "Conflict Score", unit: "%", baseline: 5, current: 85, threshold: 50, trend: [5, 10, 40, 85], status: "critical" }
    ],
    recommendations: [
      { id: "rec_human", title: "Fallback to Human", summary: "Require manual SOP selection.", confidence: 100.0, expectedImpact: "Prevents incorrect procedure execution.", safetyMode: "advisory", rationale: ["Retrieved documents contradict each other."] }
    ],
    evidenceSources: [{ id: "ev_vector", title: "Vector DB Log", type: "simulation", confidence: 95.0 }],
    requiredApprovals: [{ id: "app_manual", label: "Manual Override", requiredRole: "Supervisor", reason: "Bypasses AI advisor", status: "pending" }]
  },
  {
    id: "edge_compute_throttle",
    name: "Edge Compute Throttling",
    description: "The local AI accelerator overheats, dropping frame rates.",
    modelId: "architecture-lattice",
    incidentType: "ai_system",
    difficulty: "Beginner",
    riskLevel: "Medium",
    signals: [
      { id: "gpu_temp", label: "GPU Temp", unit: "°C", baseline: 60, current: 98, threshold: 90, trend: [60, 65, 80, 98], status: "critical" }
    ],
    recommendations: [
      { id: "rec_offload", title: "Cloud Offload", summary: "Route inference to cloud cluster.", confidence: 94.0, expectedImpact: "Restores 60fps inference.", safetyMode: "shadow", rationale: ["Thermal throttling detected on local Edge TPU."] }
    ],
    evidenceSources: [{ id: "ev_tpu", title: "TPU Telemetry", type: "sensor", confidence: 100.0 }],
    requiredApprovals: [{ id: "app_cloud", label: "Enable Cloud", requiredRole: "IT Admin", reason: "Increases network bandwidth usage", status: "pending" }]
  }
];
