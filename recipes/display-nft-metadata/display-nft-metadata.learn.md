# Display NFT Metadata — Learn

## The metadata problem

An NFT on-chain is just a token ID and an ownership record. The art, name, and attributes that make it valuable live off-chain. This separation exists because storing images on a blockchain is prohibitively expensive — storing 1KB of data on Ethereum costs roughly $5–50 depending on gas prices.

The solution: store a URI on-chain that points to a JSON file that describes the NFT.

## ERC-721 Metadata JSON standard

The ERC-721 standard includes an optional metadata extension (ERC-721 Metadata) that defines:

```solidity
function tokenURI(uint256 tokenId) external view returns (string memory);
```

The URI must return JSON matching this schema:

```json
{
  "title": "Asset Metadata",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Name of the asset" },
    "description": { "type": "string", "description": "Description" },
    "image": { "type": "string", "description": "URI to the image" }
  }
}
```

Most collections extend this with an `attributes` array:

```json
{
  "name": "CoolNFT #42",
  "description": "One of 10,000 cool NFTs",
  "image": "ipfs://Qm.../42.png",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Eyes", "value": "Laser" },
    { "trait_type": "Rarity Score", "value": 97, "display_type": "number" }
  ]
}
```

OpenSea popularized this schema and most NFT platforms follow it.

## Metaplex JSON standard (Solana)

Metaplex defines a similar schema with some additions:

```json
{
  "name": "Cool NFT #42",
  "symbol": "COOL",
  "description": "One of 10,000 cool NFTs",
  "seller_fee_basis_points": 500,
  "image": "https://arweave.net/.../42.png",
  "external_url": "https://coolnfts.xyz",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" }
  ],
  "collection": {
    "name": "Cool NFTs",
    "family": "Cool"
  },
  "properties": {
    "files": [
      { "uri": "https://arweave.net/.../42.png", "type": "image/png" }
    ],
    "category": "image",
    "creators": [
      { "address": "CreatorPublicKey...", "share": 100 }
    ]
  }
}
```

Key additions: `seller_fee_basis_points` (royalties), `properties.creators` (provenance), `properties.files` (all associated files).

## How the Metaplex metadata PDA works

The Metaplex metadata account address is deterministically derived:

```ts
const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),      // seed 1: literal "metadata"
    METADATA_PROGRAM_ID.toBuffer(), // seed 2: Metaplex program ID
    mintPublicKey.toBuffer(),      // seed 3: the NFT's mint address
  ],
  METADATA_PROGRAM_ID
);
```

Given any mint address, you can always derive where the metadata lives — no indexer needed.

### Metaplex account data layout

The metadata account stores (simplified):

```
[1]    key (discriminator)
[32]   update_authority
[32]   mint
[4+n]  name (length-prefixed string)
[4+n]  symbol
[4+n]  uri
[2]    seller_fee_basis_points
[1+?]  creators (Option<Vec<Creator>>)
[1]    primary_sale_happened
[1]    is_mutable
...    (additional fields for editions, token standard, etc.)
```

## Resolving URIs

### IPFS

```ts
// ipfs://QmHash.../file.json → https://ipfs.io/ipfs/QmHash.../file.json
const resolved = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
```

Multiple gateways exist — use a reliable one or self-host:
- `https://ipfs.io/ipfs/`
- `https://cloudflare-ipfs.com/ipfs/`
- `https://gateway.pinata.cloud/ipfs/`
- `https://<hash>.ipfs.nftstorage.link/`

### Arweave

```ts
// ar://TxId → https://arweave.net/TxId
const resolved = uri.replace("ar://", "https://arweave.net/");
```

### Base64 on-chain data

```ts
// data:application/json;base64,eyJuYW1lIj...
if (uri.startsWith("data:application/json;base64,")) {
  const json = atob(uri.split(",")[1]);
  const metadata = JSON.parse(json);
}
```

On-chain SVGs use `data:image/svg+xml;base64,...` for the image field.

## Rendering considerations

### Image security

- Render images in `<img>` tags with a `referrerPolicy="no-referrer"` to prevent tracking
- For SVG NFTs, render in a sandboxed `<iframe>` to prevent XSS
- Consider running images through an image proxy service to avoid mixed content warnings

### CORS

IPFS gateways and Arweave support CORS from browsers. Direct RPC nodes typically do not — always fetch metadata from the client side, not server-side functions that might have restrictive CORS handling.

### Caching

Metadata is immutable (for reputable collections) — cache aggressively. A one-time fetch and local storage/IndexedDB cache dramatically improves UX for collection galleries.

## On-chain vs off-chain metadata

| | Fully on-chain | Off-chain (IPFS/Arweave) | Off-chain (HTTP) |
|---|---|---|---|
| **Permanence** | Permanent | Permanent (Arweave) / fragile (IPFS) | Fragile — server can go down |
| **Mutability** | Immutable once set | Immutable (content-addressed) | Can change anytime |
| **Cost** | Very high | Low (store URI only) | Low |
| **Examples** | Nouns, Autoglyphs | Most serious collections | Early/low-budget projects |

"Rug" risk for metadata: if an NFT project uses HTTP URIs and their server goes down, the metadata disappears. IPFS with pinning and Arweave are the safer choices.
