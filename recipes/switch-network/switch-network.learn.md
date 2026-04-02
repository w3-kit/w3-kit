# Switch Network — Learn

## EVM: A world of chains

The EVM ecosystem has dozens of chains: Ethereum, Arbitrum, Base, Optimism, Polygon, BSC, Avalanche, and more. Each is an independent blockchain with its own:
- **Chain ID** — a unique number (Ethereum = 1, Arbitrum = 42161, Base = 8453)
- **Native token** — ETH, MATIC, AVAX, BNB
- **Block time** — ranging from ~1s (L2s) to ~12s (Ethereum)
- **Gas costs** — from fractions of a cent (L2s) to dollars (Ethereum)

Your wallet manages which chain you're on. When you switch chains, your address stays the same but your balances and available tokens change.

### How chain switching works

1. Your dApp calls `wallet_switchEthereumChain` with a chain ID
2. The wallet checks if it knows that chain
3. If yes: wallet switches, dApp gets notified via the `chainChanged` event
4. If no: wallet may prompt "Add network?" with chain details (RPC URL, explorer, etc.)

wagmi's `useSwitchChain` handles all of this, including the "add chain" fallback.

### L2s and rollups

Most EVM chains you'll switch to are L2s (Layer 2) — chains that settle their transactions on Ethereum for security. They're cheaper and faster, but inherit Ethereum's security guarantees.

- **Optimistic rollups** (Arbitrum, Optimism, Base): assume transactions are valid, challenge if not
- **ZK rollups** (zkSync, StarkNet, Scroll): prove every transaction is valid with math

## Solana: One chain, multiple clusters

Solana doesn't have separate chains. There's one Solana, with different "clusters" for different purposes:

- **mainnet-beta** — production, real money
- **devnet** — free test tokens, resets periodically
- **testnet** — validator testing, less stable than devnet

Switching clusters means changing the RPC endpoint your app connects to. This is a code-level change, not a wallet-level one. The wallet doesn't care which cluster you're on — it signs whatever you send it.

### Why this matters for dApp developers

On EVM, you need to handle `chainChanged` events and update your UI when the user switches chains in their wallet (outside your app).

On Solana, you control the cluster entirely from your app. The user can't change it from the wallet.

## Chain ID vs Cluster endpoint

**EVM chain IDs** are standardized and wallet-level:
```typescript
// The wallet knows these chains
switchChain({ chainId: 42161 }); // Arbitrum
```

**Solana clusters** are just RPC URLs at the app level:
```typescript
// Your app controls this
const endpoint = clusterApiUrl("devnet");
<ConnectionProvider endpoint={endpoint}>
```
