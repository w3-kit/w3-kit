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
import "@solana/wallet-adapter-react-ui/styles.css";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

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

function parseMetaplexData(data: Buffer): { name: string; symbol: string; uri: string } | null {
  try {
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

type NFTMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
};

function DisplayMetadataUI() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [onChainData, setOnChainData] = useState<{ name: string; symbol: string; uri: string } | null>(null);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Display NFT Metadata (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  const handleFetch = async () => {
    if (!mintAddress) return;
    setIsFetching(true);
    setError(null);
    setMetadata(null);
    setOnChainData(null);
    try {
      const mint = new PublicKey(mintAddress);
      const metadataPDA = getMetadataPDA(mint);
      const accountInfo = await connection.getAccountInfo(metadataPDA);
      if (!accountInfo) throw new Error("Metadata account not found — is this a Metaplex NFT?");

      const parsed = parseMetaplexData(accountInfo.data as Buffer);
      if (!parsed) throw new Error("Failed to parse metadata account");
      setOnChainData(parsed);

      if (parsed.uri) {
        const res = await fetch(resolveUri(parsed.uri));
        setMetadata(await res.json());
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Display NFT Metadata (Solana)</h2>
      <p><strong>Wallet:</strong> {publicKey.toBase58()}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "480px", marginTop: "1rem" }}>
        <input
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="NFT mint address"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleFetch}
          disabled={isFetching || !mintAddress}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isFetching ? "Fetching..." : "Fetch Metadata"}
        </button>
      </div>

      {onChainData && (
        <div style={{ marginTop: "1rem", background: "#f9f9f9", padding: "0.75rem", fontSize: "0.85rem" }}>
          <strong>On-chain:</strong> {onChainData.name} ({onChainData.symbol}) —{" "}
          <code style={{ fontSize: "0.75rem" }}>{onChainData.uri.slice(0, 60)}{onChainData.uri.length > 60 ? "..." : ""}</code>
        </div>
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
                <span key={i} style={{ background: "#f0f0f0", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
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
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <DisplayMetadataUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
