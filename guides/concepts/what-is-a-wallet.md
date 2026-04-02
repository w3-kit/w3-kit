# What Is a Wallet?

A wallet is your identity in web3. It replaces usernames, passwords, and login systems with cryptographic key pairs.

---

## The mental model

Think of a wallet as a keychain, not a bank account:
- **Public key (address)** — your identity. Like an email address, you share it freely.
- **Private key** — your proof of ownership. Like a password, you never share it.

The wallet doesn't "store" your tokens — they live on the blockchain. The wallet stores the private key that proves you own them.

---

## Types of wallets

### Browser extension wallets (hot wallets)
- **MetaMask** (EVM), **Phantom** (Solana, EVM), **Coinbase Wallet** (EVM)
- Private key stored in the browser extension, encrypted with a password
- Convenient but vulnerable to malware, phishing, and compromised devices
- Best for: daily use, small amounts

### Hardware wallets (cold wallets)
- **Ledger**, **Trezor**
- Private key stored on a physical device, never exposed to the internet
- Transactions are signed on the device — even if your computer is compromised, the key is safe
- Best for: large holdings, long-term storage

### Mobile wallets
- **MetaMask Mobile**, **Phantom Mobile**, **Trust Wallet**
- Same as browser extensions but on your phone
- Best for: on-the-go transactions, dApp browsing

### Smart contract wallets (account abstraction)
- **Safe** (formerly Gnosis Safe), **Argent**
- The wallet itself is a smart contract with custom logic
- Enables: multi-signature approval, spending limits, social recovery, gas sponsorship
- The future of wallets — more flexible, but more complex

---

## How wallets work with dApps

When you visit a dApp (decentralized application) and click "Connect Wallet":

1. The dApp detects available wallets via browser APIs
2. You choose which wallet to connect
3. The wallet shares your **public address** with the dApp
4. The dApp can now show your balances and request signatures

**What the dApp CAN do:**
- See your public address
- See your token balances (this is public on-chain data anyway)
- Request you to sign messages or transactions

**What the dApp CANNOT do:**
- Access your private key
- Move your funds without your approval
- Do anything you don't explicitly approve in the wallet popup

---

## EVM vs Solana wallets

| | EVM | Solana |
|---|---|---|
| **Address format** | `0x` + 40 hex characters | Base58 string (32-44 characters) |
| **Key algorithm** | secp256k1 (same as Bitcoin) | Ed25519 |
| **Network handling** | Wallet manages which chain you're on | App manages which cluster to connect to |
| **Popular wallets** | MetaMask, Coinbase Wallet, Rainbow | Phantom, Solflare, Backpack |
| **Multi-chain** | Same address works on all EVM chains | Different ecosystem, different wallet |

**Cross-chain wallets** like Phantom now support both EVM and Solana, but you'll have different addresses on each.

---

## Seed phrases

When you create a wallet, you get a **seed phrase** (mnemonic) — 12 or 24 words:

```
witch collapse practice feed shame open despair creek road again ice least
```

This seed phrase can regenerate your private key. If you lose your device, the seed phrase is the only way to recover your wallet.

**Rules:**
- Write it on paper (not digital)
- Store it somewhere safe (not in cloud storage, not in a screenshot)
- Never share it — anyone with the seed phrase has full access to your wallet
- No support team will ever ask for it — if they do, it's a scam

---

## Security checklist

- [ ] Seed phrase is written down physically, stored securely
- [ ] Never share private key or seed phrase with anyone
- [ ] Use a hardware wallet for large amounts
- [ ] Disconnect from dApps you don't use
- [ ] Verify URLs before connecting (bookmark trusted dApps)
- [ ] Revoke old token approvals periodically
- [ ] Use a separate "hot" wallet for risky interactions (new dApps, airdrops)
