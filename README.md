# Tsubaki-Nakashima AI Digital Twin 🚀

![Executive Overview](https://raw.githubusercontent.com/zrt219/tsubaki-nakashima-ai/main/docs/overview.png)

Welcome to the **Tsubaki-Nakashima AI Command Center**. This is an enterprise-grade, closed-loop Cyber-Physical System (CPS) built to ingest live CNC machine telemetry, visualize it in real-time using React Three Fiber, and utilize Agentic AI (Google Gemini 2.5 Pro) to autonomously analyze and physically adjust the machine state.

**Live Production URL:** [https://tsubaki-nakashima-ai-67fz54661-zrt219s-projects.vercel.app/](https://tsubaki-nakashima-ai-67fz54661-zrt219s-projects.vercel.app/)

## 🏗️ Architecture

This project spans from the Edge to the Cloud:

1. **The Edge Simulator (`/scripts/simulator.js`)**: Streams live, randomized IoT telemetry (Spindle Speed, Thermal Drift, Vibration) over mTLS using provisioned X.509 certificates directly to AWS.
2. **The AWS Nervous System**: AWS IoT Core catches the MQTT stream. An IoT Topic Rule automatically triggers an AWS Lambda function.
3. **The Supabase Memory**: The Lambda function bridges the data into a Supabase PostgreSQL database via REST, establishing an immutable historical state.
4. **The Vercel Application**: A Next.js 16 (Turbopack) dashboard visualizes the live Supabase streams in an immersive dark-mode UI.
5. **The Gemini Brain**: Gemini 2.5 Pro connects via a serverless `/api/chat` route. It reads the telemetry and has **Function Calling** capabilities to issue physical commands back to the CNC machine.
6. **The Safety Gate**: A strict Human-in-the-Loop mechanism. When the AI attempts to fire an action, the UI throws an "Operator Approval Required" modal. No physical adjustments happen without explicit human consent.

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   AWS Account (IoT Core & Lambda)
*   Supabase Account
*   Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/zrt219/tsubaki-nakashima-ai.git

# Install dependencies
npm install

# Start the simulator to blast data to AWS
node scripts/simulator.js

# Start the Next.js Command Center
npm run dev
```

## 🛠️ Built With

*   **Next.js 16 (Turbopack)** - Framework
*   **React Three Fiber** - 3D Digital Twin rendering
*   **AWS IoT Core & Lambda** - Edge-to-Cloud message brokering
*   **Supabase** - PostgreSQL Database
*   **Google Gemini 2.5 Pro** - Agentic Copilot
*   **Tailwind CSS** - Styling
*   **Vercel** - Production Deployment

## 📜 The Epic Journey

Check out our massive post-mortem documentation in the `docs/` folder to read the exhaustive history of every bug, feature, and architectural decision we made to get this closed-loop system into production.

---
*Built with 💙 by [@zrt219](https://github.com/zrt219)*
