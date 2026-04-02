"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { ConnectionProvider, useConnection } from "@solana/wallet-adapter-react";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";

type LogEntry = { signature: string; preview: string; time: string };

function WatchUI() {
  const { connection } = useConnection();
  const [mintAddress, setMintAddress] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const subRef = useRef<number | null>(null);

  useEffect(() => {
    if (subRef.current !== null) {
      connection.removeOnLogsListener(subRef.current);
    }

    try {
      const mint = new PublicKey(mintAddress);
      subRef.current = connection.onLogs(
        mint,
        (logInfo) => {
          setLogs((prev) => [
            {
              signature: logInfo.signature,
              preview: logInfo.logs.slice(0, 3).join(" | "),
              time: new Date().toLocaleTimeString(),
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
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Watch Token Activity (Solana)</h2>
      <input
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace" }}
        placeholder="Token mint address"
      />
      <p style={{ marginTop: "1rem" }}>Live events: {logs.length}</p>
      <div style={{ maxHeight: "500px", overflow: "auto", marginTop: "0.5rem" }}>
        {logs.length === 0 && <p style={{ color: "#666" }}>Waiting for activity...</p>}
        {logs.map((l) => (
          <div key={l.signature} style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0" }}>
            <p style={{ fontSize: "0.85rem" }}>
              <span style={{ color: "#666" }}>{l.time}</span>{" "}
              <code>{l.signature.slice(0, 16)}...</code>
            </p>
            <p style={{ fontSize: "0.8rem", color: "#444" }}>{l.preview.slice(0, 100)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ★ No wallet needed — just a WebSocket connection to the RPC
export default function WatchTransfersPage() {
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WatchUI />
    </ConnectionProvider>
  );
}
