# Fetch Token Metadata

Read a token's name, symbol, decimals, and supply.

## What this does

Reads on-chain metadata for any token. On EVM, this means calling view functions on the ERC-20 contract. On Solana, it means reading the mint account and optionally the Metaplex metadata account.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Name/Symbol** | Stored in the ERC-20 contract (`name()`, `symbol()`) | Stored in Metaplex Token Metadata PDA |
| **Decimals** | `decimals()` on the contract | `getMint()` returns decimals |
| **Supply** | `totalSupply()` on the contract | `getMint()` returns supply |
| **Image/URI** | Not standard in ERC-20 (use token lists or ERC-721 tokenURI) | Metaplex metadata includes `uri` pointing to JSON with image |

## Key concept: On-chain vs off-chain metadata

**EVM:** ERC-20 stores name, symbol, and decimals on-chain. Logos and additional metadata come from off-chain token lists (like Uniswap's).

**Solana:** The SPL Token program only stores decimals and supply. Name, symbol, and image are stored via the Metaplex Token Metadata program in a separate PDA account.

## Files

- `evm.tsx` — EVM implementation using wagmi `useReadContracts`
- `solana.tsx` — Solana implementation using `getMint` + Metaplex PDA
- `example/evm/page.tsx` — Runnable EVM example
- `example/solana/page.tsx` — Runnable Solana example
