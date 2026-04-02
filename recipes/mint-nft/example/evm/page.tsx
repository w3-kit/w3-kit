"use client";

import {
  createConfig,
  http,
  WagmiProvider,
  useAccount,
  useConnect,
  useWriteContract,
  useWaitForTransactionReceipt,
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

// ★ Minimal ERC-721 ABI for safeMint
// Deploy an OpenZeppelin ERC721URIStorage contract to get a compatible contract address
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
] as const;

function MintUI() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const [contractAddress, setContractAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [tokenUri, setTokenUri] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (!isConnected) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Mint NFT (EVM)</h2>
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
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Mint NFT (EVM)</h2>
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
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={`Recipient (default: ${address})`}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Token ID (e.g., 1)"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={tokenUri}
          onChange={(e) => setTokenUri(e.target.value)}
          placeholder="Token URI (ipfs://... or https://...)"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleMint}
          disabled={isPending || !contractAddress || !tokenId}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isPending ? "Minting..." : "Mint NFT"}
        </button>
      </div>

      {isConfirming && <p>Waiting for confirmation...</p>}
      {isSuccess && <p>NFT minted! Tx: <code style={{ fontSize: "0.8rem" }}>{hash}</code></p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
    </div>
  );
}

export default function MintNFTPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MintUI />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
