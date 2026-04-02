# Mint NFT — Learn

## What is an NFT?

An NFT (Non-Fungible Token) is a token where each unit is unique and not interchangeable. A fungible token (like ETH or USDC) is interchangeable — one ETH equals any other ETH. An NFT is different: token #1 is not the same as token #2, even in the same collection.

The "non-fungible" property is enforced by the token standard:
- **EVM:** ERC-721 gives each token a unique `tokenId` and tracks ownership with `ownerOf(tokenId)`
- **Solana:** A mint account with 0 decimals and a max supply of 1 — physically impossible to have more than one

## How ERC-721 works

```solidity
// Core ERC-721 storage
mapping(uint256 => address) private _owners;       // tokenId → owner
mapping(address => uint256) private _balances;      // owner → count
mapping(uint256 => address) private _tokenApprovals; // tokenId → approved spender

function safeMint(address to, uint256 tokenId, string memory uri) external onlyOwner {
    _mint(to, tokenId);
    _setTokenURI(tokenId, uri); // stores the metadata URI
}

function ownerOf(uint256 tokenId) public view returns (address) {
    return _owners[tokenId]; // O(1) lookup
}
```

The ERC-721 standard (EIP-721) defines these required functions:
- `balanceOf(address)` — how many NFTs does this address own?
- `ownerOf(tokenId)` — who owns this specific token?
- `transferFrom(from, to, tokenId)` — transfer ownership
- `approve(to, tokenId)` — approve someone to transfer a specific token
- `tokenURI(tokenId)` — get the metadata URI for a token

## How Solana NFTs work

On Solana, an NFT is defined by three constraints on an SPL mint account:

1. **0 decimals** — can't have 0.5 of the token
2. **Max supply of 1** — mint authority is used exactly once, then (optionally) revoked
3. **Metaplex metadata** — a separate Program Derived Address account stores name, symbol, URI

```
NFT identity: mint account (PublicKey)
     ↓
Metaplex Metadata PDA: name, symbol, uri, creators, royalties
     ↓
Token account (ATA): holds the 1 token, owned by the NFT holder's wallet
```

The Metaplex Token Metadata Program is the de facto standard for Solana NFT metadata.

## Metadata standards

Both EVM and Solana store NFT metadata off-chain (usually IPFS or Arweave) and reference it with a URI.

### ERC-721 Metadata JSON

```json
{
  "name": "My NFT #1",
  "description": "A description of this NFT",
  "image": "ipfs://QmXxx.../image.png",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Eyes", "value": "Laser" }
  ]
}
```

### Metaplex JSON Standard

```json
{
  "name": "My NFT #1",
  "symbol": "MNFT",
  "description": "A description of this NFT",
  "seller_fee_basis_points": 500,
  "image": "https://arweave.net/xxx/image.png",
  "attributes": [
    { "trait_type": "Background", "value": "Blue" },
    { "trait_type": "Eyes", "value": "Laser" }
  ],
  "properties": {
    "files": [{ "uri": "https://arweave.net/xxx/image.png", "type": "image/png" }],
    "creators": [{ "address": "YourWallet...", "share": 100 }]
  }
}
```

## IPFS vs Arweave

| | IPFS | Arweave |
|---|---|---|
| **Cost** | Free to pin (via Pinata/NFT.storage); pay for persistence | One-time fee (~$0.01/MB) |
| **Permanence** | Data can disappear if unpinned | Permanent by design |
| **URI format** | `ipfs://QmHash...` | `ar://TxId...` or `https://arweave.net/TxId` |
| **Speed** | Variable gateway speed | Fast via arweave.net |

For production NFT collections, Arweave is preferred because the data is permanent. IPFS data can disappear if nobody pins it.

## The minting flow

### EVM full flow

1. Deploy an ERC-721 contract (once per collection)
2. Call `safeMint(to, tokenId, tokenURI)` for each NFT
3. The contract stores `_owners[tokenId] = to`
4. Wallets and marketplaces read `tokenURI(tokenId)` to display the NFT

### Solana full flow

1. Generate a new keypair for each NFT mint
2. Create the mint account (SystemProgram.createAccount)
3. Initialize as SPL mint with 0 decimals (createInitializeMintInstruction)
4. Create the recipient's Associated Token Account
5. Mint exactly 1 token (createMintToInstruction)
6. (Optional but recommended) Attach Metaplex metadata via `createCreateMetadataAccountV3Instruction`
7. (Optional) Revoke mint authority — proves no more can ever be minted

## Revoking mint authority

After minting your collection, you can make it immutable by revoking the mint authority:

```ts
// Solana — after minting all tokens
await setAuthority(
  connection,
  payer,
  mintPubkey,
  currentAuthority,
  AuthorityType.MintTokens,
  null // ★ null = revoke
);
```

On EVM, you renounce ownership of the contract (or remove the minter role), preventing any future mints.
