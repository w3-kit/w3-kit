# Sign Message

Sign an arbitrary message with the user's wallet.

## What this does

Asks the user's wallet to sign a text message with their private key. This proves the user controls the address without making an on-chain transaction (no gas fees).

## Use cases

- **Authentication:** Sign-In With Ethereum (SIWE) / Sign-In With Solana (SIWS)
- **Verification:** Prove wallet ownership to a backend
- **Off-chain agreements:** Sign terms of service, consent messages
- **Data integrity:** Sign data to prove it hasn't been tampered with

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Method** | `useSignMessage` (EIP-191 personal sign) | `useWallet().signMessage()` |
| **Input** | String message | Uint8Array (raw bytes) |
| **Output** | Hex signature string | Uint8Array signature |
| **Standard** | EIP-191 wraps message with `\x19Ethereum Signed Message:\n` prefix | Signs raw bytes directly |
| **Verification** | `verifyMessage` from viem | `nacl.sign.detached.verify` or `@solana/web3.js` |

## Security notes

- **Never sign messages you don't understand** — malicious dApps can craft messages that look harmless but authorize transactions
- **Check the domain** — SIWE messages include the requesting domain to prevent phishing
- **Message signing ≠ transaction signing** — signing a message never moves funds, but the signature could be used for off-chain authorization
- **Wallet UI shows the message** — users should always read what they're signing

## Files

- `evm.tsx` — EVM implementation using wagmi
- `solana.tsx` — Solana implementation using wallet-adapter
- `example/evm/page.tsx` — Runnable EVM example with full provider setup
- `example/solana/page.tsx` — Runnable Solana example with full provider setup
