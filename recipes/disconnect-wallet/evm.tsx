"use client";

import { useAccount, useDisconnect } from "wagmi";

export function DisconnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return <p>No wallet connected.</p>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
