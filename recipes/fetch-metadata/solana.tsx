"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { useState, useEffect } from "react";

export function FetchTokenMetadata() {
  const { connection } = useConnection();
  const [mintAddress, setMintAddress] = useState("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC
  const [mintInfo, setMintInfo] = useState<{ decimals: number; supply: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    (async () => {
      try {
        const mint = new PublicKey(mintAddress);
        const info = await getMint(connection, mint);
        setMintInfo({
          decimals: info.decimals,
          supply: info.supply.toString(),
        });
      } catch {
        setError("Failed to fetch mint info");
        setMintInfo(null);
      }
    })();
  }, [connection, mintAddress]);

  return (
    <div>
      <h2>Token Metadata (Solana)</h2>
      <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="Token mint address" />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {mintInfo && (
        <div>
          <p><strong>Decimals:</strong> {mintInfo.decimals}</p>
          <p><strong>Supply:</strong> {mintInfo.supply}</p>
          <p><em>Full metadata (name, symbol, image) requires Metaplex Token Metadata program</em></p>
        </div>
      )}
    </div>
  );
}
