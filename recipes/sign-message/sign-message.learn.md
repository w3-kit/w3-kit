# Sign Message — Learn

## What is message signing?

Message signing uses your private key to create a cryptographic proof that you authored a specific message. Anyone with your public key (address) can verify the signature, but no one can forge it without your private key.

This is the foundation of web3 authentication. Instead of proving identity with a password (something you know), you prove it with a signature (something you have — the private key).

## How it works

### The cryptography (simplified)

1. Your wallet takes the message + your private key
2. It runs them through an elliptic curve signing algorithm (ECDSA for EVM, Ed25519 for Solana)
3. The result is a unique signature
4. Anyone can verify: `verify(message, signature, publicKey) → true/false`

The signature is deterministic for EVM (same message + key = same signature) but Solana's Ed25519 can produce different valid signatures for the same input.

### EVM: EIP-191 personal sign

EVM wraps your message before signing:

```
\x19Ethereum Signed Message:\n<length><message>
```

This prefix prevents a signed message from being replayed as a transaction. Without it, a malicious dApp could trick you into signing a raw transaction by presenting it as a "message."

### Solana: Raw bytes

Solana signs the raw bytes you provide. There's no prefix wrapping. The wallet UI shows the message to the user for approval. If the bytes are valid UTF-8, the wallet displays the text; otherwise it shows a hex representation.

## Sign-In With Ethereum (SIWE) / Solana (SIWS)

The most common use of message signing is authentication:

1. Your backend generates a random nonce
2. The frontend constructs a standardized message: "Sign in to example.com with nonce abc123..."
3. The user signs it with their wallet
4. The frontend sends the signature to the backend
5. The backend verifies the signature matches the claimed address
6. The user is authenticated — no password, no OAuth

This is an off-chain operation. No transaction, no gas fee, no on-chain state change.

## Verification

### EVM

```typescript
import { verifyMessage } from "viem";

const isValid = await verifyMessage({
  address: "0x...",
  message: "Hello from w3-kit!",
  signature: "0x...",
});
```

### Solana

```typescript
import nacl from "tweetnacl";

const isValid = nacl.sign.detached.verify(
  new TextEncoder().encode("Hello from w3-kit!"),
  signature,
  publicKey.toBytes()
);
```
