# Disconnect Wallet — Learn

## Why disconnect matters

Disconnecting a wallet is more than UI cleanup — it's a security boundary.

While a wallet is connected, the dApp can:
- Read the user's address and balances at any time
- Pop up signature requests
- Track which chain the user is on

Disconnecting revokes these capabilities. For privacy-conscious users, this matters.

## What disconnect actually does

### On EVM (wagmi)

`disconnect()` from wagmi:
1. Calls the connector's `disconnect()` method
2. Clears wagmi's internal store (address, chain, connector reference)
3. Removes the persisted connection from localStorage (so `reconnectOnMount` won't auto-reconnect)
4. Emits a `disconnect` event that other hooks can listen to

The wallet extension (e.g., MetaMask) is also notified and may remove the dApp from its "connected sites" list.

### On Solana (wallet-adapter)

`disconnect()` from `useWallet()`:
1. Calls the selected wallet adapter's `disconnect()` method
2. Clears the adapter state (publicKey, connected flag)
3. Removes event listeners
4. If `autoConnect` is true, the wallet won't auto-reconnect on the next page load once disconnected

## Disconnect ≠ revoke approvals

A common misconception: disconnecting your wallet revokes all permissions. It doesn't.

On EVM, if you previously called `approve()` to let a DEX spend your USDC, that on-chain approval persists even after disconnecting. The DEX contract can still pull your tokens. To revoke, you need a separate `approve(spender, 0)` transaction.

On Solana, if you delegated tokens via the SPL Token program, that delegation persists on-chain until explicitly revoked.

Disconnect = remove the dApp's ability to request new signatures. It does NOT undo previous on-chain permissions.
