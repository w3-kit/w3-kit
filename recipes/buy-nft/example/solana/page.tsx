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

function TransferNFTUI() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Transfer NFT (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  const handleTransfer = async () => {
    setIsPending(true);
    setError(null);
    setTxSig(null);
    try {
      const mint = new PublicKey(mintAddress);
      const recipient = new PublicKey(recipientAddress);
      // Connected wallet is the sender and signer
      const senderAta = await getAssociatedTokenAddress(mint, publicKey);
      const recipientAta = await getAssociatedTokenAddress(mint, recipient);

      const tx = new Transaction();
      try {
        await getAccount(connection, recipientAta);
      } catch {
        tx.add(createAssociatedTokenAccountInstruction(publicKey, recipientAta, recipient, mint));
      }
      // ★ Connected wallet signs — it must own the NFT
      tx.add(createTransferInstruction(senderAta, recipientAta, publicKey, 1));

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
      <h2>Transfer NFT (Solana)</h2>
      <p><strong>Wallet:</strong> {publicKey.toBase58()}</p>
      <p style={{ background: "#fffbe6", padding: "0.75rem", border: "1px solid #ffd700", marginBottom: "1rem" }}>
        Transfers an NFT you own to another wallet. The connected wallet must hold the NFT.
        Real marketplace buy flows use escrow programs for trustless atomic swaps.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "480px" }}>
        <input
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="NFT mint address"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <input
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Recipient wallet address"
          style={{ padding: "0.5rem", fontFamily: "monospace" }}
        />
        <button
          onClick={handleTransfer}
          disabled={isPending || !mintAddress || !recipientAddress}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {isPending ? "Transferring..." : "Transfer NFT"}
        </button>
      </div>

      {txSig && <p>Transfer complete! Tx: <code style={{ fontSize: "0.8rem" }}>{txSig}</code></p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

export default function TransferNFTPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TransferNFTUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
