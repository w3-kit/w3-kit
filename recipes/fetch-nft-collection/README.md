# Fetch NFT Collection

List all NFTs owned by a wallet address — on EVM (ERC-721 Enumerable) or Solana (SPL token accounts filtered for NFTs).

## What this does

Queries the chain for all NFTs owned by a given wallet and returns token IDs and metadata URIs. Useful for building portfolio views, gallery pages, or transfer UIs.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **How ownership is tracked** | Mapping in ERC-721 contract | Token account with amount=1 |
| **Enumeration method** | `balanceOf` + `tokenOfOwnerByIndex` (ERC721Enumerable) | `getParsedTokenAccountsByOwner` filtered for decimals=0, amount=1 |
| **Metadata location** | `tokenURI(tokenId)` on the contract | Metaplex metadata PDA |
| **Contract-specific?** | Yes — must know the contract address | No — scans all token accounts |
| **Speed** | Slow for large collections (sequential RPC calls) | One RPC call returns all token accounts |

## Key differences

### EVM: Contract-scoped enumeration
ERC-721 Enumerable lets you list tokens for a given contract. To find all NFTs across all contracts, you'd need an indexer (like Alchemy NFT API or The Graph) — there's no on-chain way to query "all ERC-721 tokens for this address" across all contracts efficiently.

### Solana: Wallet-scoped by default
On Solana, `getParsedTokenAccountsByOwner` returns all SPL token accounts for a wallet — you filter for the ones with 0 decimals and amount=1 to find NFTs. No indexer needed for basic enumeration.

## Security notes

- **Verify contract authenticity** — on EVM, query a specific trusted contract address
- **Watch for fake NFTs** — on Solana, filter by verified Metaplex metadata to avoid spam tokens
- **Rate limits** — sequential RPC calls for large collections will hit rate limits; use multicall on EVM or batch requests on Solana

## Files

- `evm.tsx` — EVM implementation (ERC-721 Enumerable)
- `solana.tsx` — Solana implementation (getParsedTokenAccountsByOwner + NFT filter)
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
