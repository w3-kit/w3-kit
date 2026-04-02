# Create Token

Create a new token on EVM or Solana.

## What this does

Deploys a new token that you control. On EVM, this means deploying an ERC-20 smart contract. On Solana, this means creating a "mint" account via the SPL Token program.

## EVM vs Solana — Fundamental difference

| | EVM | Solana |
|---|---|---|
| **How** | Deploy a new smart contract | Create a mint account (no contract needed) |
| **Language** | Write Solidity, compile to bytecode, deploy | Call `createMint` on the SPL Token program |
| **Cost** | ~$5-50 on Ethereum, <$0.01 on L2s | ~0.002 SOL (~$0.30) |
| **Customization** | Full control — your contract, your logic | Limited to SPL Token program features |
| **Authority** | Controlled by contract logic (owner role, etc.) | Mint authority = who can mint more tokens |

## Key concept: Contract deployment vs account creation

**EVM:** Creating a token = deploying code to the blockchain. Your ERC-20 contract IS the token. You can add custom logic (tax on transfers, max supply, blacklists, etc.) because you write the contract.

**Solana:** Creating a token = asking the existing SPL Token program to make a new "mint" account. Every SPL token uses the same program — you just configure it (decimals, authorities). For custom logic, you'd write a separate Solana program.

## Security notes

- **Mint authority:** Whoever has mint authority can create unlimited tokens. For a fair token, renounce mint authority after initial distribution.
- **Freeze authority:** On Solana, the freeze authority can freeze any holder's tokens. Renounce it if not needed.
- **Contract verification:** On EVM, verify your contract source on Etherscan so users can audit it.

## Files

- `evm.tsx` — EVM token creation pattern (requires Solidity contract)
- `solana.tsx` — Solana token creation via SPL Token program
- `example/evm/page.tsx` — Runnable EVM example
- `example/solana/page.tsx` — Runnable Solana example
