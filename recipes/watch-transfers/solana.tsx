"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState, useRef } from "react";

type TransferLog = { signature: string; message: string; timestamp: number };

export function WatchTransfers() {
  const { connection } = useConnection();
  const [mintAddress, setMintAddress] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC
  const [logs, setLogs] = useState<TransferLog[]>([]);
  const subRef = useRef<number | null>(null);

  useEffect(() => {
    if (subRef.current !== null) {
      connection.removeOnLogsListener(subRef.current);
    }

    try {
      const mint = new PublicKey(mintAddress);
      // ★ Subscribe to all logs mentioning the token mint
      subRef.current = connection.onLogs(
        mint,
        (logInfo) => {
          setLogs((prev) => [
            {
              signature: logInfo.signature,
              message: logInfo.logs.join("\n"),
              timestamp: Date.now(),
            },
            ...prev,
          ].slice(0, 50));
        },
        "confirmed"
      );
    } catch {
      // Invalid address
    }

    return () => {
      if (subRef.current !== null) {
        connection.removeOnLogsListener(subRef.current);
      }
    };
  }, [connection, mintAddress]);

  return (
    <div>
      <h2>Watch Token Activity</h2>
      <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="Token mint address" />
      <p>{logs.length} events captured</p>
      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        {logs.map((l) => (
          <div key={l.signature} style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0", fontSize: "0.85rem" }}>
            <p><strong>Tx:</strong> {l.signature.slice(0, 20)}...</p>
            <p style={{ color: "#666" }}>{new Date(l.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
