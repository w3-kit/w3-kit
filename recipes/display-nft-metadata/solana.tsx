"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

type NFTMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  symbol?: string;
};

function getMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return pda;
}

function resolveUri(uri: string): string {
  if (uri.startsWith("ipfs://")) return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  if (uri.startsWith("ar://")) return uri.replace("ar://", "https://arweave.net/");
  return uri;
}

// ★ Parse Metaplex metadata account data (simplified — name/symbol/uri are the first fields)
function parseMetaplexData(data: Buffer): { name: string; symbol: string; uri: string } | null {
  try {
    // Metaplex metadata layout: 1 byte key + 32 bytes update_authority + 32 bytes mint
    // + 4+len name + 4+len symbol + 4+len uri + ...
    let offset = 1 + 32 + 32;
    const nameLen = data.readUInt32LE(offset); offset += 4;
    const name = data.slice(offset, offset + nameLen).toString("utf8").replace(/\0/g, "").trim();
    offset += nameLen;
    const symbolLen = data.readUInt32LE(offset); offset += 4;
    const symbol = data.slice(offset, offset + symbolLen).toString("utf8").replace(/\0/g, "").trim();
    offset += symbolLen;
    const uriLen = data.readUInt32LE(offset); offset += 4;
    const uri = data.slice(offset, offset + uriLen).toString("utf8").replace(/\0/g, "").trim();
    return { name, symbol, uri };
  } catch {
    return null;
  }
}

export function DisplayNFTMetadata() {
  const { connection } = useConnection();
  const [mintAddress, setMintAddress] = useState("");
  const [onChainData, setOnChainData] = useState<{ name: string; symbol: string; uri: string } | null>(null);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!mintAddress) return;
    setIsFetching(true);
    setError(null);
    setMetadata(null);
    setOnChainData(null);

    try {
      const mint = new PublicKey(mintAddress);
      const metadataPDA = getMetadataPDA(mint);

      // 1. Fetch the Metaplex metadata account
      const accountInfo = await connection.getAccountInfo(metadataPDA);
      if (!accountInfo) throw new Error("Metadata account not found");

      // 2. Parse on-chain name/symbol/URI
      // accountInfo.data may be Buffer or Uint8Array — guard before passing to parseMetaplexData
      const rawData = accountInfo.data;
      if (!Buffer.isBuffer(rawData)) throw new Error("Unexpected account data format");
      const parsed = parseMetaplexData(rawData);
      if (!parsed) throw new Error("Failed to parse metadata account");
      setOnChainData(parsed);

      // 3. Fetch off-chain JSON at the URI
      if (parsed.uri) {
        const resolved = resolveUri(parsed.uri);
        const res = await fetch(resolved);
        const json = await res.json();
        setMetadata(json);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div>
      <h2>Display NFT Metadata (Solana)</h2>
      <input
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)}
        placeholder="NFT mint address"
      />
      <button onClick={handleFetch} disabled={isFetching || !mintAddress}>
        {isFetching ? "Fetching..." : "Fetch Metadata"}
      </button>

      {onChainData && (
        <div>
          <p>Name (on-chain): {onChainData.name}</p>
          <p>Symbol: {onChainData.symbol}</p>
          <p>URI: <code>{onChainData.uri}</code></p>
        </div>
      )}

      {metadata && (
        <div>
          {metadata.image && (
            <img
              src={resolveUri(metadata.image)}
              alt={metadata.name}
              style={{ maxWidth: "300px", display: "block", margin: "1rem 0" }}
            />
          )}
          {metadata.description && <p>{metadata.description}</p>}
          {metadata.attributes && (
            <ul>
              {metadata.attributes.map((attr, i) => (
                <li key={i}>{attr.trait_type}: {attr.value}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
