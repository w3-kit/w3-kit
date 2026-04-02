# Transfer Tokens

Send native currency (ETH/SOL) or tokens (ERC-20/SPL) to another address.

## What this does

Creates and sends a transaction that moves tokens from the connected wallet to a recipient address. Covers both native currency and token transfers.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Native transfer** | `useSendTransaction` with value in wei | `SystemProgram.transfer` with lamports |
| **Token transfer** | Call `transfer(to, amount)` on the ERC-20 contract | `createTransferInstruction` on SPL Token program |
| **Recipient setup** | No setup needed — any address can receive ERC-20 | Recipient needs an Associated Token Account (ATA) |
| **Gas/fees** | Sender pays gas (variable, depends on network congestion) | Sender pays ~0.000005 SOL per transaction + rent if creating ATA |
| **Confirmation** | Wait for transaction receipt | `confirmTransaction` with commitment level |

## Key differences

### EVM: Just call `transfer()`
On EVM, you call the `transfer` function on the token contract. If the recipient address exists, the transfer works. Simple.

### Solana: Check for the recipient's token account
On Solana, you can't send tokens to an address that doesn't have a token account for that specific mint. You may need to create the Associated Token Account (ATA) first, which costs ~0.002 SOL in rent.

## Security notes

- **Double-check recipient addresses** — blockchain transfers are irreversible
- **Verify the token contract** — on EVM, anyone can create a token with any name. Verify the contract address.
- **Watch for decimals** — sending 1000000 of a token with 18 decimals is 0.000000000001 tokens
- **Test on devnet/testnet first** — always test with worthless tokens before mainnet

## Files

- `evm.tsx` — EVM implementation (native ETH + ERC-20)
- `solana.tsx` — Solana implementation (native SOL + SPL tokens)
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
