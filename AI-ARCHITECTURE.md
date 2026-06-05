# TN Precision AI: OpenAI Integration Blueprint

The current Nakashima-Tsubaki Command Center operates as a **Deterministic Lab Simulator**. This means incidents, RAG contexts, and agent swarms execute predictably via state machines and seeded data to guarantee a safe, reviewable operator experience.

To transition from a "Simulation" to "Live Cognition", this blueprint outlines how we will seamlessly inject OpenAI models (specifically `gpt-4o` and `text-embedding-3-small`) into the architecture without compromising the critical **Advisory-First Governance** rails.

## 1. RAG Knowledge Console Migration

**Current State**: The `/rag` dashboard uses a hardcoded array of `DocumentMetadata` and simulated vector matching metrics.
**Future State (OpenAI)**:
- **Vector Database**: Connect the application to a Pinecone or Supabase pgvector instance.
- **Embeddings Pipeline**: When an incident occurs (e.g., Thermal Variance), we take the raw sensor data and pass it through the OpenAI `text-embedding-3-small` model.
- **Retrieval**: We query the vector store for the top 5 most relevant SOPs, Maintenance Manuals, or ISO 9001 compliance standards.
- **Synthesis**: We use the Next.js AI SDK (`generateText`) calling `gpt-4o` to summarize the retrieved context into the "Evidence Packet" you see on the dashboard today.

## 2. Multi-Agent Swarm Logic

**Current State**: Swarm agents orbit DOM elements and output pre-written status messages (`Awaiting orders`, `Locking target`).
**Future State (OpenAI)**:
- **Agent Orchestration**: Utilize the OpenAI Assistants API or a LangChain graph to manage the swarm.
- **Dynamic Goals**: When you type `spawn anomaly-hunter 3` in the terminal, the command is sent to `gpt-4o` as a system prompt. The model decides which active telemetry components require investigation.
- **Function Calling**: The agents use OpenAI Function Calling to physically trigger simulator events (e.g., `{"name": "trigger_thermal_alert"}`). The UI reacts to the model's function calls in real-time.

## 3. Advisory Automation Workflow

**Current State**: The `/advisory` node graph steps through hardcoded decisions (Approve -> Shadow Write -> Evaluate).
**Future State (OpenAI)**:
- **Dynamic Playbooks**: Instead of a static flow, the AI generates the node graph dynamically. 
- **Human-in-the-Loop Constraint**: Even when using `gpt-4o` to generate the remediation plan (e.g., "Decrease spindle speed by 15%"), the architecture enforces that the action remains a *Draft Proposal*. 
- The operator must cryptographically sign off on the UI before the AI is permitted to execute the actual machine command via OPC UA.

## 4. The Architecture Layer Cake

1. **Presentation (Current Repo)**: React, Tailwind, Framer Motion, Three.js WebGL Twins.
2. **State Management (Current Repo)**: Zustand (`useSimulatorStore`, `useAgentSwarmStore`).
3. **Cognitive Routing (Upcoming)**: Next.js API Routes + AI SDK + `gpt-4o`.
4. **Memory (Upcoming)**: Supabase PostgreSQL + pgvector.
5. **Physical Layer (Future Edge)**: MQTT / Sparkplug / OPC UA bridging the web commands to the physical PLCs.

*Nakashima-Tsubaki: Building the Future of Cyber-Physical Industry.*
