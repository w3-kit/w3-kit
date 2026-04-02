# Connect Wallet — Learn

## What is wallet connection?

Wallet connection is web3's version of "log in." Instead of email + password, users prove who they are by connecting a wallet that holds their private key. No accounts to create, no passwords to remember — your wallet IS your identity.

When a user "connects" their wallet to a dApp, they're granting the dApp permission to:
- **See** their public address and token balances
- **Request** transaction signatures (the user must approve each one)

They are NOT giving the dApp access to their private key or permission to move funds without approval.

## How the connection flow works

1. User clicks "Connect Wallet"
2. The dApp detects available wallets via browser APIs
3. User picks a wallet → the wallet extension opens a popup
4. User approves the connection → the dApp receives the user's public address
5. The dApp can now display balances and request signatures

## The provider injection pattern

Both EVM and Solana wallets work by injecting a "provider" object into the browser's `window` object.

**EVM:** Wallets inject `window.ethereum` (legacy) or register via EIP-6963's event-based discovery. The provider exposes methods like `eth_requestAccounts` and `eth_sendTransaction`.

**Solana:** Wallets register with the Wallet Standard API. The `@solana/wallet-adapter` library abstracts this into React hooks.

## Why wagmi? Why wallet-adapter?

You could call `window.ethereum.request(...)` directly, but you'd have to handle:
- Multiple wallet detection
- Connection state management
- Chain switching
- Reconnection on page reload
- TypeScript types for all of this

wagmi (EVM) and wallet-adapter (Solana) handle all of this. They're thin wrappers, not frameworks — you can eject at any time.

## EIP-6963: Multi-wallet discovery

Before EIP-6963 (2023), if you had MetaMask AND Coinbase Wallet installed, they'd fight over `window.ethereum`. Only one would win. EIP-6963 introduced a discovery protocol — dApps can now detect ALL installed wallets. wagmi v2+ supports this by default.

## What happens on disconnect?

Disconnecting clears the dApp's access to your address. The wallet forgets the connection. On EVM, this also clears any pending signature requests. On Solana, the wallet-adapter cleans up its internal state and event listeners.
