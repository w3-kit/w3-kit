# Public vs Private Keys

Every wallet is a key pair — a public key (your address) and a private key (your proof of ownership). Understanding this is fundamental to web3 security.

---

## The core concept

**Public key** → Your address. Share it freely. Anyone can send you tokens or verify your signatures.

**Private key** → Your secret. Never share it. Whoever has it controls the wallet completely.

Think of it like a mailbox:
- The **address** (public key) is on the mailbox — anyone can send you mail
- The **key** (private key) opens the mailbox — only you can access what's inside

---

## How they're related

Your public key is mathematically derived from your private key using one-way functions:

```
Private Key → (one-way math) → Public Key → (hash) → Address
```

You can always derive the public key from the private key, but you **cannot** derive the private key from the public key. This is the foundation of blockchain security.

### EVM
- Private key: 256-bit number (64 hex characters)
- Public key: Derived via secp256k1 elliptic curve
- Address: Last 20 bytes of the keccak256 hash of the public key, prefixed with `0x`

```
Private: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Solana
- Private key: 256-bit number (stored as 64-byte keypair)
- Public key: Derived via Ed25519 curve
- Address: The public key itself, encoded in Base58

```
Address: 7nYBm2xGv3WqDzN5Q3JXCH8emhYwpfNKkjFJQ1rQ3kPW
```

---

## What keys do

### Signing
Your private key creates digital signatures — cryptographic proofs that you authorized something. When you:
- Send a transaction → you sign it with your private key
- Sign a message → you prove you own the address
- Approve a contract → you sign the approval transaction

### Verification
Anyone with your public key can verify that a signature was created by you, without knowing your private key.

```
sign(message, privateKey) → signature
verify(message, signature, publicKey) → true/false
```

---

## Seed phrases (mnemonics)

When you create a wallet, you get a seed phrase — 12 or 24 English words:

```
witch collapse practice feed shame open despair creek road again ice least
```

The seed phrase is a human-readable encoding of entropy that generates your private key(s) through a deterministic process:

```
Seed Phrase → Master Seed → Derivation Path → Private Key → Public Key → Address
```

### Derivation paths
From one seed phrase, you can derive many key pairs using different paths:

```
m/44'/60'/0'/0/0  → First EVM address
m/44'/60'/0'/0/1  → Second EVM address
m/44'/501'/0'/0'  → First Solana address
```

This is why one seed phrase can give you addresses on different chains.

---

## Security

### What to protect
- **Private key** — full control of the wallet
- **Seed phrase** — can regenerate all private keys
- **Keystore file** — encrypted private key (MetaMask export)

### What's safe to share
- **Public key / address** — this is public on-chain data anyway
- **Signatures** — these prove you signed something, they don't reveal the private key
- **Transaction hashes** — these are public on-chain records

### Attack vectors
- **Phishing** — fake websites that ask you to "enter your seed phrase to verify your wallet"
- **Malicious signatures** — signing a message that's actually a transaction authorization
- **Clipboard malware** — malware that replaces copied addresses with the attacker's address
- **Social engineering** — "support" asking for your seed phrase or private key

### Rules
1. **Never share your private key or seed phrase** — no legitimate service will ever ask for it
2. **Store seed phrases offline** — paper, metal plate. Not in a notes app, screenshot, or cloud storage.
3. **Use hardware wallets for large amounts** — the private key never touches your computer
4. **Verify addresses character by character** — especially for large transfers
5. **Use separate wallets for risky activities** — interact with unknown dApps using a "burner" wallet with minimal funds
