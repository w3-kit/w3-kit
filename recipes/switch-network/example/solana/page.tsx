"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, type Cluster } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

const CLUSTERS: { name: string; cluster: Cluster }[] = [
  { name: "Mainnet Beta", cluster: "mainnet-beta" },
  { name: "Devnet", cluster: "devnet" },
  { name: "Testnet", cluster: "testnet" },
];

function ClusterUI({ currentCluster, onSwitch }: { currentCluster: Cluster; onSwitch: (c: Cluster) => void }) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Switch Cluster (Solana)</h2>
      {connected && publicKey && <p><strong>Address:</strong> {publicKey.toBase58()}</p>}
      <p><strong>Endpoint:</strong> {connection.rpcEndpoint}</p>
      <div style={{ marginTop: "1rem" }}>
        {CLUSTERS.map((c) => (
          <button
            key={c.cluster}
            onClick={() => onSwitch(c.cluster)}
            disabled={c.cluster === currentCluster}
            style={{
              display: "block",
              margin: "0.5rem 0",
              padding: "0.5rem 1rem",
              cursor: c.cluster === currentCluster ? "default" : "pointer",
              background: c.cluster === currentCluster ? "#e0e0e0" : "white",
              fontWeight: c.cluster === currentCluster ? "bold" : "normal",
            }}
          >
            {c.name}
            {c.cluster === currentCluster && " ← current"}
          </button>
        ))}
      </div>
      {!connected && <WalletMultiButton style={{ marginTop: "1rem" }} />}
    </div>
  );
}

// ★ Switching clusters requires re-rendering the ConnectionProvider with a new endpoint
export default function SwitchClusterPage() {
  const [cluster, setCluster] = useState<Cluster>("devnet");
  const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ClusterUI currentCluster={cluster} onSwitch={setCluster} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
