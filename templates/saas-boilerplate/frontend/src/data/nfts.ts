export const MOCK_NFTS = Array.from({ length: 12 }, (_, i) => ({
  id: `nft-${i + 1}`,
  name: `Launchpad Genesis #${i + 1}`,
  description: "A unique genesis NFT from the Token Launchpad collection.",
  image: `https://picsum.photos/seed/nft${i + 1}/400/400`,
  collection: "Launchpad Genesis",
  owner: `0x742d35Cc6634C0532925a3b844Bc${i.toString().padStart(4, "0")}`,
  price: (0.05 + Math.random() * 2).toFixed(3),
  currency: "ETH",
  tokenId: i + 1,
  contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
  attributes: [
    { trait_type: "Rarity", value: ["Common", "Uncommon", "Rare", "Legendary"][i % 4] },
    { trait_type: "Power Level", value: Math.floor(Math.random() * 100) },
  ],
}));
