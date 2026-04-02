"use client";

import {
  createConfig,
  http,
  WagmiProvider,
  useAccount,
  useConnect,
  usePublicClient,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

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

function DisplayMetadataUI() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const client = usePublicClient();
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [tokenUri, setTokenUri] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Display NFT Metadata (EVM)</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            style={{ display: "block", margin: "0.5rem 0", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Connect {connector.name}
          </button>
        ))}
      </div>
    );
  }

  const handleFetch = async () => {
    if (!client || !contractAddress || !tokenId) return;
    setIsFetching(true);
    setError(null);
    setMetadata(null);
    setTokenUri(null);
    try {
      const uri = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc721TokenURIAbi,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      });
      setTokenUri(uri);

      if (uri.startsWith("data:application/json;base64,")) {
        setMetadata(JSON.parse(atob(uri.split(",")[1])));
        return;
      }
      const res = await fetch(resolveUri(uri));
      setMetadata(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Display NFT Metadata (EVM)</h2>
      <p><strong>Wallet:</strong> {address}</p>
      <p><strong>Chain:</strong> {chain?.name}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "480px", marginTop: "1rem" }}>
        <input
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="ERC-721 contract address (0x...)"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Token ID (e.g., 1)"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleFetch}
          disabled={isFetching || !contractAddress || !tokenId}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isFetching ? "Fetching..." : "Fetch Metadata"}
        </button>
      </div>

      {tokenUri && (
        <p style={{ marginTop: "1rem", wordBreak: "break-all" }}>
          URI: <code style={{ fontSize: "0.75rem" }}>{tokenUri.slice(0, 80)}{tokenUri.length > 80 ? "..." : ""}</code>
        </p>
      )}

      {metadata && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", maxWidth: "480px" }}>
          <h3 style={{ margin: "0 0 0.5rem" }}>{metadata.name}</h3>
          {metadata.image && (
            <img
              src={resolveUri(metadata.image)}
              alt={metadata.name}
              style={{ maxWidth: "100%", display: "block", marginBottom: "0.5rem" }}
            />
          )}
          {metadata.description && <p style={{ margin: "0.5rem 0" }}>{metadata.description}</p>}
          {metadata.attributes && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
              {metadata.attributes.map((attr, i) => (
                <span
                  key={i}
                  style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>}
    </div>
  );
}

export default function DisplayNFTMetadataPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DisplayMetadataUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
