# Connect Wallet

Connect a user's wallet to your dApp.

## What this does

Detects installed wallets, lets the user pick one, and establishes a connection. Once connected, your dApp can see the user's address and request transaction signatures.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Library** | wagmi + viem | @solana/wallet-adapter-react |
| **Discovery** | EIP-6963 auto-detects all installed wallets | Wallet Standard API |
| **Key wallet** | MetaMask | Phantom |
| **Address format** | `0x` + 40 hex chars | Base58 string |
| **Connection scope** | Grants access to all accounts in the wallet | Grants access to the selected account |

## Security notes

- Connection only grants **read** access to the address — the dApp cannot move funds without the user signing each transaction
- Users should disconnect from dApps they no longer use
- Always verify you're on the correct domain before connecting

## Files

- `evm.tsx` — EVM implementation using wagmi
- `solana.tsx` — Solana implementation using wallet-adapter
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
