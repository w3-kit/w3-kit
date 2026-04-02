"use client";

import { usePublicClient } from "wagmi";
import { useState } from "react";

const erc721TokenURIAbi = [
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

type NFTMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
};

function resolveUri(uri: string): string {
  if (uri.startsWith("ipfs://")) return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  if (uri.startsWith("ar://")) return uri.replace("ar://", "https://arweave.net/");
  return uri;
}

export function DisplayNFTMetadata() {
  const client = usePublicClient();
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [tokenUri, setTokenUri] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!client || !contractAddress || !tokenId) return;
    setIsFetching(true);
    setError(null);
    setMetadata(null);
    setTokenUri(null);

    try {
      // 1. Read tokenURI from the contract
      const uri = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc721TokenURIAbi,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      });
      setTokenUri(uri);

      // 2. Handle base64-encoded on-chain metadata
      if (uri.startsWith("data:application/json;base64,")) {
        const json = atob(uri.split(",")[1]);
        setMetadata(JSON.parse(json));
        return;
      }

      // 3. Fetch off-chain metadata (IPFS / Arweave / HTTP)
      const resolved = resolveUri(uri);
      const res = await fetch(resolved);
      const json = await res.json();
      setMetadata(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div>
      <h2>Display NFT Metadata (EVM)</h2>
      <input
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        placeholder="ERC-721 contract address (0x...)"
      />
      <input
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Token ID"
      />
      <button onClick={handleFetch} disabled={isFetching || !contractAddress || !tokenId}>
        {isFetching ? "Fetching..." : "Fetch Metadata"}
      </button>

      {tokenUri && <p>URI: <code>{tokenUri}</code></p>}

      {metadata && (
        <div>
          <h3>{metadata.name}</h3>
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
