# Watch Transfers — Learn

## Real-time blockchain data

Blockchains are append-only: new blocks are added continuously. To build real-time UIs, you need to listen for new data as it's produced.

### EVM: Event subscriptions

EVM smart contracts can emit "events" — structured log entries that are stored in transaction receipts. The ERC-20 standard defines:

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

The `indexed` keyword means you can filter by `from` or `to` in your subscription:

```typescript
// Watch only transfers TO your address
useWatchContractEvent({
  address: usdcAddress,
  abi: erc20Abi,
  eventName: "Transfer",
  args: { to: myAddress }, // Filter by indexed param
  onLogs(logs) { ... },
});
```

Under the hood, wagmi opens a WebSocket connection to the RPC node and uses `eth_subscribe` to receive new events in real-time.

### Solana: Log subscriptions

Solana programs don't have typed events like EVM. Instead, they emit log messages via `msg!()` or `emit!()` (Anchor). You subscribe to logs that mention a specific account:

```typescript
connection.onLogs(mintAddress, (logInfo) => {
  // logInfo.logs = array of raw log strings
  // logInfo.signature = transaction signature
});
```

For structured events, Anchor programs use `emit!()` which encodes event data in a standardized format. Libraries like `@coral-xyz/anchor` can parse these.

## Polling vs WebSocket

**WebSocket (preferred):** Real-time push notifications. Lower latency, less RPC usage. But connections can drop and need reconnection logic.

**Polling:** Periodically call `getLogs` or `getSignaturesForAddress`. More reliable but higher latency and more RPC calls.

For production apps, use WebSocket for the real-time feed with polling as a fallback to catch any events missed during disconnections.

## Performance considerations

Popular tokens (USDC, USDT, WETH) generate enormous volumes of events:
- USDC on Ethereum: ~1,000+ transfers per block (~12 seconds)
- USDC on Solana: thousands of transactions per second

For high-volume tokens:
- Filter server-side when possible (indexed params on EVM)
- Buffer and batch UI updates (don't re-render per event)
- Consider using an indexer (The Graph, Helius) instead of raw RPC subscriptions
