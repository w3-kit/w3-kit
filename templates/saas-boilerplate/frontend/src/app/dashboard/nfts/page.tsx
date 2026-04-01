"use client";

import { NFTCollectionGrid } from "@/components/w3-kit/nft-collection-grid";
import { NFTMarketplaceAggregator } from "@/components/w3-kit/nft-marketplace-aggregator";
import { MOCK_NFTS } from "@/data/nfts";

export default function NftsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-white">NFTs</h1>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Collection Browser</h2>
        <NFTCollectionGrid nfts={MOCK_NFTS as any} />
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Marketplace</h2>
        <NFTMarketplaceAggregator />
      </section>
    </div>
  );
}
