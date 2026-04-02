# Buy NFT — Learn

## How NFT marketplaces work

At the protocol level, buying an NFT is a token transfer. The complexity lies in making that transfer trustless — the buyer shouldn't pay without receiving the NFT, and the seller shouldn't give up the NFT without receiving payment.

Marketplaces solve this with escrow:

```
Simple (risky): Buyer sends ETH → Seller sends NFT  (two separate txs — seller can ghost)

Marketplace (safe):
  Seller approves marketplace contract
  Buyer calls marketplace.buy() with ETH value
  Contract atomically: transfers ETH to seller + transfers NFT to buyer
  One transaction — either both happen or neither does
```

## EVM: The approve + transferFrom pattern

### How approval works

```solidity
// Seller calls this
function approve(address to, uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender);
    _tokenApprovals[tokenId] = to; // Anyone can read this
}

// Marketplace contract calls this
function transferFrom(address from, address to, uint256 tokenId) external {
    require(
        msg.sender == from ||
        msg.sender == _tokenApprovals[tokenId] || // ★ approved party can transfer
        isApprovedForAll(from, msg.sender)
    );
    _transfer(from, to, tokenId);
}
```

### setApprovalForAll

Instead of approving token by token, sellers can approve all their tokens to a marketplace:

```solidity
nft.setApprovalForAll(marketplaceAddress, true);
// Now the marketplace can transfer any of your NFTs
// This is what "listing on OpenSea" does
```

This is convenient but grants the marketplace broad authority over your NFTs.

### How a marketplace buy works

```solidity
// Simplified marketplace contract
function buy(address nftContract, uint256 tokenId) external payable {
    Listing memory listing = listings[nftContract][tokenId];
    require(msg.value >= listing.price, "Insufficient payment");

    // Atomic: payment + transfer in one tx
    IERC721(nftContract).transferFrom(listing.seller, msg.sender, tokenId);
    payable(listing.seller).transfer(listing.price);

    emit NFTSold(nftContract, tokenId, listing.seller, msg.sender, listing.price);
}
```

## Royalties

### EIP-2981 (EVM)

```solidity
// On the NFT contract
function royaltyInfo(uint256 tokenId, uint256 salePrice)
    external view returns (address receiver, uint256 royaltyAmount)
{
    return (creatorAddress, salePrice * royaltyBps / 10000);
}
```

EIP-2981 is informational — it says "here's how much royalty is owed." Enforcement is up to the marketplace. Some marketplaces (like Blur) made royalties optional, causing controversy in the NFT space.

### Metaplex royalties (Solana)

```json
{
  "seller_fee_basis_points": 500,  // 5% royalty
  "properties": {
    "creators": [
      { "address": "CreatorWallet...", "share": 100 }
    ]
  }
}
```

Similarly, Metaplex royalties are enforced by marketplaces, not the protocol. The Metaplex Programmable NFTs (pNFTs) standard was introduced to allow on-chain royalty enforcement via transfer hooks.

## Solana: Escrow-based buying

On Solana, the common pattern is:

```
1. Seller: deposit NFT into marketplace escrow account
2. Seller: create a listing account with price + terms
3. Buyer: call marketplace.executeSale() with SOL
4. Program: atomically releases NFT to buyer + SOL to seller
5. Program: closes escrow account, returns rent to seller
```

The NFT physically sits in an escrow token account between listing and sale. This is more capital-efficient than EVM approvals because the NFT is locked — you can't accidentally list the same NFT on two marketplaces.

## Auction patterns

Beyond fixed-price sales, common auction types:

| Type | How it works | Example |
|---|---|---|
| **English (ascending)** | Bids increase, highest wins at deadline | eBay style |
| **Dutch (descending)** | Price drops over time, first buyer wins | Art Blocks |
| **Reserve price** | Sale only happens if minimum bid met | Most NFT auctions |
| **FCFS (fixed price)** | First come, first served | Mint events |

Each requires different smart contract logic, but all build on the same approve/transfer primitives.
