# Resolve Address — Learn

## DNS vs ENS: same idea, different trust model

The traditional Domain Name System (DNS) maps human-readable names (`google.com`) to IP addresses. A hierarchy of servers — ICANN at the top, then registrars, then your ISP — all have authority to modify or revoke records. You trust the system.

ENS (Ethereum Name Service) replaces that trust hierarchy with a smart contract on Ethereum. The `.eth` registry lives at a single well-known address. Ownership of a name is an on-chain NFT — no registrar can revoke it without a transaction signed by the owner. Resolution is just a series of view calls.

The trade-off: DNS is fast (cached, global infrastructure). ENS requires an RPC call to Ethereum mainnet. For a dApp that already talks to the blockchain, the latency is acceptable.

## How ENS resolution works

### Forward lookup (name → address)

ENS uses a two-contract system:

1. **Registry** — maps names (by their namehash) to resolver contract addresses
2. **Resolver** — stores the actual records (address, avatar, text records, etc.)

viem's `getEnsAddress` does this automatically:
```
client.getEnsAddress({ name: "vitalik.eth" })
  → fetches Registry to find the Resolver contract
  → calls Resolver.addr(namehash("vitalik.eth"))
  → returns the address
```

### The namehash algorithm

ENS doesn't store names as strings — it hashes them to fixed-size identifiers using a recursive algorithm:

```
namehash("") = 0x0000…0000
namehash("eth") = keccak256(namehash("") + keccak256("eth"))
namehash("vitalik.eth") = keccak256(namehash("eth") + keccak256("vitalik"))
```

This lets ENS represent any depth of subdomain hierarchy and prevents names from leaking in the storage layer.

### Reverse lookup (address → name)

Reverse records live under the `.addr.reverse` domain. To get `vitalik.eth` from an address:

1. Compute the reverse node: `namehash("<lowercase address>.addr.reverse")`
2. Look up the name record in the resolver for that node
3. Verify by forward-resolving the returned name — this prevents spoofing

viem's `getEnsName` does all of this in one call.

### CCIP-Read and L2 names

ENS supports **CCIP-Read** (EIP-3668), which lets resolvers fetch data from off-chain sources. This enables:
- `.eth` names resolving to L2 addresses (e.g., a name that points to an Optimism address)
- Custom TLDs (e.g., `.cb.id` from Coinbase Wallet)
- Names stored on L2s with L1 as the trust anchor

For your app this is transparent — viem handles CCIP-Read automatically. But it means ENS resolution can involve HTTP requests to off-chain gateways in addition to RPC calls.

## SNS: PDAs as name accounts

On Solana, there's no concept of "calling a resolver contract." Instead, Bonfida's SNS (Solana Name Service) uses **PDAs** (Program Derived Addresses) to make name accounts discoverable.

### How forward lookup works

The name account address is derived deterministically:

```
seeds = [hashed_name, ROOT_DOMAIN_ACCOUNT, parent_account_pubkey]
```

`getDomainKey("bonfida")` computes this PDA and returns it. Then `NameRegistryState.retrieve` reads the account data at that address to get the owner's public key.

Because the PDA is deterministic, anyone can compute where a name lives without querying a registry contract — the address *is* the registry entry.

### How reverse lookup works

SNS stores reverse mappings in separate accounts, also PDAs:

```
seeds = [hashed_pubkey, REVERSE_LOOKUP_CLASS]
```

`performReverseLookup` derives this PDA and reads the name stored in it. Like ENS, reverse records are optional — an address may own a `.sol` name but not have a reverse record set.

### Why PDAs instead of a registry contract?

On EVM, you need a contract to maintain a mapping (`name hash → address`). On Solana, the mapping is implicit in the PDA derivation. This saves on-chain storage and makes lookups cheaper, at the cost of more complex client-side logic.

## Fallback display

When no name resolves, always display a truncated version of the raw address:

```
EVM:    0x742d35Cc6634C0532925a3b8D4C9e2eD → 0x742d…2eD
Solana: 7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs → 7vfC…voxs
```

Show at least 4 characters from each end for collision resistance — 4 chars gives 16^4 = 65,536 possible values, enough that users can visually verify a familiar address.

## Caching strategy

ENS/SNS records can change when owners update them. For a production app:

- Cache resolved names for 5–30 minutes (short enough to catch updates)
- Never cache for the lifetime of the session without re-validation
- For high-value transactions (sending funds), always re-resolve immediately before confirming
