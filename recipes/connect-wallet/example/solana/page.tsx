"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// ★ Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

function WalletUI() {
  const { publicKey, connected, disconnect } = useWallet();

  if (connected && publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>✅ Connected</h2>
        <p><strong>Address:</strong> {publicKey.toBase58()}</p>
        <button onClick={disconnect} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Connect Wallet (Solana)</h2>
      <WalletMultiButton />
    </div>
  );
}

// ★ This is the full page — drop it into your Next.js app at app/connect/page.tsx
export default function ConnectWalletPage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
