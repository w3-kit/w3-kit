"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function ConnectWallet() {
  const { publicKey, connected, disconnect } = useWallet();

  if (connected && publicKey) {
    return (
      <div>
        <p>Connected: {publicKey.toBase58()}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Connect Wallet</h2>
      <WalletMultiButton />
    </div>
  );
}
