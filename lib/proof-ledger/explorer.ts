// lib/proof-ledger/explorer.ts

export function xrplExplorerUrl(txHash: string): string {
  return `https://testnet.xrpl.org/transactions/${txHash}`;
}

export function hederaExplorerUrl(txHash: string): string {
  return `https://hashscan.io/testnet/transaction/${txHash}`;
}

export function getExplorerUrl(
  network: "xrpl_testnet" | "hedera_testnet" | "mock" | "disabled",
  txHash: string
): string | undefined {
  if (network === "xrpl_testnet" && txHash) return xrplExplorerUrl(txHash);
  if (network === "hedera_testnet" && txHash) return hederaExplorerUrl(txHash);
  return undefined;
}
