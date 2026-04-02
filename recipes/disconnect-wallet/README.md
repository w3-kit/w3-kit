# Disconnect Wallet

Disconnect a user's wallet from your dApp.

## What this does

Ends the connection between the user's wallet and your dApp. Clears the session state and removes the dApp's access to the user's address.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Method** | `useDisconnect()` from wagmi | `useWallet().disconnect()` |
| **What it clears** | Wallet connector state, cached accounts | Wallet adapter state, event listeners |
| **Persists across reloads?** | wagmi clears localStorage connector info | wallet-adapter respects `autoConnect` setting |

## When to disconnect

- User clicks "Disconnect" or "Log out"
- Session timeout (security best practice)
- Switching between wallets
- Cleaning up on component unmount (optional, depends on UX)

## Security notes

- Always provide a visible disconnect option — users should control their connections
- Disconnecting does NOT revoke on-chain approvals (token spending permissions) — those require separate transactions
- On EVM, some wallets also need you to disconnect from the wallet extension UI

## Files

- `evm.tsx` — EVM implementation using wagmi
- `solana.tsx` — Solana implementation using wallet-adapter
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
