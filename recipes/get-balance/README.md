# Get Balance

Read native and token balances for a connected wallet.

## What this does

Fetches the balance of the native currency (ETH/SOL) and any token (ERC-20/SPL) for the connected wallet address.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Native balance** | `useBalance` (wagmi) or `getBalance` (viem) | `connection.getBalance()` returns lamports |
| **Token balance** | Call `balanceOf(address)` on the ERC-20 contract | Read the Associated Token Account (ATA) |
| **Decimals** | Stored in the token contract (`decimals()`) | Stored in the mint account |
| **Units** | Wei (ETH = 10^18 wei), varies per token | Lamports (SOL = 10^9 lamports), varies per token |
| **Zero balance** | Returns 0 | Token account may not exist at all |

## Key concept: Decimals

Token balances are stored as integers on-chain. A balance of `1000000` USDC means 1.0 USDC because USDC has 6 decimals.

- ETH: 18 decimals (1 ETH = 1,000,000,000,000,000,000 wei)
- SOL: 9 decimals (1 SOL = 1,000,000,000 lamports)
- USDC: 6 decimals on both chains

Always use `formatUnits(balance, decimals)` for display.

## Security notes

- Reading balances is a read-only operation — no transaction, no gas/fees
- Balance reads go to an RPC node, which may be rate-limited on free tiers
- Don't trust client-side balance reads for transaction validation — always verify server-side or on-chain

## Files

- `evm.tsx` — EVM implementation using wagmi
- `solana.tsx` — Solana implementation using wallet-adapter + spl-token
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
