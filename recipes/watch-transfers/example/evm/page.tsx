"use client";

import { createConfig, http, WagmiProvider, useWatchContractEvent } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { useState } from "react";

const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

const queryClient = new QueryClient();

const erc20TransferEventAbi = [
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

type TransferLog = { from: string; to: string; value: string; txHash: string; time: string };

function WatchUI() {
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  const [transfers, setTransfers] = useState<TransferLog[]>([]);

  useWatchContractEvent({
    address: tokenAddress as `0x${string}`,
    abi: erc20TransferEventAbi,
    eventName: "Transfer",
    onLogs(logs) {
      const newTransfers = logs.map((log) => ({
        from: log.args.from as string,
        to: log.args.to as string,
        value: formatUnits(log.args.value as bigint, 6),
        txHash: log.transactionHash,
        time: new Date().toLocaleTimeString(),
      }));
      setTransfers((prev) => [...newTransfers, ...prev].slice(0, 50));
    },
  });

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Watch Transfers (EVM)</h2>
      <input
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace" }}
        placeholder="Token contract address"
      />
      <p style={{ marginTop: "1rem" }}>Live transfers: {transfers.length}</p>
      <div style={{ maxHeight: "500px", overflow: "auto", marginTop: "0.5rem" }}>
        {transfers.length === 0 && <p style={{ color: "#666" }}>Waiting for transfers...</p>}
        {transfers.map((t) => (
          <div key={t.txHash} style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0" }}>
            <p style={{ fontSize: "0.85rem" }}>
              <span style={{ color: "#666" }}>{t.time}</span>{" "}
              <code>{t.from.slice(0, 8)}...</code> → <code>{t.to.slice(0, 8)}...</code>
            </p>
            <p style={{ fontSize: "0.9rem" }}><strong>{t.value} USDC</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ★ No wallet needed — just subscribe to on-chain events
export default function WatchTransfersPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WatchUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
