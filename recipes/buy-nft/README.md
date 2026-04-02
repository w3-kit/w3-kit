# Buy NFT

Demonstrates the NFT purchase flow: approve-then-transfer on EVM (ERC-721), and token account transfer on Solana.

## What this does

Shows the fundamental mechanics behind NFT buying. Real marketplaces wrap these primitives in escrow contracts/programs for trustless atomic swaps — but the core operations are `approve` + `transferFrom` on EVM and an SPL token transfer on Solana.

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Core pattern** | `approve(buyer, tokenId)` → `transferFrom(seller, buyer, tokenId)` | `createTransferInstruction` from seller ATA to buyer ATA |
| **Trustless buying** | Marketplace contract holds order, calls `transferFrom` atomically with payment | Marketplace program uses escrow account for atomic swap |
| **Royalties** | EIP-2981 `royaltyInfo()` — enforced by marketplace (not the standard itself) | Metaplex `seller_fee_basis_points` — enforced by marketplace |
| **Listing** | Off-chain order + on-chain approval | Off-chain order + on-chain escrow or approval |

## Key differences

### EVM: Two-step approve + transfer

The ERC-721 standard separates approval from transfer. A seller "lists" an NFT by approving a marketplace contract. When a buyer purchases, the marketplace calls `transferFrom` atomically with the ETH payment — both happen in one transaction.

### Solana: Escrow-based marketplaces

On Solana, NFT marketplaces typically use an escrow program. The seller deposits the NFT into an escrow account, and when a buyer pays, the program atomically releases the NFT to the buyer and SOL to the seller.

## Security notes

- **Never call transferFrom without payment in the same tx** — the two-step pattern is only safe inside a marketplace contract that bundles payment + transfer
- **Verify the marketplace contract** — only interact with audited marketplace contracts
- **Check royalties** — some marketplaces bypass on-chain royalties; verify the fee structure
- **Inspect the NFT before buying** — check the contract address and token metadata to avoid counterfeits

## Files

- `evm.tsx` — EVM implementation (approve + transferFrom)
- `solana.tsx` — Solana implementation (SPL token transfer pattern)
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
