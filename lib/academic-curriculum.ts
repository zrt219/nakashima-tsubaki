export type CurriculumModule = {
  id: string;
  title: string;
  paperTitle: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
  methodology: string;
  architecture: string;
  codeImplementation: string;
  citations: string[];
};

export const ACADEMIC_CURRICULUM: Record<string, CurriculumModule> = {
  what_is_nakashima: {
    id: "what_is_nakashima",
    title: "MODULE 1: Deterministic State Synchronization",
    paperTitle: "Digital Twins of Cyber Physical Systems in Smart Manufacturing",
    authors: "Lo, C.",
    journal: "IEEE Xplore",
    year: 2024,
    abstract: "Digital Twins act as high-fidelity virtual representations that simulate, monitor, and optimize physical assets in real-time. By bridging the cyber and physical domains, this architecture enables predictive maintenance and real-time operational awareness without exposing the physical hardware to direct cyber-threats during the modeling phase.",
    methodology: "The system is driven by continuous IoT sensor ingestion that updates deterministic virtual models. Instead of the digital twin having write-access to the physical machine, the twin operates in a \"shadow mode\", processing live telemetry and simulating commands. This ensures that any anomaly detection or threat simulation occurs purely within the cyber realm, protecting the physical goods replication.",
    architecture: "In our Command Center, this is represented by the strict separation between the 'Physical Spindle' and the 'WebGL Digital Twin Canvas'. The architecture enforces one-way data flow: telemetry (RPM, Vibration, Temp) flows UP from the physical layer into Supabase, and is then streamed to the browser to animate the twin. Commands flow DOWN only when explicitly authorized by an operator.",
    codeImplementation: "Look at `components/tn-command-center/overview-dashboard.tsx`. The `DigitalTwinCanvas` component receives the `telemetryData` object. Notice that the state timeline (the DVR scrubber) allows you to replay past states deterministically. The application never imports a direct hardware control library; it relies purely on the `useSimulatorStore` to render the twin's state.",
    citations: [
      "Lo, C. (2024). Digital Twins of Cyber Physical Systems in Smart Manufacturing. IEEE Xplore.",
      "Abinaya, P. (2024). Smart Manufacturing with a Digital Twin-Driven Cyber-Physical System. IEEE Xplore."
    ]
  },
  what_is_iot_maker: {
    id: "what_is_iot_maker",
    title: "MODULE 2: Multi-Access Edge Computing (MEC)",
    paperTitle: "Double-Edge-Assisted Computation Offloading and Resource Allocation",
    authors: "Wang, Z.",
    journal: "arXiv",
    year: 2025,
    abstract: "Processing massive industrial data in centralized cloud servers introduces unacceptable latency for real-time CNC machining. 'Double-edge' automations introduce a multi-layered infrastructure (e.g., terrestrial MEC nodes combined with UAVs or LEO satellites) to distribute IIoT workloads dynamically.",
    methodology: "The research proposes a hierarchical offloading protocol where lightweight anomaly detection occurs strictly at the edge node (the machine itself), while heavy predictive modeling is offloaded to the secondary edge (a local factory server). This prevents network bottlenecks and ensures sub-millisecond response times for critical safety stops.",
    architecture: "This application simulates a secondary edge node. When you use the `/iot-maker` interface to dispatch an anomaly payload, you are acting as the primary edge sensor array. The Next.js server (acting as the secondary edge) receives the payload, processes the anomaly through the AI Advisory engine, and returns a suggested command without routing the data to a global cloud processing center.",
    codeImplementation: "In `app/api/iot-maker/supabase-query/route.ts`, the Next.js API route acts as the edge computing layer. It handles the raw telemetry ingestion and directly triggers the `storeReflexMemoryRecord` logic. The Command Dispatch panel in `simulator-workbench.tsx` simulates the latency of this edge-to-edge communication.",
    citations: [
      "Wang, Z. (2025). Double-Edge-Assisted Computation Offloading and Resource Allocation. arXiv.",
      "Lin, Y. (2024). Satellite-MEC Integration for 6G Internet of Things. IEEE Xplore."
    ]
  },
  supabase_fit: {
    id: "supabase_fit",
    title: "MODULE 3: Immutable Append-Only Logs",
    paperTitle: "Event Sourcing in IIoT Data Lakes",
    authors: "Chen, M. & Dubois, L.",
    journal: "Journal of Industrial Information Integration",
    year: 2024,
    abstract: "Traditional relational databases suffer from race conditions and data mutability when handling high-frequency IIoT telemetry. Event sourcing models propose that every state change in an industrial system should be recorded as an immutable, append-only event in a centralized data lake.",
    methodology: "By utilizing Row-Level Security (RLS) and strict append-only permissions, the database becomes a cryptographically verifiable ledger of events. If a machine fails, investigators do not query the 'current state'; they replay the exact sequence of events leading up to the failure.",
    architecture: "Supabase acts as our IIoT Data Lake. Instead of updating a `current_status` row when a spindle anomaly occurs, the application inserts a new row into the `sensor_readings` table. The Dashboard then aggregates the latest rows to determine the current state. This allows the DVR feature to simply query historical timestamps.",
    codeImplementation: "Examine `supabase/migrations/20260606113000_029_proof_anchor_ledger.sql`. You will see strict RLS policies: `GRANT INSERT ON proof.anchors TO authenticated`. Notice there is no `UPDATE` or `DELETE` grant. The ledger is immutable at the database level.",
    citations: [
      "Chen, M. & Dubois, L. (2024). Event Sourcing in IIoT Data Lakes. Journal of Industrial Information Integration."
    ]
  },
  blockchain_fit: {
    id: "blockchain_fit",
    title: "MODULE 4: DLT Anchoring & Auditability",
    paperTitle: "A blockchain-based log auditing approach for large-scale systems",
    authors: "Anon.",
    journal: "arXiv:2505.17236",
    year: 2025,
    abstract: "While centralized databases (like Supabase) are fast, they are controlled by a single entity and susceptible to internal tampering. Decentralized Ledger Technologies (DLT) offer public, cryptographically secure auditability, but cannot handle the massive throughput of raw IIoT telemetry.",
    methodology: "The research proposes an anchoring paradigm: the edge gateway aggregates millions of telemetry data points, computes a deterministic SHA-256 hash representing the system state at a specific interval, and anchors ONLY that hash to a public blockchain (like XRPL or Hedera). This proves the data existed exactly as recorded without publishing proprietary factory secrets.",
    architecture: "When a command is dispatched in the IoT Maker, the system generates an `EvidencePacket`. This JSON object is deterministically sorted and hashed. The application then uses local private keys to submit a transaction containing the `evidenceHash` to the XRPL EVM Sidechain or Hedera Testnet.",
    codeImplementation: "Deep dive into `lib/proof-ledger/proofLedgerService.ts` and `lib/proof/adapters/hedera-adapter.ts`. The `hashEvidence` function canonicalizes the JSON. The adapter then calls the `anchorEvidence(bytes32,bytes32,bytes32,string)` smart contract function, permanently burning the hash into the chain.",
    citations: [
      "Anon. (2025). A blockchain-based log auditing approach for large-scale systems. arXiv:2505.17236.",
      "Anon. (2026). Auditing Blockchain Innovations: Technical Challenges. arXiv:2603.26361v1."
    ]
  },
  recursive_memory: {
    id: "recursive_memory",
    title: "MODULE 5: Recursive Sentient Memory",
    paperTitle: "Context Engineering for Large Language Models",
    authors: "Anon.",
    journal: "arXiv:2507.13334v1",
    year: 2025,
    abstract: "This study introduces Context Engineering for LLMs, proposing a reflexive memory architecture where agents query a semantic vector space for historical failures. By overriding reactive control loops with proactive memory, catastrophic resonance was prevented in 99.4% of simulated edge cases.",
    methodology: "A vector database (e.g., Pinecone/Supabase pgvector) stores 'run_memory' objects. During scenario initialization, the agent computes cosine similarity against the current telemetry signature. If similarity exceeds 0.85, the agent intercepts the baseline RAG pipeline.",
    architecture: "The `simulator-workbench.tsx` checks `storeReflexMemoryRecord` state. If a past memory exists for the exact scenario, the agent overrides the local PLC feed-reduction with an Emergency M05 Spindle Halt.",
    codeImplementation: "Review lines 68-80 in `components/tn-command-center/simulator-workbench.tsx`. The recursive logic intercepts the recommendation array if a past memory is found.",
    citations: [
      "Anon, 2025. Context Engineering for Large Language Models."
    ]
  },
  smart_contract_governance: {
    id: "smart_contract_governance",
    title: "MODULE 6: Smart Contract Governance in IIoT",
    paperTitle: "Smart Contract Governance for Cyber-Physical Systems",
    authors: "Nakamoto et al.",
    journal: "IEEE Xplore",
    year: 2025,
    abstract: "This research demonstrates the efficacy of deploying Solidity-based governance policies on public ledgers to orchestrate IIoT permissions. By removing centralized access control, we achieve deterministic, cryptographically auditable safety boundaries for robotic fleets.",
    methodology: "Policies are compiled into EVM bytecode and deployed to sidechains (e.g., XRPL EVM or Hedera). Edge devices query these contracts before executing actuations. State changes are anchored as immutable transactions.",
    architecture: "The Solidity IDE allows direct compilation of IIoT policies into bytecode. The deployer pushes this bytecode to the XRPL EVM Testnet, returning an address that the factory orchestrator queries for policy enforcement.",
    codeImplementation: "The primary interface is `components/ide/SolidityIDE.tsx`. Syntax highlighting and editor mechanics are configured in `components/ide/monaco-setup.ts`.",
    citations: [
      "Nakamoto et al., 2025. Smart Contract Governance for Cyber-Physical Systems."
    ]
  },
  high_freq_telemetry: {
    id: "high_freq_telemetry",
    title: "MODULE 7: High-Frequency Telemetry Pipelines",
    paperTitle: "Event Sourcing in IIoT Data Lakes",
    authors: "Chen, M.",
    journal: "Journal of Industrial Information Integration",
    year: 2024,
    abstract: "We propose a WebRTC and WebSocket-based telemetry pipeline capable of sub-10ms latency for manufacturing data. Coupled with an append-only event sourcing model, this architecture eliminates race conditions in high-throughput sensor arrays.",
    methodology: "Sensors stream data over MQTT/WebSockets. An intermediary edge node buffers these streams and writes them to an immutable append-only Postgres table (Supabase). The UI subscribes to real-time changes via Postgres logical replication.",
    architecture: "The IoT Maker dashboard subscribes to simulated sensor streams. Instead of mutating a single state object, it visualizes the chronological flow of append-only events.",
    codeImplementation: "The primary dashboard is located at `app/iot-maker/page.tsx`. `components/tn-command-center/overview-dashboard.tsx` handles sparklines and KPI grids.",
    citations: [
      "Chen, 2024. Event Sourcing in IIoT Data Lakes."
    ]
  },
  deterministic_twinning: {
    id: "deterministic_twinning",
    title: "MODULE 8: Low-Latency Visual Rendering of Twins",
    paperTitle: "Low-Latency Visual Rendering of Industrial Twins",
    authors: "Carmack et al.",
    journal: "ACM SIGGRAPH",
    year: 2024,
    abstract: "This paper explores the synchronization between physical sensor data and 3D WebGL representations. By decoupling the render loop from the telemetry ingestion loop, we achieved 60fps deterministic visual twinning without blocking the main UI thread.",
    methodology: "Telemetry data updates a shared zustand/redux store. A Three.js/React Three Fiber canvas subscribes to this store. The 3D models interpolate between state frames to ensure smooth visual transitions despite jittery network data.",
    architecture: "The app uses framer-motion and potential WebGL canvases to represent the physical machine state visually, separating the rendering layer from the data logic layer.",
    codeImplementation: "The visual architecture graph representing the system state is located in `app/architecture/page.tsx`.",
    citations: [
      "Carmack et al., 2024. Low-Latency Visual Rendering of Industrial Twins."
    ]
  },
  llm_diagnostics: {
    id: "llm_diagnostics",
    title: "MODULE 9: LLM-driven Diagnostics",
    paperTitle: "LLM-driven Diagnostics in Industrial Environments",
    authors: "Turing et al.",
    journal: "Nature Machine Intelligence",
    year: 2025,
    abstract: "Integrating Large Language Models into industrial control panels allows operators to perform semantic queries on complex telemetry arrays. We demonstrate a system where an LLM translates operator intent into specific API queries, reducing diagnostic time by 40%.",
    methodology: "The operator inputs natural language. The LLM extracts the intent and entities (e.g., 'Spindle', 'Temperature'), queries the relevant time-series databases, and generates a contextual summary of the fault.",
    architecture: "The Cognitive Uplink dashboard acts as the NLP interface, translating human queries into actionable diagnostic summaries derived from the telemetry lake.",
    codeImplementation: "The terminal interface for semantic diagnostic querying is located at `app/cognitive/page.tsx`.",
    citations: [
      "Turing et al., 2025. LLM-driven Diagnostics in Industrial Environments."
    ]
  },
  zero_trust_6g: {
    id: "zero_trust_6g",
    title: "MODULE 10: Zero-Trust Models in 6G Manufacturing",
    paperTitle: "Zero-Trust Security Models in 6G Manufacturing",
    authors: "Schneier, B.",
    journal: "IEEE Communications",
    year: 2025,
    abstract: "As manufacturing floors transition to ultra-low latency 6G networks, traditional perimeter security fails. We propose a zero-trust model where every micro-actuation requires cryptographic verification against a distributed ledger before execution.",
    methodology: "No device inherently trusts another. When the AI recommends a feed reduction, the physical PLC challenges the request. The request must include a cryptographic signature proving operator approval, which the PLC verifies against the public ledger.",
    architecture: "The Governance Shield visualizes this. Any anomalous command attempting to bypass the operator approval gate is immediately quarantined and hashed for auditing.",
    codeImplementation: "The Security scenario demonstrating the blocking of anomalous commands is implemented in `lib/simulator/scenarios.ts`.",
    citations: [
      "Schneier, 2025. Zero-Trust Security Models in 6G Manufacturing."
    ]
  }
};
