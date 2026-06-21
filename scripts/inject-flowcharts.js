const fs = require('fs');

const readmePath = 'README.md';
let content = fs.readFileSync(readmePath, 'utf8');

const diagrams = {
  1: `
#### Architecture Flow
\`\`\`mermaid
graph TD
    subgraph Edge Devices
        S1[Vibration Sensor] -->|100Hz MQTT| Gateway
        S2[Temp Sensor] -->|10Hz MQTT| Gateway
        S3[Acoustic Sensor] -->|High-Freq| Gateway
    end
    Gateway[Edge Gateway Node] -->|WebSocket WSS| Redis[(In-Memory Redis)]
    Redis --> WebGL[Three.js Spindle Render]
    Redis --> Sparkline[Time-Series Sparklines]
    Redis --> OEE[OEE Calculation Engine]
    OEE --> Overview[Dashboard UI]
\`\`\`
`,
  2: `
#### Adoption State Machine
\`\`\`mermaid
stateDiagram-v2
    [*] --> Phase1_ShadowMode
    state Phase1_ShadowMode {
        Log[Log Telemetry]
        AI[AI Generates Output]
        NoAct[NO Actuation Allowed]
    }
    Phase1_ShadowMode --> Phase2_AdvisoryMode: >90 Days Baseline
    state Phase2_AdvisoryMode {
        AIPrompt[AI Proposes Action]
        Human[Human Verification]
        Action[Actuation]
        AIPrompt --> Human: Req Approval
        Human --> Action: Cryptographic Sign-Off
    }
    Phase2_AdvisoryMode --> Phase3_AutonomousMode: Governance Unlock
    state Phase3_AutonomousMode {
        AIAct[AI Direct Actuation]
        Bounds[Deterministic Safety Bounds]
        AIAct --> Bounds
        Bounds --> Act[Machine Execution]
    }
\`\`\`
`,
  3: `
#### RAG Data Pipeline
\`\`\`mermaid
flowchart LR
    subgraph Data Sources
        PDFs[Academic PDFs] --> Parser[PDF Extract]
        Manuals[Machine Manuals] --> Parser
    end
    Parser --> Chunks[Text Chunking]
    Chunks --> Embedding[Embedding Model]
    Embedding --> VectorDB[(Vector DB)]
    
    UserQuery[User/System Query] --> QueryEmbed[Query Embedding]
    QueryEmbed --> VectorDB
    VectorDB -->|Top K Results| Context[Context Synthesis]
    Context --> LLM[Gemini 2.5]
    LLM --> Response[Augmented Response]
\`\`\`
`,
  4: `
#### Cyber-Physical Sync
\`\`\`mermaid
graph TD
    Physical[Physical CNC Machine] -- Sensor Data --> DAQ[Data Acquisition]
    DAQ -- 100Hz Stream --> TwinEngine[Digital Twin Engine]
    TwinEngine -- Transforms --> 3DModel[Three.js Cyber Representation]
    TwinEngine -- Analyzes --> PFInterval{P-F Curve Check}
    PFInterval -- Potential Failure --> Alert[Predictive Alert]
    PFInterval -- Healthy --> Log[State Ledger]
    3DModel --> UI[React Canvas UI]
\`\`\`
`,
  5: `
#### Ledger Transaction Flow
\`\`\`mermaid
sequenceDiagram
    participant Sensor
    participant Edge
    participant SmartContract
    participant IPFS
    
    Sensor->>Edge: Telemetry Hash
    Edge->>IPFS: Store Raw Data Payload
    IPFS-->>Edge: Returns CID
    Edge->>SmartContract: Anchor CID + Timestamp + Signature
    SmartContract-->>Edge: TxHash Confirmed
    Edge->>UI: Update Ledger Dashboard
\`\`\`
`,
  6: `
#### HITL Decision Matrix
\`\`\`mermaid
flowchart TD
    Anomaly[Anomaly Detected] --> AI[AI Agent Analysis]
    AI --> Proposal[Draft Mitigation Strategy]
    Proposal --> UI[Display to Operator]
    UI -->|Human Reviews| Decision{Approved?}
    Decision -- Yes --> Sign[Apply Crypto Signature]
    Sign --> PLC[Send to PLC / Actuator]
    Decision -- No --> Reject[Log Rejection + Reason]
    Reject --> FineTune[Model Reinforcement Loop]
\`\`\`
`,
  7: `
#### Deterministic Bounds Checking
\`\`\`mermaid
graph TD
    AI[AI Decision Output] --> Parser[Action Parser]
    Parser --> Policy[Governance Engine]
    
    subgraph Safety Bounds
        Policy --> Spindle{RPM < 8000?}
        Policy --> Temp{Temp < 95°C?}
        Policy --> Axis{Z-Axis Limit?}
    end
    
    Spindle -- Pass --> Temp
    Temp -- Pass --> Axis
    Axis -- Pass --> Execute[Send to Hardware]
    
    Spindle -- Fail --> Block[HARD REJECT]
    Temp -- Fail --> Block
    Axis -- Fail --> Block
\`\`\`
`,
  8: `
#### Purdue Model Bridge
\`\`\`mermaid
graph TD
    subgraph L0-L1: Physical & Control
        Sensors --> PLC[Programmable Logic Controllers]
    end
    subgraph L2-L3: Supervisory & Operations
        PLC --> SCADA[SCADA / HMI]
        SCADA --> MES[Manufacturing Execution System]
    end
    subgraph L4-L5: Enterprise & Cloud
        MES --> DMZ[Industrial DMZ]
        DMZ --> Cloud[Cognitive AI Cloud]
    end
    Cloud -.->|Advisory/Control via Bridge| DMZ
\`\`\`
`,
  9: `
#### OEE Calculation Graph
\`\`\`mermaid
flowchart LR
    UpTime[Uptime Data] --> Avail[Availability Calc]
    Cycle[Cycle Time Data] --> Perf[Performance Calc]
    Defects[Defect Count] --> Qual[Quality Calc]
    
    Avail --> OEE{OEE Engine}
    Perf --> OEE
    Qual --> OEE
    
    OEE --> Score[76.5% Overall Score]
    Score --> Threshold{< 80% ?}
    Threshold -- Yes --> Alert[Trigger Maintenance Agent]
\`\`\`
`,
  10: `
#### Edge Vision QA
\`\`\`mermaid
flowchart TD
    Camera[Industrial Camera 4K] --> PreProc[Image Pre-Processing]
    PreProc --> EdgeInference[Edge Vision Model]
    EdgeInference --> Box[Bounding Box / Segmentation]
    Box --> Score{Confidence > 95%?}
    Score -- Yes --> Pass[Part Approved]
    Score -- No --> Inspect[Flag for Human Inspection]
    Inspect --> UI[QA Dashboard Alert]
\`\`\`
`,
  11: `
#### Multi-Agent Swarm Topology
\`\`\`mermaid
graph TD
    Main[Orchestrator Agent] --> RAG[Research/RAG Agent]
    Main --> Vision[Vision/QA Agent]
    Main --> Control[Control/PLC Agent]
    
    RAG -.->|Context| Main
    Vision -.->|Visual Anomalies| Main
    Control -.->|Hardware Limits| Main
    
    Main --> Synthesize[Synthesized Strategy]
\`\`\`
`
};

let lines = content.split('\n');
let newLines = [];
let currentModule = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const match = line.match(/^### Module (\d+):/);
  if (match) {
    currentModule = parseInt(match[1]);
  }
  
  if (line.startsWith('**Academic Foundation:**') && currentModule > 0 && currentModule <= 11) {
    if (diagrams[currentModule]) {
      newLines.push(diagrams[currentModule]);
      // Remove it from the dictionary so we don't insert it twice
      diagrams[currentModule] = null;
    }
  }
  
  newLines.push(line);
}

fs.writeFileSync(readmePath, newLines.join('\n'));
console.log('Injected Mermaid diagrams successfully.');
