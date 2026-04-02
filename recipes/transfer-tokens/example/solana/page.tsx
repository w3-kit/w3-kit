"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

function TransferUI() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [mode, setMode] = useState<"native" | "token">("native");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Transfer Tokens (Solana)</h2>
        <WalletMultiButton />
      </div>
    );
  }

  const handleTransfer = async () => {
    setIsPending(true);
    setTxSig(null);
    try {
      const recipient = new PublicKey(to);

      if (mode === "native") {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports: Math.floor(Number(amount) * LAMPORTS_PER_SOL),
          })
        );
        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");
        setTxSig(sig);
      } else {
        const mint = new PublicKey(mintAddress);
        const senderAta = await getAssociatedTokenAddress(mint, publicKey);
        const recipientAta = await getAssociatedTokenAddress(mint, recipient);
        const tx = new Transaction();

        try {
          await getAccount(connection, recipientAta);
        } catch {
          tx.add(createAssociatedTokenAccountInstruction(publicKey, recipientAta, recipient, mint));
        }

        tx.add(createTransferInstruction(senderAta, recipientAta, publicKey, BigInt(amount)));
        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");
        setTxSig(sig);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Transfer Tokens (Solana)</h2>
      <p><strong>From:</strong> {publicKey.toBase58()}</p>

      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => setMode("native")} style={{ fontWeight: mode === "native" ? "bold" : "normal", padding: "0.5rem 1rem" }}>SOL</button>
        <button onClick={() => setMode("token")} style={{ fontWeight: mode === "token" ? "bold" : "normal", padding: "0.5rem 1rem" }}>SPL Token</button>
      </div>

      {mode === "token" && (
        <input value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder="Token mint address" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.25rem" }} />
      )}
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient address" style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.25rem" }} />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={mode === "native" ? "Amount (SOL)" : "Raw amount"} style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace", marginBottom: "0.5rem" }} />

      <button onClick={handleTransfer} disabled={isPending} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
        {isPending ? "Confirming..." : "Send"}
      </button>

      {txSig && <p>Confirmed! Tx: <code style={{ fontSize: "0.8rem" }}>{txSig}</code></p>}
    </div>
  );
}

export default function TransferTokensPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TransferUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
