"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

function SignMessageUI() {
  const { publicKey, connected, signMessage: walletSignMessage, disconnect } = useWallet();
  const [message, setMessage] = useState("Hello from w3-kit!");
  const [signature, setSignature] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!connected || !publicKey) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Sign Message (Solana)</h2>
        <p>Connect a wallet first.</p>
        <WalletMultiButton />
      </div>
    );
  }

  const handleSign = async () => {
    if (!walletSignMessage) return;
    setIsPending(true);
    try {
      const encoded = new TextEncoder().encode(message);
      const sig = await walletSignMessage(encoded);
      setSignature(Buffer.from(sig).toString("hex"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Sign Message (Solana)</h2>
      <p><strong>Address:</strong> {publicKey.toBase58()}</p>
      <div style={{ margin: "1rem 0" }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: "0.5rem", width: "300px", fontFamily: "monospace" }}
        />
        <button
          onClick={handleSign}
          disabled={isPending || !walletSignMessage}
          style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem", cursor: "pointer" }}
        >
          {isPending ? "Signing..." : "Sign"}
        </button>
      </div>
      {signature && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Signature:</strong></p>
          <code style={{ wordBreak: "break-all", fontSize: "0.8rem" }}>{signature}</code>
        </div>
      )}
      <button onClick={disconnect} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
        Disconnect
      </button>
    </div>
  );
}

export default function SignMessagePage() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SignMessageUI />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
