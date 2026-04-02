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
import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

function MintUI() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Mint NFT (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  const handleMint = async () => {
    setIsPending(true);
    setError(null);
    setTxSig(null);
    setMintAddress(null);

    try {
      const mintKeypair = Keypair.generate();
      const mintPubkey = mintKeypair.publicKey;
      const recipientPubkey = recipient ? new PublicKey(recipient) : publicKey;
      const ata = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPubkey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mintPubkey, 0, publicKey, publicKey),
        createAssociatedTokenAccountInstruction(publicKey, ata, recipientPubkey, mintPubkey),
        createMintToInstruction(mintPubkey, ata, publicKey, 1)
      );

      const sig = await sendTransaction(tx, connection, {
        signers: [mintKeypair],
      });
      await connection.confirmTransaction(sig, "confirmed");

      setTxSig(sig);
      setMintAddress(mintPubkey.toBase58());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Mint NFT (Solana)</h2>
      <p><strong>Wallet:</strong> {publicKey.toBase58()}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "480px", marginTop: "1rem" }}>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient (default: your wallet)"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={metadataUri}
          onChange={(e) => setMetadataUri(e.target.value)}
          placeholder="Metadata URI (ipfs://... or https://...)"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleMint}
          disabled={isPending}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isPending ? "Minting..." : "Mint NFT"}
        </button>
      </div>

      {txSig && <p>NFT minted! Tx: <code style={{ fontSize: "0.8rem" }}>{txSig}</code></p>}
      {mintAddress && <p>Mint address: <code style={{ fontSize: "0.8rem" }}>{mintAddress}</code></p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

export default function MintNFTPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <MintUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
