"use client";

import { useAccount, useSwitchChain } from "wagmi";

export function SwitchNetwork() {
  const { chain } = useAccount();
  const { chains, switchChain, isPending } = useSwitchChain();

  return (
    <div>
      <h2>Switch Network</h2>
      <p>Current chain: {chain?.name ?? "Not connected"} (ID: {chain?.id})</p>
      <div>
        {chains.map((c) => (
          <button
            key={c.id}
            onClick={() => switchChain({ chainId: c.id })}
            disabled={isPending || c.id === chain?.id}
          >
            {c.name}
            {c.id === chain?.id && " (current)"}
          </button>
        ))}
      </div>
    </div>
  );
}
