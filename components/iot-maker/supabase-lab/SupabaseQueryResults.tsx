"use client";

type QueryResult = {
  safeQueryLabel: string;
  preset: string;
  status: "success" | "failed" | "simulated";
  durationMs: number;
  rowCount: number;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  usedMockData: boolean;
  mockReason?: string;
};

type Props = {
  result?: QueryResult | null;
  statusMessage?: string;
  loading: boolean;
};

export function SupabaseQueryResults({ result, statusMessage, loading }: Props) {
  if (loading) {
    return <p className="border border-cyan-400/30 bg-cyan-900/10 p-3 text-xs text-cyan-200">Running query...</p>;
  }

  if (!result) {
    return <p className="border border-command-line bg-black/30 p-3 text-xs text-command-muted">Run a preset to view query output.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="border border-command-line/50 bg-black/20 p-3 text-xs">
        <p className="font-semibold uppercase tracking-[0.14em] text-cyan-200">Result</p>
        <p>Query: {result.safeQueryLabel} ({result.preset})</p>
        <p>Mode: {result.usedMockData ? "mock" : result.status}</p>
        <p>Rows: {result.rowCount}</p>
        <p>Duration: {result.durationMs}ms</p>
        {result.mockReason && <p>Mock reason: {result.mockReason}</p>}
      </div>

      <div className="overflow-x-auto border border-command-line/50">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="bg-black/70 text-cyan-300">
              {result.columns.map((column) => (
                <th key={column} className="px-2 py-1.5">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={`${result.preset}-${index}`} className="border-t border-command-line/30">
                {result.columns.map((column) => (
                  <td key={`${index}-${column}`} className="px-2 py-1.5 text-slate-200">
                    {String(row[column] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {statusMessage && <p className="text-xs text-command-muted">{statusMessage}</p>}
    </div>
  );
}
