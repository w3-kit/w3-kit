"use client";

import { useAccount, usePublicClient } from "wagmi";
import { useState } from "react";

// ★ ERC-721 Enumerable ABI — requires contract to implement ERC721Enumerable
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

type NFTItem = {
  tokenId: bigint;
  tokenUri: string;
};

export function FetchNFTCollection() {
  const { address } = useAccount();
  const client = usePublicClient();
  const [contractAddress, setContractAddress] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const owner = (walletAddress || address) as `0x${string}`;

  const handleFetch = async () => {
    if (!client || !contractAddress || !owner) return;
    setIsFetching(true);
    setError(null);
    setNfts([]);

    try {
      // 1. Get the balance
      const balance = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc721EnumerableAbi,
        functionName: "balanceOf",
        args: [owner],
      });

      // 2. Fetch each tokenId by index, then its URI
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
    <div>
      <h2>Fetch NFT Collection (EVM)</h2>
      <input
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        placeholder="ERC-721 contract address (0x...)"
      />
      <input
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder={`Owner address (default: ${address ?? "connect wallet"})`}
      />
      <button onClick={handleFetch} disabled={isFetching || !contractAddress}>
        {isFetching ? "Fetching..." : "Fetch NFTs"}
      </button>
      {nfts.length > 0 && (
        <ul>
          {nfts.map((nft) => (
            <li key={nft.tokenId.toString()}>
              Token #{nft.tokenId.toString()} — {nft.tokenUri}
            </li>
          ))}
        </ul>
      )}
      {nfts.length === 0 && !isFetching && !error && <p>No NFTs found.</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
