# Mint NFT

Mint a new NFT on EVM (ERC-721) or Solana (SPL Token with 0 decimals + Metaplex metadata).

## What this does

Creates a new non-fungible token and assigns it to a recipient wallet. On EVM, this calls `safeMint` on a deployed ERC-721 contract. On Solana, it creates a new mint account with 0 decimals and mints exactly 1 token.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Standard** | ERC-721 (`safeMint`) | SPL Token (0 decimals, supply 1) |
| **Metadata** | `tokenURI` → off-chain JSON | Metaplex PDA → off-chain JSON |
| **Contract needed?** | Yes — deploy an ERC-721 contract first | No — mint account is created at mint time |
| **Who pays?** | Caller pays gas | Caller pays rent (~0.002 SOL) + fees |
| **Signers** | Connected wallet | Wallet + new mint keypair |

## Key differences

### EVM: Deploy first, then mint
You must first deploy an ERC-721 contract (or use an existing one). The contract tracks ownership in a mapping. Only the contract owner (or an authorized minter role) can call `safeMint`.

### Solana: The mint IS the NFT
Each NFT is a new SPL mint account with 0 decimals and a max supply of 1. There's no central contract — the mint account itself is the NFT identity. The Metaplex metadata program attaches name/image/attributes via a separate PDA account.

## Security notes

- **Verify the contract address** — on EVM, always verify the ERC-721 contract before minting
- **Store the mint address** — on Solana, save the generated mint keypair/address; it's the NFT's permanent identity
- **Pin your metadata** — use IPFS or Arweave for metadata URIs, not HTTP URLs that can change
- **Revoke mint authority** — after minting your full collection, revoke the mint authority to cap supply

## Files

- `evm.tsx` — EVM implementation (calls `safeMint` on an ERC-721 contract)
- `solana.tsx` — Solana implementation (creates mint account + mints 1 token)
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
