"use client";

import { useMemo, useEffect, useState } from "react";
import { ConnectionProvider, useConnection } from "@solana/wallet-adapter-react";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

function MetadataUI() {
  const { connection } = useConnection();
  const [mintAddress, setMintAddress] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const [mintInfo, setMintInfo] = useState<{ decimals: number; supply: string; mintAuthority: string | null; freezeAuthority: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setMintInfo(null);
    (async () => {
      try {
        const mint = new PublicKey(mintAddress);
        const info = await getMint(connection, mint);
        setMintInfo({
          decimals: info.decimals,
          supply: info.supply.toString(),
          mintAuthority: info.mintAuthority?.toBase58() ?? null,
          freezeAuthority: info.freezeAuthority?.toBase58() ?? null,
        });
      } catch {
        setError("Failed to fetch — check the mint address");
      }
    })();
  }, [connection, mintAddress]);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Fetch Token Metadata (Solana)</h2>
      <input
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace" }}
        placeholder="Token mint address"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {mintInfo && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
          <p><strong>Decimals:</strong> {mintInfo.decimals}</p>
          <p><strong>Supply:</strong> {mintInfo.supply}</p>
          <p><strong>Mint Authority:</strong> {mintInfo.mintAuthority ?? "None (fixed supply)"}</p>
          <p><strong>Freeze Authority:</strong> {mintInfo.freezeAuthority ?? "None"}</p>
        </div>
      )}
      <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.9rem" }}>
        Try USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
      </p>
    </div>
  );
}

// ★ No wallet needed — just a connection to read on-chain data
export default function FetchMetadataPage() {
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <MetadataUI />
    </ConnectionProvider>
  );
}
