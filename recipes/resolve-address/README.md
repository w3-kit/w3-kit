# Resolve Address

Translate between human-readable names and wallet addresses using ENS (EVM) and SNS (Solana).

## What this does

Name services let users share `vitalik.eth` or `bonfida.sol` instead of a 42- or 44-character address. This recipe covers:

- **Forward resolution** — name → address (used before sending funds)
- **Reverse resolution** — address → name (used for display in UIs)

## EVM vs Solana

| | EVM (ENS) | Solana (SNS) |
|---|---|---|
| **Registry** | Ethereum Name Service (ENS) | Solana Name Service (@bonfida/spl-name-service) |
| **TLD** | `.eth` (plus others via CCIP-Read) | `.sol` |
| **Chain requirement** | Mainnet only (L1) | Mainnet only |
| **Forward lookup** | `getEnsAddress({ name })` via viem | `getDomainKey` + `NameRegistryState.retrieve` |
| **Reverse lookup** | `getEnsName({ address })` via viem | `performReverseLookup` |
| **Fallback display** | Truncate: `0x1234…abcd` | Truncate: `AbCd…XyZ1` |
| **Resolution cost** | Free read (RPC call) | Free read (RPC call) |

## API surface

### EVM

```ts
resolveEnsName(name: string): Promise<`0x${string}` | null>
reverseResolveEns(address: `0x${string}`): Promise<string | null>
truncateAddress(address: string, chars?: number): string
```

### Solana

```ts
resolveSnsName(domain: string): Promise<string | null>
reverseResolveSns(address: string): Promise<string | null>
```

## When to use

- Before sending a transaction: resolve the name to an address and display both
- In a wallet UI: show the ENS/SNS name next to or instead of the raw address
- In transaction history: reverse-resolve addresses to names for readability

## Chain requirements

**ENS:** Resolution happens on Ethereum L1 mainnet. If your app runs on an L2 (Arbitrum, Base, Optimism), use a separate mainnet `publicClient` just for ENS and your L2 client for everything else.

**SNS:** Resolution only works on Solana mainnet. Devnet has no name registry data.

## Security notes

- Always verify the resolved address before sending funds — resolution can fail silently
- A `null` result means the name is not registered (forward) or the address has no reverse record set (reverse)
- Reverse records are optional — an address may have a name registered but no reverse record

## Files

- `evm.tsx` — EVM implementation using viem `getEnsAddress` / `getEnsName`
- `solana.tsx` — Solana implementation using `@bonfida/spl-name-service`
- `example/evm/page.tsx` — Runnable EVM example with copy button
- `example/solana/page.tsx` — Runnable Solana example
