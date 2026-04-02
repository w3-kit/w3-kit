"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";

// ★ ERC-721 approve + transferFrom pattern
// This is the marketplace-agnostic flow: seller approves, buyer calls transferFrom
// Real marketplaces (OpenSea, Blur) wrap this in an escrow/order contract
const erc721Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

// ★ Step 1: Seller approves the buyer (or a marketplace contract) to transfer
export function ApproveNFT() {
  const [contractAddress, setContractAddress] = useState("");
  const [approved, setApproved] = useState("");
  const [tokenId, setTokenId] = useState("");
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return (
    <div>
      <h2>Step 1: Approve NFT Transfer (Seller)</h2>
      <input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} placeholder="NFT contract (0x...)" />
      <input value={approved} onChange={(e) => setApproved(e.target.value)} placeholder="Buyer or marketplace address (0x...)" />
      <input value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="Token ID" />
      <button
        onClick={() => writeContract({
          address: contractAddress as `0x${string}`,
          abi: erc721Abi,
          functionName: "approve",
          args: [approved as `0x${string}`, BigInt(tokenId)],
        })}
        disabled={isPending}
      >
        {isPending ? "Approving..." : "Approve"}
      </button>
      {isConfirming && <p>Confirming...</p>}
      {isSuccess && <p>Approved! Tx: {hash}</p>}
    </div>
  );
}

// ★ Step 2: Buyer calls transferFrom to claim the NFT
export function BuyNFT() {
  const { address } = useAccount();
  const [contractAddress, setContractAddress] = useState("");
  const [seller, setSeller] = useState("");
  const [tokenId, setTokenId] = useState("");
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return (
    <div>
      <h2>Step 2: Buy NFT (Buyer)</h2>
      <p><em>Requires seller to have approved you first.</em></p>
      <input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} placeholder="NFT contract (0x...)" />
      <input value={seller} onChange={(e) => setSeller(e.target.value)} placeholder="Seller address (0x...)" />
      <input value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="Token ID" />
      <button
        onClick={() => writeContract({
          address: contractAddress as `0x${string}`,
          abi: erc721Abi,
          functionName: "transferFrom",
          args: [seller as `0x${string}`, address as `0x${string}`, BigInt(tokenId)],
        })}
        disabled={isPending}
      >
        {isPending ? "Buying..." : "Buy (Transfer to Me)"}
      </button>
      {isConfirming && <p>Confirming...</p>}
      {isSuccess && <p>NFT transferred! Tx: {hash}</p>}
    </div>
  );
}
