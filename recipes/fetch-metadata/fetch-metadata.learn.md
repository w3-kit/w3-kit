# Fetch Token Metadata — Learn

## Where metadata lives

### EVM: In the contract

ERC-20 tokens optionally implement metadata functions:

```solidity
function name() public view returns (string)      // "USD Coin"
function symbol() public view returns (string)     // "USDC"
function decimals() public view returns (uint8)    // 6
function totalSupply() public view returns (uint256)
```

These are "view" functions — free to call, no gas cost. But they're optional in the ERC-20 standard. Some tokens (especially old ones) don't implement them.

For logos and richer metadata, EVM relies on off-chain "token lists" — curated JSON files mapping addresses to metadata. Uniswap, CoinGecko, and others maintain these.

### Solana: Split across two programs

**SPL Token program** (core): Only stores `decimals`, `supply`, `mintAuthority`, `freezeAuthority`. No name, symbol, or image.

**Metaplex Token Metadata program** (optional): Stores name, symbol, and a `uri` pointing to a JSON file with the full metadata (image, description, attributes).

The metadata lives in a PDA (Program Derived Address) derived from:
```
seeds = ["metadata", METADATA_PROGRAM_ID, mint_address]
```

This separation exists because the SPL Token program was designed to be minimal. Metaplex added the metadata layer later as a separate standard.

## Token lists vs on-chain metadata

The web3 ecosystem uses two approaches for token metadata:

1. **On-chain** (Solana Metaplex, ERC-721 tokenURI): Metadata lives on the blockchain. Trustless but costs money to store.

2. **Off-chain token lists** (EVM ecosystem): Curated JSON files hosted on IPFS or CDNs. Free to maintain, but requires trusting the list curator.

Most production dApps use a combination: on-chain data for core fields (decimals, supply) and token lists for logos and display info.

## Batch reads

Reading metadata for many tokens can be expensive in RPC calls. Both ecosystems have optimizations:

**EVM:** wagmi's `useReadContracts` batches multiple calls into a single `eth_call` using Multicall3. One RPC request for 100 tokens.

**Solana:** `connection.getMultipleAccountsInfo()` fetches multiple accounts in one RPC call. You can batch mint accounts and metadata PDAs together.
