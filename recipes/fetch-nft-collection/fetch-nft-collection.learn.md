# Fetch NFT Collection — Learn

## How NFT ownership is tracked

### EVM: mappings inside the contract

Every ERC-721 contract maintains its own ownership mapping:

```solidity
mapping(uint256 => address) private _owners; // tokenId → current owner
mapping(address => uint256) private _balances; // owner → how many tokens
```

To list NFTs, you need the contract address and either:
1. **ERC721Enumerable** extension — adds `tokenOfOwnerByIndex(address, index)` for O(n) iteration
2. **Transfer events** — scan `Transfer` events from the contract logs (requires an indexer)
3. **Third-party indexer** — Alchemy, Moralis, or The Graph maintain cross-contract indexes

### Solana: token accounts

On Solana, every token holding is a separate "token account" — a small account that stores:
- `mint` — which token/NFT this account is for
- `owner` — which wallet controls it
- `amount` — how many tokens (1 for NFTs)
- `decimals` — 0 for NFTs

You can fetch all token accounts for a wallet in a single RPC call:

```ts
const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
  programId: TOKEN_PROGRAM_ID,
});
// Filter for NFTs
const nfts = tokenAccounts.value.filter(ta =>
  ta.account.data.parsed.info.tokenAmount.decimals === 0 &&
  ta.account.data.parsed.info.tokenAmount.uiAmount === 1
);
```

## Enumeration patterns

### EVM: ERC721Enumerable

```solidity
interface IERC721Enumerable {
  function totalSupply() external view returns (uint256);
  function tokenByIndex(uint256 index) external view returns (uint256);
  function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}
```

`tokenOfOwnerByIndex(owner, 0)` through `tokenOfOwnerByIndex(owner, balanceOf(owner) - 1)` gives you all token IDs. This requires the contract to implement the Enumerable extension — not all do.

### EVM: Event-based enumeration

An alternative that works with any ERC-721 contract:

```ts
// Get all Transfer events where the recipient is the target address
const transferLogs = await client.getLogs({
  address: contractAddress,
  event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"),
  args: { to: ownerAddress },
  fromBlock: 0n,
});
// Deduplicate (tokens may have been transferred out then back)
```

This is how most indexers work. It's more complete but requires scanning historical logs.

## Off-chain metadata: IPFS, Arweave, HTTP

The `tokenURI` (EVM) or metadata URI (Solana) typically resolves to one of:

### IPFS URIs

```
ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/1.json
```

To resolve, use an IPFS gateway:
```ts
const gatewayUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
const metadata = await fetch(gatewayUrl).then(r => r.json());
```

Public gateways: `ipfs.io`, `cloudflare-ipfs.com`, `gateway.pinata.cloud`

### Arweave URIs

```
ar://TxId123.../1.json
// or
https://arweave.net/TxId123.../1.json
```

### Base64-encoded on-chain data

Some NFTs (like early CryptoPunks or Nouns) store metadata directly on-chain:
```
data:application/json;base64,eyJuYW1lIjogIk5vdW4...
```

Decode with `atob()` or `Buffer.from(data, "base64").toString()`.

## On-chain vs off-chain metadata

| | On-chain | Off-chain (IPFS/Arweave) |
|---|---|---|
| **Permanence** | Permanent as long as chain exists | Depends on storage service |
| **Cost** | High — storage on-chain is expensive | Low — storing a URI is cheap |
| **Mutability** | Immutable once set (usually) | Could change if not on Arweave |
| **Examples** | Nouns, Autoglyphs | Most ERC-721 collections |

Fully on-chain NFTs are considered more "pure" — the art and metadata survive as long as the blockchain does. Most collections use off-chain storage for cost reasons.

## Building a collection gallery

Once you have token IDs and URIs, display the collection:

```ts
async function resolveMetadata(uri: string) {
  const url = uri.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
    : uri;
  return fetch(url).then(r => r.json());
}

// metadata shape
type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
};
```

For large collections, use a dedicated NFT indexer API (Alchemy, Moralis) rather than resolving each URI individually — they cache metadata and handle rate limits.
