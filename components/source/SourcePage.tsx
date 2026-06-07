"use client";

import { SourceCategory } from "@/components/source/SourceCategory";
import { SourceCard } from "@/components/source/SourceCard";
import { ArchitectureClaimCard } from "@/components/source/ArchitectureClaimCard";
import { Panel } from "@/components/tn-command-center/command-center-primitives";

const tsubakiClaims: Array<{ claim: string; source: string; warning?: string }> = [
  {
    claim: "This prototype demonstrates a production-minded architecture for advisory cyber-physical AI.",
    source: "Tsubaki-Nakashima context framing",
  },
  {
    claim: "Precision manufacturing concerns are modeled as simulations and telemetry-driven events, not live machine control.",
    source: "Domain model assumptions",
  },
];

const sourceGroups = [
  {
    id: "tn",
    title: "Tsubaki-Nakashima Context",
    cards: [
      {
        title: "Industrial precision manufacturing framing",
        url: "https://github.com/zrt219/tsubaki-nakashima-ai",
        claimSupported:
          "Explains the target domain: precision balls, rollers, blowers, quality checks, and deployment risk.",
        limitation:
          "No official Tsubaki-Nakashima deployment claims are made in this prototype.",
        usageNotes: "Inspired by the domain context. This is a modelled internal architecture.",
      },
      {
        title: "Safety-first commissioning posture",
        url: "https://www.nist.gov/industrial-control-systems",
        claimSupported:
          "Maps advisory recommendation to approval-before-action patterns used in operational system design discussions.",
        limitation: "Not a certified ICS safety standard; implementation is a portfolio prototype.",
        usageNotes: "Prototype assumption, demo mode, proof and audit-first architecture.",
      },
    ],
  },
  {
    id: "supabase",
    title: "Supabase / PostgreSQL",
    cards: [
      {
        title: "Supabase docs",
        url: "https://supabase.com/docs",
        claimSupported: "Server-side state, row-level event records, and schema-driven queries.",
        limitation: "RLS and service role boundaries are project specific and must be enforced by deployment policy.",
        usageNotes: "Used for operational telemetry and command/approval audit tables in this prototype.",
      },
      {
        title: "Supabase Auth and service roles",
        url: "https://supabase.com/docs/guides/auth",
        claimSupported: "Client-safe public keys and server-only service role usage patterns.",
        limitation: "Service role keys are never exposed to browser bundles in this app.",
        usageNotes: "Inspired by RLS-first and server-bound writes.",
      },
    ],
  },
  {
    id: "aws_iot",
    title: "AWS IoT / MQTT",
    cards: [
      {
        title: "AWS IoT Core docs",
        url: "https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html",
        claimSupported: "Broker orientation for telemetry + command topics.",
        limitation:
          "Telemetry and command topics are marked optional in this prototype and run under mocked defaults.",
        usageNotes: "AWS IoT remains the broker path in connected deployment mode only.",
      },
      {
        title: "MQTT protocol model",
        url: "https://mqtt.org/documentation/",
        claimSupported: "Topic-based publish-subscribe model for decoupled edge-cloud messaging.",
        limitation: "Not a deployment-grade security review for production PLC network integration.",
        usageNotes: "Used as a reference for simulator broker behavior.",
      },
    ],
  },
  {
    id: "gemini",
    title: "Gemini / Function calling",
    cards: [
      {
        title: "Google AI Studio docs",
        url: "https://ai.google.dev/docs",
        claimSupported:
          "Structured output and function-calling behavior for advisory proposals.",
        limitation: "No tool execution happens directly inside the model; app server validates proposals.",
        usageNotes: "Used as the advisory model path in connected test mode.",
      },
      {
        title: "Gemini API tool use",
        url: "https://ai.google.dev/guides/tools",
        claimSupported: "Tool declaration and structured argument extraction pattern.",
        limitation: "Model outputs can be malformed and must be validated by app checks.",
        usageNotes: "Function call proposals are logged and gated.",
      },
    ],
  },
  {
    id: "xrpl",
    title: "XRPL Testnet Anchoring",
    cards: [
      {
        title: "XRPL Testnet endpoints",
        url: "https://xrpl.org/resources/dev-tools/xrp-testnet-faucet.html",
        claimSupported: "Public testnet connectivity for non-production proof anchoring.",
        limitation: "Testnet state is mutable and restartable.",
        usageNotes: "Proof layer only: evidence hashes are submitted in memo fields.",
      },
      {
        title: "XRPL transaction memos",
        url: "https://xrpl.org/docs/concepts/transactions/transaction-metadata/",
        claimSupported: "Memo serialization limits and transaction payload constraints.",
        limitation: "No raw telemetry or command payload is sent on-chain.",
        usageNotes: "Only compact packet hashes are embedded.",
      },
    ],
  },
  {
    id: "hedera",
    title: "Hedera Testnet Anchoring",
    cards: [
      {
        title: "Hedera JSON-RPC docs",
        url: "https://docs.hedera.com/hedera/core-concepts/smart-contracts",
        claimSupported: "Chain id and EVM-style smart-contract interaction for proof anchoring.",
        limitation: "This remains testnet-oriented and does not control operations.",
        usageNotes: "Used through `anchorEvidence(runId,evidenceHash,eventType,uri)` in mock-safe mode.",
      },
      {
        title: "Hedera testnet details",
        url: "https://docs.hedera.com/hedera/sdks-and-apis/getting-started/overview",
        claimSupported: "Contract-call execution and transaction receipts.",
        limitation: "Contract deployment and key custody are environment-specific.",
        usageNotes: "Only hash commitment is written.",
      },
    ],
  },
  {
    id: "governance",
    title: "Safety and Governance",
    cards: [
      {
        title: "Human-in-the-loop control guidance",
        url: "https://www.iso.org/standard/45006.html",
        claimSupported: "Human governance layers and operator approval concepts in automation pipelines.",
        limitation: "Normative industrial control safety frameworks must be implemented per plant policy.",
        usageNotes: "Prototype follows advisory-first control with explicit approval requirement.",
      },
      {
        title: "Provenance and hash-first audit patterns",
        url: "https://www.iso.org/standard/27001.html",
        claimSupported: "Traceability and non-repudiation ideas for operational actions.",
        limitation: "No production incident workflows or full compliance evidence are claimed.",
        usageNotes: "Evidence hashes only are anchored; operational records remain server-side.",
      },
    ],
  },
];

export function SourcePage() {
  return (
    <section className="space-y-5">
      <Panel
        title="Source / References"
        kicker="Architecture transparency"
        icon="search"
        accent="violet"
      >
        <p className="text-sm text-slate-300">
          This prototype is source-grounded and independent. It is not endorsed by the listed organizations.
        </p>
        <p className="mt-2 text-xs text-cyan-200">
          Top note: This is an independent technical prototype. It is not an official Tsubaki-Nakashima deployment and does not control production machinery.
        </p>
      </Panel>

      <ArchitectureClaimCard
        claim="Independent, advisory-first cyber-physical architecture built around hash-based provenance."
        source="Project blueprint"
      />

      <div className="space-y-6">
        {sourceGroups.map((group) => (
          <SourceCategory key={group.id} title={group.title}>
            <div className="grid gap-3 lg:grid-cols-2">
              {group.cards.map((card) => (
                <SourceCard
                  key={card.title}
                  title={card.title}
                  url={card.url}
                  claimSupported={card.claimSupported}
                  limitation={card.limitation}
                  usageNotes={card.usageNotes}
                />
              ))}
            </div>
          </SourceCategory>
        ))}
      </div>

      <Panel title="Claim Alignment" kicker="Why this proof layer exists" icon="hash" accent="amber">
        <div className="space-y-3">
          {tsubakiClaims.map((item) => (
            <p key={item.claim} className="rounded border border-command-line/60 bg-black/30 p-3 text-sm text-slate-200">
              <span className="text-amber-300">{item.source}:</span> {item.claim}
            </p>
          ))}
        </div>
      </Panel>
    </section>
  );
}
