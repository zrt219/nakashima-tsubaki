type ArchitectureClaimCardProps = {
  claim: string;
  source: string;
  warning?: string;
};

export function ArchitectureClaimCard({ claim, source, warning }: ArchitectureClaimCardProps) {
  return (
    <article className="border border-violet-400/25 bg-violet-400/8 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-violet-300">Architecture Claim</p>
      <p className="mt-1 text-sm text-white">{claim}</p>
      <p className="mt-2 text-[11px] text-command-muted">Source: {source}</p>
      {warning ? (
        <p className="mt-2 text-[11px] text-amber-100">Warning: {warning}</p>
      ) : null}
    </article>
  );
}
