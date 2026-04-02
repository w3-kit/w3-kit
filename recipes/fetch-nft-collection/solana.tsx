"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useState } from "react";

// ★ Metaplex Token Metadata program ID
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

type NFTItem = {
  mint: string;
  metadataAddress: string;
  name?: string;
  uri?: string;
};

// Derive the Metaplex metadata PDA for a given mint
function getMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return pda;
}

export function FetchNFTCollection() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [walletAddress, setWalletAddress] = useState("");
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    const owner = walletAddress
      ? new PublicKey(walletAddress)
      : publicKey;
    if (!owner) return;

    setIsFetching(true);
    setError(null);
    setNfts([]);

    try {
      // ★ Find all token accounts owned by this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
      });

      // ★ Filter for NFTs: amount = 1, decimals = 0
      const nftAccounts = tokenAccounts.value.filter((ta) => {
        const info = ta.account.data.parsed.info;
        return (
          info.tokenAmount.decimals === 0 &&
          info.tokenAmount.uiAmount === 1
        );
      });

      const items: NFTItem[] = [];
      for (const ta of nftAccounts) {
        const mint = ta.account.data.parsed.info.mint as string;
        const mintPubkey = new PublicKey(mint);
        const metadataPDA = getMetadataPDA(mintPubkey);
        items.push({ mint, metadataAddress: metadataPDA.toBase58() });
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
      <h2>Fetch NFT Collection (Solana)</h2>
      <input
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder={`Owner address (default: ${publicKey?.toBase58() ?? "connect wallet"})`}
      />
      <button onClick={handleFetch} disabled={isFetching || (!publicKey && !walletAddress)}>
        {isFetching ? "Fetching..." : "Fetch NFTs"}
      </button>
      {nfts.length > 0 && (
        <ul>
          {nfts.map((nft) => (
            <li key={nft.mint}>
              Mint: {nft.mint.slice(0, 8)}... — Metadata PDA: {nft.metadataAddress.slice(0, 8)}...
            </li>
          ))}
        </ul>
      )}
      {nfts.length === 0 && !isFetching && !error && <p>No NFTs found.</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
