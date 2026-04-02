# Watch Transfers

Subscribe to real-time token transfer events.

## What this does

Listens for new token transfers as they happen on-chain. Useful for building real-time UIs (live feeds, transaction history, notifications).

## EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Method** | `useWatchContractEvent` subscribes to ERC-20 `Transfer` events | `connection.onLogs` subscribes to program logs |
| **Protocol** | WebSocket subscription to the RPC node | WebSocket subscription to the RPC node |
| **Data** | Typed event args (from, to, value) | Raw program logs (need parsing) |
| **Granularity** | Per-event, filtered by contract + event name | Per-transaction, filtered by account mention |

## Key concept: Events vs Logs

**EVM events** are structured, typed, and indexed. The `Transfer(from, to, value)` event is part of the ERC-20 standard. You can filter by `from` or `to` address because they're indexed.

**Solana logs** are raw strings emitted by programs. They're not typed or structured by default. To get structured transfer data on Solana, you'd need to parse the program's log output or use a specialized indexer.

## Security notes

- WebSocket connections can drop — implement reconnection logic for production
- Event data comes from the RPC node, not directly from the chain — use a trusted provider
- High-volume tokens (USDC, USDT) can emit hundreds of events per second

## Files

- `evm.tsx` — EVM implementation using wagmi `useWatchContractEvent`
- `solana.tsx` — Solana implementation using `connection.onLogs`
- `example/evm/page.tsx` — Runnable EVM example
- `example/solana/page.tsx` — Runnable Solana example
