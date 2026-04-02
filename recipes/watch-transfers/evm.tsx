"use client";

import { useWatchContractEvent } from "wagmi";
import { useState } from "react";
import { formatUnits } from "viem";

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

type TransferLog = { from: string; to: string; value: string; txHash: string };

export function WatchTransfers() {
  const [tokenAddress, setTokenAddress] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"); // USDC
  const [transfers, setTransfers] = useState<TransferLog[]>([]);
  const [decimals] = useState(6);

  useWatchContractEvent({
    address: tokenAddress as `0x${string}`,
    abi: erc20TransferEventAbi,
    eventName: "Transfer",
    onLogs(logs) {
      const newTransfers = logs.map((log) => ({
        from: log.args.from as string,
        to: log.args.to as string,
        value: formatUnits(log.args.value as bigint, decimals),
        txHash: log.transactionHash,
      }));
      setTransfers((prev) => [...newTransfers, ...prev].slice(0, 50));
    },
  });

  return (
    <div>
      <h2>Watch Token Transfers</h2>
      <input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Token contract address" />
      <p>{transfers.length} transfers captured</p>
      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        {transfers.map((t) => (
          <div key={t.txHash} style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0", fontSize: "0.85rem" }}>
            <p>{t.from.slice(0, 10)}... → {t.to.slice(0, 10)}...</p>
            <p><strong>{t.value}</strong> tokens</p>
          </div>
        ))}
      </div>
    </div>
  );
}
