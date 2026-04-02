"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export function DisconnectWallet() {
  const { publicKey, connected, disconnect } = useWallet();

  if (!connected || !publicKey) {
    return <p>No wallet connected.</p>;
  }

  return (
    <div>
      <p>Connected: {publicKey.toBase58()}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
