"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, useConnection } from "@solana/wallet-adapter-react";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  NameRegistryState,
  performReverseLookup,
  getDomainKey,
} from "@bonfida/spl-name-service";

function ResolveAddressUI() {
  const { connection } = useConnection();
  const [input, setInput] = useState("bonfida.sol");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResolve = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      if (input.endsWith(".sol")) {
        // Forward lookup: .sol domain → owner address
        const { pubkey } = await getDomainKey(input.replace(".sol", ""));
        const { registry } = await NameRegistryState.retrieve(connection, pubkey);
        setResult(registry.owner.toBase58());
      } else {
        // Reverse lookup: base58 address → .sol domain
        const pubkey = new PublicKey(input);
        const domain = await performReverseLookup(connection, pubkey);
        setResult(`${domain}.sol`);
      }
    } catch {
      setError("Resolution failed — name may not be registered or address has no reverse record");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "600px" }}>
      <h2>Resolve SNS Address (Solana)</h2>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleResolve()}
          style={{ flex: 1, padding: "0.5rem", fontFamily: "monospace" }}
          placeholder=".sol domain (bonfida.sol) or base58 address"
        />
        <button
          onClick={handleResolve}
          disabled={isLoading || !input.trim()}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isLoading ? "Resolving..." : "Resolve"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", margin: "0.5rem 0" }}>{error}</p>
      )}

      {result && (
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p style={{ margin: 0, wordBreak: "break-all" }}>
              <strong>Result:</strong> {result}
            </p>
            <button
              onClick={handleCopy}
              style={{ padding: "0.25rem 0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", color: "#666", fontSize: "0.85rem" }}>
        <p><strong>Examples to try:</strong></p>
        <ul style={{ margin: "0.25rem 0", paddingLeft: "1.25rem" }}>
          <li>Forward: <code>bonfida.sol</code>, <code>solana.sol</code></li>
          <li>Reverse: paste a base58 Solana address</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          Note: SNS only resolves on mainnet. Reverse records are optional — not all addresses have them.
        </p>
      </div>
    </div>
  );
}

// ★ ConnectionProvider wraps the app with a Solana RPC connection
//    No wallet adapter needed — SNS resolution is read-only
export default function ResolveAddressPage() {
  // ★ Use mainnet-beta — SNS does not exist on devnet
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <ResolveAddressUI />
    </ConnectionProvider>
  );
}
