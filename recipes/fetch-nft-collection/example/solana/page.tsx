"use client";

import { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

function getMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return pda;
}

type NFTItem = { mint: string; metadataAddress: string };

function FetchUI() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState("");
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Fetch NFT Collection (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  const handleFetch = async () => {
    const owner = walletAddress ? new PublicKey(walletAddress) : publicKey;
    setIsFetching(true);
    setError(null);
    setNfts([]);
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
      });
      const nftAccounts = tokenAccounts.value.filter((ta) => {
        const info = ta.account.data.parsed.info;
        return info.tokenAmount.decimals === 0 && info.tokenAmount.uiAmount === 1;
      });
      const items: NFTItem[] = nftAccounts.map((ta) => {
        const mint = ta.account.data.parsed.info.mint as string;
        const metadataAddress = getMetadataPDA(new PublicKey(mint)).toBase58();
        return { mint, metadataAddress };
      });
      setNfts(items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Fetch NFT Collection (Solana)</h2>
      <p><strong>Wallet:</strong> {publicKey.toBase58()}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "480px", marginTop: "1rem" }}>
        <input
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder={`Owner address (default: ${publicKey.toBase58()})`}
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleFetch}
          disabled={isFetching}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isFetching ? "Fetching..." : "Fetch NFTs"}
        </button>
      </div>

      {nfts.length > 0 && (
        <ul style={{ marginTop: "1rem" }}>
          {nfts.map((nft) => (
            <li key={nft.mint} style={{ marginBottom: "0.5rem" }}>
              Mint: <code style={{ fontSize: "0.8rem" }}>{nft.mint.slice(0, 16)}...</code>
            </li>
          ))}
        </ul>
      )}
      {nfts.length === 0 && !isFetching && !error && (
        <p style={{ marginTop: "1rem" }}>No NFTs found.</p>
      )}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>}
    </div>
  );
}

export default function FetchNFTCollectionPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <FetchUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
