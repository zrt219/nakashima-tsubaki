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
    title: "MODULE 5: Recursive Sentient Memory Loops",
    paperTitle: "A Survey of Context Engineering for Large Language Models",
    authors: "Anon.",
    journal: "arXiv:2507.13334v1",
    year: 2025,
    abstract: "Current autonomous AI agents suffer from context degradation over long horizons. By engineering 'recursive memory loops', agents can consolidate specific episodic instances of failure into generalized semantic knowledge, allowing them to dynamically alter their baseline logic when encountering similar scenarios.",
    methodology: "Instead of relying purely on fixed prompt instructions or stateless attention mechanisms, the agent maintains an external 'Reflex Memory' database. Before dispatching a command, the agent queries this memory for semantic matches to the current anomaly. If a match is found where a previous action failed, the agent preemptively overrides its standard protocol.",
    architecture: "In our Command Center, if you run the 'Finish Turning' scenario and inject an anomaly, the AI suggests reducing feed rate. If you accept and it fails, that failure is saved to the Reflex Memory index. The next time you run that exact scenario, the AI intercepts the memory loop and suggests a full spindle halt instead.",
    codeImplementation: "Review `components/tn-command-center/simulator-workbench.tsx`. During the simulation loop, it calls `loadReflexMemoryRecords(scenarioId)`. If a memory exists matching the current context, the `hasOverride` flag is thrown, completely changing the UI and the dispatch payload.",
    citations: [
      "Anon. (2025). A Survey of Context Engineering for Large Language Models. arXiv:2507.13334v1.",
      "Anon. (2026). A Platform for Evaluating Long-Horizon Multi-Agent Systems. arXiv:2606.08367v1."
    ]
  }
};
