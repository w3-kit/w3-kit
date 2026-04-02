"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import {
  NameRegistryState,
  performReverseLookup,
  getDomainKey,
} from "@bonfida/spl-name-service";
import { useState } from "react";

// ★ SNS (.sol domains) only exists on Solana mainnet — devnet has no registry data
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Forward: .sol domain → owner address
// Strips the ".sol" suffix before lookup — the SDK expects just the label
export async function resolveSnsName(domain: string): Promise<string | null> {
  try {
    const { pubkey } = await getDomainKey(domain.replace(".sol", ""));
    const { registry } = await NameRegistryState.retrieve(connection, pubkey);
    return registry.owner.toBase58();
  } catch {
    return null;
  }
}

// Reverse: address → .sol domain
// Returns null if the address has no registered .sol domain
export async function reverseResolveSns(address: string): Promise<string | null> {
  try {
    const pubkey = new PublicKey(address);
    const domain = await performReverseLookup(connection, pubkey);
    return `${domain}.sol`;
  } catch {
    return null;
  }
}

// Component: resolve .sol domain or Solana address
export function ResolveAddress() {
  const [input, setInput] = useState("bonfida.sol");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (input.endsWith(".sol")) {
        // Forward lookup: .sol domain → address
        const address = await resolveSnsName(input);
        setResult(address ?? "Domain not registered");
      } else {
        // Reverse lookup: address → .sol domain
        const domain = await reverseResolveSns(input);
        setResult(domain ?? "No .sol domain for this address");
      }
    } catch {
      setError("Resolution failed — check the domain or address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Resolve SNS Address (Solana)</h2>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder=".sol domain (bonfida.sol) or base58 address"
      />
      <button onClick={handleResolve} disabled={isLoading || !input}>
        {isLoading ? "Resolving..." : "Resolve"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p><strong>Result:</strong> {result}</p>}
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        Forward: enter a .sol name → get address. Reverse: enter base58 address → get domain.
      </p>
    </div>
  );
}
