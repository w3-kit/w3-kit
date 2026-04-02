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
import { PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

function BuyNFTUI() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Buy NFT (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  const handleBuy = async () => {
    setIsPending(true);
    setError(null);
    setTxSig(null);
    try {
      const mint = new PublicKey(mintAddress);
      const seller = new PublicKey(sellerAddress);
      const sellerAta = await getAssociatedTokenAddress(mint, seller);
      const buyerAta = await getAssociatedTokenAddress(mint, publicKey);

      const tx = new Transaction();
      try {
        await getAccount(connection, buyerAta);
      } catch {
        tx.add(createAssociatedTokenAccountInstruction(publicKey, buyerAta, publicKey, mint));
      }
      tx.add(createTransferInstruction(sellerAta, buyerAta, seller, 1));

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Buy NFT (Solana)</h2>
      <p><strong>Wallet:</strong> {publicKey.toBase58()}</p>
      <p style={{ background: "#fffbe6", padding: "0.75rem", border: "1px solid #ffd700", marginBottom: "1rem" }}>
        Educational demo: shows the raw SPL token transfer pattern. Real marketplaces use
        escrow programs for trustless atomic swaps.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "480px" }}>
        <input
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="NFT mint address"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={sellerAddress}
          onChange={(e) => setSellerAddress(e.target.value)}
          placeholder="Seller wallet address"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleBuy}
          disabled={isPending || !mintAddress || !sellerAddress}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isPending ? "Processing..." : "Transfer NFT to Me"}
        </button>
      </div>

      {txSig && <p>Transfer complete! Tx: <code style={{ fontSize: "0.8rem" }}>{txSig}</code></p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

export default function BuyNFTPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BuyNFTUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
