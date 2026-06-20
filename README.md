# TN Precision AI Command Center

![Command Center](file:///C:/Users/Zhane/.gemini/antigravity/brain/3dbec49a-11f9-422f-aa64-3259d83da3f1/command_center_overview_1781958567124.png)

An interactive, educational platform demonstrating the convergence of Cyberphysical Digital Twins, Double-Edge Automations, Recursive Memory AI, and Immutable Blockchain Auditing. 

This project is built to teach and showcase industrial edge intelligence without requiring access to a live factory floor. Everything runs in deterministic simulation or against public blockchain testnets.

## Features & Educational Modules

### 1. The Interactive Playground & Learning Mode
Toggle the **Learning Mode** from the main dashboard to reveal `Academic Overlays`. These overlays provide citations to real IEEE and arXiv research papers (2024-2026), explaining the theoretical mathematics and architectures behind the components you interact with.

### 2. Double-Edge Cyberphysical Automations
Experience how edge computing algorithms detect anomalies and synchronize state.
- Launch the **Twin Simulator** to run scenarios.
- See how **Recursive Memory** allows the system to remember previous overrides, dynamically updating its baseline recommendations when similar faults occur.

### 3. Integrated Smart Contract Policy Editor
![Smart Contract IDE](file:///C:/Users/Zhane/.gemini/antigravity/brain/3dbec49a-11f9-422f-aa64-3259d83da3f1/solidity_ide_overview_1781958580622.png)
Write, compile, and deploy governance policies natively in the browser.
- **Built-in `solc` Compilation**: Compiles your smart contracts on the fly via a Next.js proxy.
- **Multi-Chain Deployment**: Choose to deploy to the **XRPL EVM Sidechain** or the **Hedera EVM Testnet**. 
- **Local Private Keys**: Your private key is entirely ephemeral and never touches a database. Transactions are signed locally using `ethers.js` before being broadcasted via local API proxies to bypass CORS restrictions.

### 4. Deterministic Blockchain Anchoring
Industrial IoT data should remain private, but its existence must be proven. 
- In `/iot-maker`, dispatch commands that generate deterministic SHA-256 hashes of system states.
- The system anchors these hashes securely to public decentralized ledgers, proving state at a specific timestamp without revealing the underlying telemetry.

## Quick Start

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and configure your Supabase, Hedera, and XRPL credentials.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` to enter the Command Center.

## Tech Stack
- **Framework**: Next.js 14 App Router, React, Tailwind CSS, Framer Motion
- **IDE**: `@monaco-editor/react`, `ethers.js`, `solc`
- **Database**: Supabase (Postgres, RLS, Edge Functions)
- **Blockchain APIs**: HashIO (Hedera), XRPL EVM Sidechain Testnet

---
*Developed as a showcase for Advanced Agentic Coding.*
