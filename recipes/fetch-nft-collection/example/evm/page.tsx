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

const erc721EnumerableAbi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

type NFTItem = { tokenId: bigint; tokenUri: string };

function FetchUI() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const client = usePublicClient();
  const [contractAddress, setContractAddress] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Fetch NFT Collection (EVM)</h2>
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
    if (!client || !contractAddress) return;
    const owner = (walletAddress || address) as `0x${string}`;
    setIsFetching(true);
    setError(null);
    setNfts([]);
    try {
      const balance = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc721EnumerableAbi,
        functionName: "balanceOf",
        args: [owner],
      });
      const items: NFTItem[] = [];
      for (let i = 0n; i < balance; i++) {
        const tokenId = await client.readContract({
          address: contractAddress as `0x${string}`,
          abi: erc721EnumerableAbi,
          functionName: "tokenOfOwnerByIndex",
          args: [owner, i],
        });
        const tokenUri = await client.readContract({
          address: contractAddress as `0x${string}`,
          abi: erc721EnumerableAbi,
          functionName: "tokenURI",
          args: [tokenId],
        });
        items.push({ tokenId, tokenUri });
      }
      setNfts(items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Fetch NFT Collection (EVM)</h2>
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
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder={`Owner address (default: ${address})`}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleFetch}
          disabled={isFetching || !contractAddress}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isFetching ? "Fetching..." : "Fetch NFTs"}
        </button>
      </div>

      {nfts.length > 0 && (
        <ul style={{ marginTop: "1rem" }}>
          {nfts.map((nft) => (
            <li key={nft.tokenId.toString()} style={{ marginBottom: "0.5rem" }}>
              <strong>#{nft.tokenId.toString()}</strong> — <code style={{ fontSize: "0.8rem" }}>{nft.tokenUri}</code>
            </li>
          ))}
        </ul>
      )}
      {nfts.length === 0 && !isFetching && !error && contractAddress && (
        <p style={{ marginTop: "1rem" }}>No NFTs found for this address.</p>
      )}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>}
    </div>
  );
}

export default function FetchNFTCollectionPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FetchUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
