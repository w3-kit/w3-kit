# Switch Network

Switch between blockchain networks/clusters.

## What this does

**EVM:** Asks the user's wallet to switch to a different chain (e.g., Ethereum mainnet → Arbitrum). If the chain isn't configured in the wallet, it can prompt the user to add it.

**Solana:** Changes the RPC endpoint your app connects to (mainnet-beta, devnet, testnet). This is an app-level change, not a wallet-level one — Solana wallets don't have a "chain switch" concept.

## EVM vs Solana — Fundamental difference

| | EVM | Solana |
|---|---|---|
| **Concept** | Multiple independent chains (Ethereum, Arbitrum, Base, Polygon) each with their own chain ID | One chain with multiple clusters (mainnet-beta, devnet, testnet) |
| **Switching** | Wallet-level: `useSwitchChain()` asks the wallet to change chains | App-level: change the RPC endpoint in your ConnectionProvider |
| **User action** | Wallet popup asks user to approve the switch | No wallet interaction needed |
| **State impact** | Address stays the same, balances/tokens change | Address stays the same, balances/tokens change |

## Security notes

- On EVM, switching to an unknown chain may prompt "Add network" — users should verify the chain details
- Devnet/testnet tokens have no value — make it clear when users are on a test network
- Some dApps restrict functionality by chain to prevent accidental mainnet transactions during development

## Files

- `evm.tsx` — EVM implementation using wagmi `useSwitchChain`
- `solana.tsx` — Solana cluster switching with `useSolanaCluster` hook
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
