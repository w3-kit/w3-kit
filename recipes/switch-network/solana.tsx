"use client";

import { useState } from "react";
import { clusterApiUrl, type Cluster } from "@solana/web3.js";

// ★ Solana doesn't have "chain switching" like EVM.
// Instead, you change the RPC endpoint your app connects to.
// This requires re-rendering your ConnectionProvider with a new endpoint.

const CLUSTERS: { name: string; cluster: Cluster; endpoint: string }[] = [
  { name: "Mainnet Beta", cluster: "mainnet-beta", endpoint: clusterApiUrl("mainnet-beta") },
  { name: "Devnet", cluster: "devnet", endpoint: clusterApiUrl("devnet") },
  { name: "Testnet", cluster: "testnet", endpoint: clusterApiUrl("testnet") },
];

export function useSolanaCluster() {
  const [currentCluster, setCurrentCluster] = useState(CLUSTERS[1]); // Default: devnet

  const switchCluster = (cluster: Cluster) => {
    const found = CLUSTERS.find((c) => c.cluster === cluster);
    if (found) setCurrentCluster(found);
  };

  return { currentCluster, switchCluster, clusters: CLUSTERS };
}

export function SwitchCluster() {
  const { currentCluster, switchCluster, clusters } = useSolanaCluster();

  return (
    <div>
      <h2>Switch Cluster</h2>
      <p>Current: {currentCluster.name}</p>
      <div>
        {clusters.map((c) => (
          <button
            key={c.cluster}
            onClick={() => switchCluster(c.cluster)}
            disabled={c.cluster === currentCluster.cluster}
          >
            {c.name}
            {c.cluster === currentCluster.cluster && " (current)"}
          </button>
        ))}
      </div>
    </div>
  );
}
