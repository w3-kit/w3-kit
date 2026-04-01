# Web3 Glossary

A plain-language reference for web3 terminology. Terms are explained in the context of building software, not investing.

---

## A

**ABI (Application Binary Interface)** — A JSON description of a smart contract's functions and data types. Like an API schema, but for on-chain contracts. You need the ABI to call a contract's functions from JavaScript/TypeScript.

**Account Abstraction (AA)** — A standard (like EIP-4337) that turns user wallets into programmable smart contracts. Enables features like social recovery, gas sponsorship (paying for others' gas), and batched transactions.

**Account** — On EVM chains, an address that can hold ETH and interact with contracts. On Solana, a data storage unit — everything is an account (programs, token balances, NFT metadata). These are fundamentally different models.

**Airdrop** — Free tokens distributed to wallet addresses, usually as a reward for early usage or community participation. Many protocols airdrop governance tokens to early users.

**AMM (Automated Market Maker)** — A smart contract that enables token swaps using liquidity pools instead of order books. Uses a mathematical formula (usually `x * y = k`) to determine prices. Uniswap, Raydium, and most DEXs use AMMs.

**Anchor** — The dominant framework for writing Solana programs in Rust. Provides macros that reduce boilerplate, generates TypeScript clients from IDL files, and includes a testing framework.

**Approve** — On EVM chains, you must `approve()` a contract to spend your ERC-20 tokens before it can move them. This is a separate transaction from the actual spend. A common source of confusion for new users.

---

## B

**Beacon Chain** — The consensus layer of Ethereum. It manages validators, stakes, and attestations. Following "The Merge," it became the engine that drives Ethereum's Proof-of-Stake system.

**Blob** — Introduced in EIP-4844 (Proto-Danksharding). A large data structure stored temporarily on the Ethereum beacon node, optimized for Layer 2 rollups to post their data at a significantly lower cost than using `calldata`.

**Block** — A batch of transactions confirmed together. Ethereum produces a block every ~12 seconds, Solana every ~400ms. Each block references the previous one, forming the chain.

**Block Explorer** — A web app for viewing on-chain data (transactions, addresses, contracts). Etherscan (EVM), Solscan (Solana). Essential for debugging — you can see exactly what happened in any transaction.

**Bridge** — A protocol that moves assets between different blockchains. You lock tokens on chain A and receive wrapped tokens on chain B. Bridges are historically the biggest attack surface in web3 — handle with care.

**Bytecode** — The compiled form of a smart contract that runs on the EVM. Solidity compiles to bytecode. You deploy bytecode, not source code.

---

## C

**Calldata** — The location where transaction input data is stored in EVM. It is read-only and persistent. Used by rollups to post data to Layer 1, though "Blobs" are now preferred for performance.

**Chain ID** — A unique number identifying an EVM network. Ethereum mainnet = 1, Base = 8453, Arbitrum = 42161. Prevents transactions from being replayed on different chains.

**Confirmation** — The number of blocks mined after your transaction's block. More confirmations = more finality. For Ethereum, 12+ confirmations is considered safe. Solana achieves finality in ~400ms.

**Consensus** — How a blockchain agrees on which transactions are valid. Ethereum uses proof-of-stake (validators stake ETH). Solana uses proof-of-stake + proof-of-history (validators order events using a verifiable clock).

**Contract (Smart Contract)** — Code deployed on a blockchain that executes automatically when called. On EVM chains, written in Solidity or Vyper. On Solana, written in Rust and called "programs" (see **Program**).

**CPI (Cross-Program Invocation)** — Solana term for one program calling another program. Similar to calling another contract on EVM, but with different account and ownership rules.

---

## D

**DAO (Decentralized Autonomous Organization)** — An organization governed by token holders through on-chain voting. Members propose and vote on changes, treasury spending, and protocol parameters.

**dApp (Decentralized Application)** — A web application that interacts with smart contracts. Usually a React/Next.js frontend + wallet connection + on-chain contracts for the backend logic.

**DeFi (Decentralized Finance)** — Financial services (lending, borrowing, trading, insurance) built on smart contracts instead of banks. Aave, Uniswap, MakerDAO, Jupiter are all DeFi protocols.

**DEX (Decentralized Exchange)** — A platform for swapping tokens without a central authority. Uniswap (EVM), Jupiter (Solana). Uses AMMs or order books on-chain.

---

## E

**EIP (Ethereum Improvement Proposal)** — A design document for proposing changes to Ethereum. EIP-20 defined ERC-20 tokens, EIP-721 defined NFTs, EIP-4337 defined account abstraction.

**EIP-4337** — The standard for "Account Abstraction" that doesn't require a consensus-layer change. It introduces a `UserOperation` object and a "Bundler" to process transactions on behalf of smart contract wallets.

**EIP-7702** — A proposal (by Vitalik Buterin) to allow Externally Owned Accounts (EOAs) to temporarily act as smart contract wallets for a single transaction. A lightweight path to Account Abstraction for existing wallets.

**ENS (Ethereum Name Service)** — Turns Ethereum addresses into human-readable names (e.g., `vitalik.eth`). Like DNS but for wallets. Stores names as NFTs on Ethereum.

**EOA (Externally Owned Account)** — A regular wallet address controlled by a private key (as opposed to a contract account). When MetaMask creates a wallet, it creates an EOA.

**ERC-20** — The standard interface for fungible tokens on EVM chains. Defines `transfer()`, `approve()`, `balanceOf()`, and other functions that all tokens implement. USDC, UNI, LINK are all ERC-20 tokens.

**ERC-721** — The standard for non-fungible tokens (NFTs) on EVM chains. Each token has a unique ID. Used for art, gaming items, domain names, and more.

**EVM (Ethereum Virtual Machine)** — The runtime environment that executes smart contracts on Ethereum and compatible chains. Base, Arbitrum, Polygon, BSC all run the EVM, which is why the same Solidity code works across them.

---

## F

**Faucet** — A service that gives free testnet tokens for development. Every testnet has faucets. You'll use them constantly during development.

**Finality** — When a transaction can never be reversed. Ethereum: ~12 minutes (2 epochs). Solana: ~400ms (single slot). L2s inherit Ethereum's finality after posting data.

**Flash Loan** — An uncollateralized loan that must be borrowed and repaid within a single transaction. If not repaid, the entire transaction reverts as if it never happened. Used for arbitrage, liquidations, and collateral swaps.

**Foundry** — A Solidity development toolkit (compile, test, deploy). Tests are written in Solidity, not JavaScript. Faster than Hardhat. Includes `forge` (build/test), `cast` (CLI), `anvil` (local node), `chisel` (REPL).

---

## G

**Gas** — The unit measuring computational work on EVM chains. Every operation costs gas. Gas price × gas used = transaction fee. Solana doesn't use gas — it has fixed compute unit fees.

**Gas Limit** — The maximum gas you're willing to spend on a transaction. If execution exceeds the limit, the transaction fails but you still pay for the gas consumed.

**Governance** — On-chain voting by token holders to make protocol decisions. Typically involves proposal creation, voting period, timelock delay, and execution.

---

## H

**Hardhat** — JavaScript/TypeScript Ethereum development environment. Compile, test, deploy contracts. Includes a local network for development. Tests are written in JS/TS with ethers.js or viem.

**Hash** — A fixed-length string produced by a cryptographic function. Transaction hashes uniquely identify transactions. Block hashes identify blocks. Used everywhere in web3 for verification.

---

## I

**IDL (Interface Definition Language)** — Solana/Anchor's equivalent of an ABI. A JSON file describing a program's instructions and accounts. Auto-generated by Anchor and used to create TypeScript clients.

**Impermanent Loss** — The loss of value from providing liquidity to an AMM compared to just holding the tokens. Happens when the price ratio of the pooled tokens changes. "Impermanent" because it reverses if prices return to their original ratio.

**Intent** — A user's desired outcome (e.g., "swap 1 ETH for at least 3000 USDC") without specifying the exact steps to achieve it. "Solvers" then compete to find the most efficient execution path.

---

## K

**Keypair** — A public key + private key pair. The public key is your address (safe to share). The private key signs transactions (never share). On Solana, keypairs are stored as 64-byte arrays. On EVM, the private key is 32 bytes and the address is derived from the public key.

---

## L

**L1 (Layer 1)** — The base blockchain (Ethereum, Solana, Bitcoin). Handles consensus and security directly.

**L2 (Layer 2)** — A chain built on top of an L1 for scalability. Executes transactions faster/cheaper, then posts proofs or data back to the L1 for security. Base, Arbitrum, Optimism are Ethereum L2s.

**Liquidity** — The amount of tokens available for trading in a pool or market. More liquidity = less slippage = better prices.

**Liquidity Pool (LP)** — A smart contract holding pairs of tokens that enable trading. Liquidity providers deposit tokens and earn a share of trading fees.

---

## M

**Mainnet** — The live, production blockchain where real value is transacted. As opposed to testnet/devnet.

**Mempool** — A "waiting room" for transactions that have been broadcast to the network but not yet included in a block. Valid transactions sit in the mempool until a validator picks them up.

**MEV (Maximal Extractable Value)** — Profit that block producers (or searchers) can extract by reordering, inserting, or censoring transactions. Includes front-running, sandwich attacks, and arbitrage. A major issue on EVM chains.

**Mint** — To create new tokens or NFTs. "Minting" an NFT means deploying the token for the first time. On Solana, the mint account holds the supply and decimals for a token.

**Multisig** — A wallet that requires multiple signatures (e.g., 3 of 5 owners) to approve a transaction. Used for treasury management and team-controlled contracts. Safe (formerly Gnosis Safe) is the standard on EVM.

---

## N

**NFT (Non-Fungible Token)** — A unique token representing ownership of a specific item. Unlike fungible tokens (1 USDC = 1 USDC), each NFT is distinct. ERC-721 on EVM, Metaplex standards on Solana.

**Nonce** — A counter tracking how many transactions an address has sent (EVM). Each transaction must use the next nonce in sequence. If nonce 5 is pending, nonce 6 can't execute. On Solana, recent blockhashes serve a similar anti-replay purpose.

---

## O

**Oracle** — A service that brings off-chain data (prices, weather, sports scores) onto the blockchain. Smart contracts can't access external data directly — oracles bridge this gap. Chainlink (EVM) and Pyth (Solana) are the dominant oracle networks.

---

## P

**PDA (Program Derived Address)** — A Solana address deterministically derived from a program ID and seeds. PDAs don't have private keys — only the program that derived them can sign for them. Used for program-owned accounts, vaults, and configuration storage. No EVM equivalent — the closest concept is `CREATE2` deterministic contract addresses.

**Private Key** — The secret key that controls a wallet. Anyone with your private key can steal all your funds. Never share it, never commit it to git, never paste it in a website.

**Program** — Solana's term for a smart contract. Programs are stateless — they read and write to accounts but don't store data themselves. This is a fundamental difference from EVM contracts, which store their own state.

**Proof of Stake (PoS)** — Consensus mechanism where validators lock tokens as collateral. If they misbehave, their stake is slashed. Ethereum switched from proof-of-work to PoS in 2022 ("The Merge").

---

## R

**Rent** — On Solana, accounts must maintain a minimum SOL balance to exist on-chain (called "rent exemption"). If an account's balance drops below this threshold, it can be garbage collected. In practice, all accounts are made rent-exempt at creation.

**Rollup** — A Layer 2 scaling solution that executes transactions off-chain, "rolls" them into a single batch, and submits proof of that batch back to the main Layer 1 chain. Types include Optimistic and ZK Rollups.

**RPC (Remote Procedure Call)** — The API endpoint for communicating with a blockchain node. You send transactions and read data through RPC calls. Public RPCs are free but rate-limited. Production apps use paid providers (Alchemy, Helius, QuickNode).

**Rug Pull** — A scam where project creators drain liquidity or abandon a project after raising funds. Common patterns: removing LP, minting unlimited tokens, disabling selling via contract logic.

---

## S

**Seed Phrase (Mnemonic)** — A 12 or 24 word phrase that generates your private key. Write it down on paper. Never store it digitally. Losing it = losing all your funds forever. No customer support to call.

**Sequencer** — A specialized node in a Layer 2 rollup that orders incoming transactions and submits them to the main Layer 1 chain. Currently, most rollups use a centralized sequencer for speed.

**Signature** — Cryptographic proof that a transaction was authorized by the private key holder. You sign transactions in your wallet before they're broadcast. dApps can also request message signatures for authentication (SIWE).

**Slippage** — The difference between expected and actual trade execution price. Caused by price movement between when you submit a transaction and when it executes. Set slippage tolerance in DEX UIs to control maximum acceptable deviation.

**SPL Token** — Solana's token standard (equivalent to ERC-20). Managed by the SPL Token Program. Each token has a mint account (supply, decimals) and token accounts (individual balances).

**Staking** — Locking tokens to earn rewards. Can mean protocol-level staking (securing the network) or DeFi staking (earning yield from protocols).

**State Channel** — A scaling technique where participants conduct many transactions off-chain and only submit the final net result to the blockchain. Requires all parties to be online. Lightning Network is a state channel implementation.

---

## T

**Testnet** — A test blockchain for development. Free tokens, no real value. Ethereum has Sepolia and Holesky. Solana has Devnet and Testnet. Always develop and test on testnets before mainnet.

**Token** — A digital asset on a blockchain. Fungible tokens (ERC-20, SPL) are interchangeable (1 USDC = 1 USDC). Non-fungible tokens (ERC-721, Metaplex) are unique.

**Token Extensions (Solana)** — A set of flexible features built into the Solana SPL Token-2022 program. Allows developers to add logic like transfer fees, permanent delegates, and metadata directly into the token itself.

**Transaction** — An on-chain operation signed by a wallet. On EVM: a single contract call with a gas limit. On Solana: can contain multiple instructions that execute atomically (all succeed or all fail).

**TVL (Total Value Locked)** — The total value of assets deposited in a DeFi protocol. A common metric for comparing protocol size and adoption.

---

## V

**Validator** — A node that participates in consensus by staking tokens and validating transactions. On Ethereum, validators stake 32 ETH. On Solana, validators can accept delegated SOL from any user.

**Vesting** — A schedule that gradually unlocks tokens over time. Used for team allocations, investor tokens, and employee compensation. Prevents recipients from dumping all tokens at once.

---

## W

**Wallet** — Software that manages your private keys and lets you sign transactions. Browser extensions (MetaMask, Phantom), mobile apps (Rainbow, Solflare), or hardware devices (Ledger, Trezor).

**Wei** — The smallest unit of ETH. 1 ETH = 10^18 wei. Smart contracts work in wei, not ETH. Similarly, USDC uses 6 decimals (1 USDC = 1,000,000 units).

**Wrapped Token** — A token pegged 1:1 to another asset, represented on a different chain or standard. WETH is ETH wrapped as ERC-20. WBTC is Bitcoin on Ethereum. Wrapping/unwrapping is always 1:1.

---

## Y

**Yield** — The return earned on deposited/staked tokens, expressed as APR or APY. Sources include: trading fees, protocol rewards, lending interest, and token emissions.

---

## Z

**Zero-Knowledge Proof (ZK Proof)** — A cryptographic method where one party (the prover) can prove to another (the verifier) that they know a specific piece of information without revealing the information itself. Popular types include **SNARKs** and **STARKs**.
