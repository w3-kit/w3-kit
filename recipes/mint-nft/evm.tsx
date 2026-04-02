"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";

// ★ Minimal ERC-721 ABI — safeMint requires the contract to be pre-deployed
// In production, deploy an OpenZeppelin ERC721 contract and use its address
const erc721MintAbi = [
  {
    name: "safeMint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function MintNFT() {
  const { address } = useAccount();
  const [contractAddress, setContractAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [tokenUri, setTokenUri] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleMint = () => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: erc721MintAbi,
      functionName: "safeMint",
      args: [
        (recipient || address) as `0x${string}`,
        BigInt(tokenId),
        tokenUri,
      ],
    });
  };

  return (
    <div>
      <h2>Mint NFT (ERC-721)</h2>
      <input
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        placeholder="NFT contract address (0x...)"
      />
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder={`Recipient (default: ${address ?? "your wallet"})`}
      />
      <input
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Token ID (e.g., 1)"
      />
      <input
        value={tokenUri}
        onChange={(e) => setTokenUri(e.target.value)}
        placeholder="Token URI (ipfs://... or https://...)"
      />
      <button onClick={handleMint} disabled={isPending || !contractAddress || !tokenId}>
        {isPending ? "Minting..." : "Mint NFT"}
      </button>
      {isConfirming && <p>Waiting for confirmation...</p>}
      {isSuccess && <p>NFT minted! Tx: {hash}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
