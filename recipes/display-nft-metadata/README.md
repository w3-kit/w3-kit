# Display NFT Metadata

Fetch and render NFT metadata — name, image, and attributes — from EVM (ERC-721 tokenURI) or Solana (Metaplex metadata PDA).

## What this does

Given a contract+tokenId (EVM) or mint address (Solana), fetches the on-chain metadata pointer, resolves the off-chain JSON, and renders the NFT's image and attributes.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Metadata pointer** | `tokenURI(tokenId)` on the contract | Metaplex metadata PDA account |
| **On-chain data** | Just the URI (or base64 JSON) | Name, symbol, URI (and more) |
| **URI resolution** | ipfs://, ar://, https://, data:... | ipfs://, ar://, https:// |
| **Metadata standard** | ERC-721 Metadata JSON | Metaplex JSON standard |

## Key differences

### EVM: tokenURI is the single pointer
The ERC-721 contract stores one URI per token. That URI points to a JSON file. Everything about the NFT (name, image, attributes) lives in that JSON. Some contracts store the entire JSON base64-encoded directly in the URI.

### Solana: Two-layer metadata
Solana NFTs have on-chain metadata (name, symbol, URI stored in the Metaplex metadata account) plus off-chain metadata at the URI. The PDA is deterministic — given the mint address, you can always derive where the metadata account lives.

## Security notes

- **Verify the IPFS hash** — the same content always produces the same IPFS CID; a mismatch means the metadata was tampered with
- **Don't trust image URLs blindly** — render images in sandboxed contexts; some NFTs embed tracking pixels or XSS in SVGs
- **Arweave is more reliable than IPFS** — IPFS metadata may return 404 if the pin is gone

## Files

- `evm.tsx` — EVM implementation (tokenURI + JSON fetch)
- `solana.tsx` — Solana implementation (Metaplex PDA + URI fetch)
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
