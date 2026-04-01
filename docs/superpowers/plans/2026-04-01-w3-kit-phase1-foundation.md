# w3-kit Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the w3-kit monorepo, create the registry data package, establish the "code is education" pattern with `.learn.md` files, and ship the web3 glossary.

**Architecture:** Phase 1 creates the new directory structure alongside existing code (no destructive moves of git submodules yet). New packages (`registry`, `design-tokens`) are standalone TypeScript packages with their own tests. Educational content (`.learn.md`, glossary, guides) is plain Markdown.

**Tech Stack:** TypeScript, vitest, pnpm/npm workspaces

---

## File Structure

### New files created in this plan:

```
w3-kit-repo/
├── packages/
│   └── registry/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── src/
│       │   ├── index.ts              # Public API
│       │   ├── chains.ts             # Chain data and lookup functions
│       │   ├── tokens.ts             # Token data and lookup functions
│       │   └── types.ts              # Shared types
│       ├── data/
│       │   ├── chains.json           # 10 major chains
│       │   └── tokens.json           # Top tokens per chain
│       └── tests/
│           ├── chains.test.ts
│           └── tokens.test.ts
├── contracts/
│   ├── evm/
│   │   └── .gitkeep
│   └── solana/
│       └── .gitkeep
├── recipes/
│   ├── evm/
│   │   └── .gitkeep
│   ├── solana/
│   │   └── .gitkeep
│   └── cross-chain/
│       └── .gitkeep
├── guides/
│   ├── concepts/
│   │   └── .gitkeep
│   ├── evm/
│   │   └── .gitkeep
│   ├── solana/
│   │   └── .gitkeep
│   ├── security/
│   │   └── .gitkeep
│   └── glossary/
│       └── glossary.md               # 50 core web3 terms
├── templates/
│   └── saas-boilerplate/             # (moved from sol-saas-boilerplate/)
└── ui/
    └── components/
        ├── token-swap/
        │   └── token-swap.learn.md
        ├── connect-wallet/
        │   └── connect-wallet.learn.md
        └── staking-interface/
            └── staking-interface.learn.md
```

---

### Task 1: Create monorepo directory structure

**Files:**
- Create: `contracts/evm/.gitkeep`
- Create: `contracts/solana/.gitkeep`
- Create: `recipes/evm/.gitkeep`
- Create: `recipes/solana/.gitkeep`
- Create: `recipes/cross-chain/.gitkeep`
- Create: `guides/concepts/.gitkeep`
- Create: `guides/evm/.gitkeep`
- Create: `guides/solana/.gitkeep`
- Create: `guides/security/.gitkeep`
- Create: `guides/glossary/.gitkeep`
- Create: `templates/.gitkeep`

- [ ] **Step 1: Create all new directories with .gitkeep files**

```bash
cd /Users/petarstoev/Code/w3-kit-repo

mkdir -p contracts/evm contracts/solana
mkdir -p recipes/evm recipes/solana recipes/cross-chain
mkdir -p guides/concepts guides/evm guides/solana guides/security guides/glossary
mkdir -p templates
mkdir -p packages

touch contracts/evm/.gitkeep contracts/solana/.gitkeep
touch recipes/evm/.gitkeep recipes/solana/.gitkeep recipes/cross-chain/.gitkeep
touch guides/concepts/.gitkeep guides/evm/.gitkeep guides/solana/.gitkeep guides/security/.gitkeep guides/glossary/.gitkeep
touch templates/.gitkeep
```

- [ ] **Step 2: Verify the structure**

Run: `find contracts recipes guides templates packages -type f | sort`

Expected output:
```
contracts/evm/.gitkeep
contracts/solana/.gitkeep
guides/concepts/.gitkeep
guides/evm/.gitkeep
guides/glossary/.gitkeep
guides/security/.gitkeep
guides/solana/.gitkeep
recipes/cross-chain/.gitkeep
recipes/evm/.gitkeep
recipes/solana/.gitkeep
templates/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add contracts/ recipes/ guides/ templates/ packages/
git commit -m "chore: create monorepo directory structure for w3-kit expansion"
```

---

### Task 2: Move sol-saas-boilerplate into templates/

**Files:**
- Move: `sol-saas-boilerplate/` → `templates/saas-boilerplate/`
- Remove: `templates/.gitkeep`

Note: `sol-saas-boilerplate/` is currently untracked in the parent repo (shown as `??` in git status) and has its own `.git/` directory. We will move it and remove the nested `.git/` so it becomes part of the parent repo.

- [ ] **Step 1: Move the directory**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
mv sol-saas-boilerplate templates/saas-boilerplate
rm templates/.gitkeep
```

- [ ] **Step 2: Remove the nested .git directory**

```bash
rm -rf templates/saas-boilerplate/.git
```

- [ ] **Step 3: Verify the move**

Run: `ls templates/saas-boilerplate/`

Expected output should include: `contracts`, `frontend`, `hardhat.config.ts`, `package.json`, `scripts`, `test`, `tsconfig.json`

- [ ] **Step 4: Commit**

```bash
git add templates/
git commit -m "chore: move sol-saas-boilerplate into templates/saas-boilerplate"
```

---

### Task 3: Create registry package — types and project setup

**Files:**
- Create: `packages/registry/package.json`
- Create: `packages/registry/tsconfig.json`
- Create: `packages/registry/vitest.config.ts`
- Create: `packages/registry/src/types.ts`

- [ ] **Step 1: Create package.json**

Create `packages/registry/package.json`:

```json
{
  "name": "@w3-kit/registry",
  "version": "0.1.0",
  "description": "Chain, token, and ABI registry for web3 development",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./chains": {
      "import": "./dist/chains.js",
      "types": "./dist/chains.d.ts"
    },
    "./tokens": {
      "import": "./dist/tokens.js",
      "types": "./dist/tokens.d.ts"
    },
    "./data/chains.json": "./data/chains.json",
    "./data/tokens.json": "./data/tokens.json"
  },
  "files": [
    "dist",
    "data"
  ],
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vitest": "^3.1.1"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `packages/registry/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",
    "moduleResolution": "Node16",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

Create `packages/registry/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Create types.ts**

Create `packages/registry/src/types.ts`:

```typescript
export interface Chain {
  chainId: number;
  name: string;
  shortName: string;
  ecosystem: "evm" | "solana" | "bitcoin";
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers: string[];
  faucets: string[];
  testnet: boolean;
  learn: string;
}

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  chains: {
    chainId: number;
    address: string;
  }[];
  logoUrl: string;
  learn: string;
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/registry/
git commit -m "feat(registry): scaffold registry package with types"
```

---

### Task 4: Create registry package — chain data

**Files:**
- Create: `packages/registry/data/chains.json`
- Create: `packages/registry/src/chains.ts`
- Create: `packages/registry/tests/chains.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/registry/tests/chains.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  getChain,
  getChainsByEcosystem,
  getAllChains,
} from "../src/chains.js";

describe("chains", () => {
  describe("getAllChains", () => {
    it("returns all chains", () => {
      const chains = getAllChains();
      expect(chains.length).toBeGreaterThanOrEqual(10);
    });

    it("every chain has required fields", () => {
      const chains = getAllChains();
      for (const chain of chains) {
        expect(chain.chainId).toBeDefined();
        expect(chain.name).toBeTruthy();
        expect(chain.ecosystem).toMatch(/^(evm|solana|bitcoin)$/);
        expect(chain.nativeCurrency.symbol).toBeTruthy();
        expect(chain.rpcUrls.length).toBeGreaterThan(0);
        expect(chain.blockExplorers.length).toBeGreaterThan(0);
        expect(chain.learn).toBeTruthy();
      }
    });
  });

  describe("getChain", () => {
    it("returns Ethereum mainnet by chainId", () => {
      const eth = getChain(1);
      expect(eth).toBeDefined();
      expect(eth!.name).toBe("Ethereum");
      expect(eth!.nativeCurrency.symbol).toBe("ETH");
      expect(eth!.ecosystem).toBe("evm");
    });

    it("returns Solana mainnet", () => {
      const sol = getChain(101);
      expect(sol).toBeDefined();
      expect(sol!.name).toBe("Solana");
      expect(sol!.ecosystem).toBe("solana");
    });

    it("returns undefined for unknown chainId", () => {
      expect(getChain(999999)).toBeUndefined();
    });
  });

  describe("getChainsByEcosystem", () => {
    it("returns only EVM chains", () => {
      const evmChains = getChainsByEcosystem("evm");
      expect(evmChains.length).toBeGreaterThanOrEqual(7);
      for (const chain of evmChains) {
        expect(chain.ecosystem).toBe("evm");
      }
    });

    it("returns only Solana chains", () => {
      const solChains = getChainsByEcosystem("solana");
      expect(solChains.length).toBeGreaterThanOrEqual(1);
      for (const chain of solChains) {
        expect(chain.ecosystem).toBe("solana");
      }
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/packages/registry
npm install
npx vitest run tests/chains.test.ts
```

Expected: FAIL — `Cannot find module '../src/chains.js'`

- [ ] **Step 3: Create chains.json data file**

Create `packages/registry/data/chains.json`:

```json
[
  {
    "chainId": 1,
    "name": "Ethereum",
    "shortName": "eth",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
    "rpcUrls": ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth"],
    "blockExplorers": ["https://etherscan.io"],
    "faucets": [],
    "testnet": false,
    "learn": "The original smart contract blockchain. Highest security and decentralization, but gas fees average $2-10 per transaction. Use L2s like Base or Arbitrum for cheaper transactions with Ethereum's security guarantees."
  },
  {
    "chainId": 8453,
    "name": "Base",
    "shortName": "base",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
    "rpcUrls": ["https://mainnet.base.org", "https://base.llamarpc.com"],
    "blockExplorers": ["https://basescan.org"],
    "faucets": [],
    "testnet": false,
    "learn": "Coinbase's L2 built on the OP Stack. Low fees (~$0.01), fast confirmations, strong Coinbase ecosystem integration. Great for consumer apps and onboarding web2 users."
  },
  {
    "chainId": 42161,
    "name": "Arbitrum One",
    "shortName": "arb1",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
    "rpcUrls": ["https://arb1.arbitrum.io/rpc", "https://rpc.ankr.com/arbitrum"],
    "blockExplorers": ["https://arbiscan.io"],
    "faucets": [],
    "testnet": false,
    "learn": "Leading optimistic rollup L2. Higher throughput and lower fees than Ethereum mainnet while inheriting its security. Popular for DeFi protocols (GMX, Camelot)."
  },
  {
    "chainId": 10,
    "name": "Optimism",
    "shortName": "oeth",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
    "rpcUrls": ["https://mainnet.optimism.io", "https://rpc.ankr.com/optimism"],
    "blockExplorers": ["https://optimistic.etherscan.io"],
    "faucets": [],
    "testnet": false,
    "learn": "Optimistic rollup L2 and creator of the OP Stack (which Base, Zora, and others use). Known for retroactive public goods funding. Low fees, growing ecosystem."
  },
  {
    "chainId": 137,
    "name": "Polygon",
    "shortName": "matic",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "POL", "symbol": "POL", "decimals": 18 },
    "rpcUrls": ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon"],
    "blockExplorers": ["https://polygonscan.com"],
    "faucets": [],
    "testnet": false,
    "learn": "EVM-compatible sidechain (not a true L2). Very low fees, fast blocks (2s). Large NFT and gaming ecosystem. Migrated from MATIC to POL token in 2024."
  },
  {
    "chainId": 56,
    "name": "BNB Smart Chain",
    "shortName": "bsc",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "BNB", "symbol": "BNB", "decimals": 18 },
    "rpcUrls": ["https://bsc-dataseed.binance.org", "https://rpc.ankr.com/bsc"],
    "blockExplorers": ["https://bscscan.com"],
    "faucets": [],
    "testnet": false,
    "learn": "Binance's EVM-compatible chain. Low fees, high throughput, but more centralized than Ethereum. Large DeFi ecosystem (PancakeSwap). Popular in Asia."
  },
  {
    "chainId": 43114,
    "name": "Avalanche C-Chain",
    "shortName": "avax",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "Avalanche", "symbol": "AVAX", "decimals": 18 },
    "rpcUrls": ["https://api.avax.network/ext/bc/C/rpc", "https://rpc.ankr.com/avalanche"],
    "blockExplorers": ["https://snowtrace.io"],
    "faucets": [],
    "testnet": false,
    "learn": "Fast L1 with sub-second finality. The C-Chain is EVM-compatible. Known for subnets (custom blockchains) and institutional DeFi (Aave, Trader Joe)."
  },
  {
    "chainId": 250,
    "name": "Fantom",
    "shortName": "ftm",
    "ecosystem": "evm",
    "nativeCurrency": { "name": "Fantom", "symbol": "FTM", "decimals": 18 },
    "rpcUrls": ["https://rpc.ftm.tools", "https://rpc.ankr.com/fantom"],
    "blockExplorers": ["https://ftmscan.com"],
    "faucets": [],
    "testnet": false,
    "learn": "DAG-based EVM chain with fast finality. Evolved into Sonic chain in 2024. Known for Andre Cronje's DeFi experiments. Small but dedicated developer community."
  },
  {
    "chainId": 101,
    "name": "Solana",
    "shortName": "sol",
    "ecosystem": "solana",
    "nativeCurrency": { "name": "SOL", "symbol": "SOL", "decimals": 9 },
    "rpcUrls": ["https://api.mainnet-beta.solana.com"],
    "blockExplorers": ["https://explorer.solana.com", "https://solscan.io"],
    "faucets": [],
    "testnet": false,
    "learn": "High-performance L1 with 400ms block times and sub-cent transaction fees. Uses a completely different programming model than EVM — programs are stateless, accounts hold data. Written in Rust (or Anchor framework). Dominant for memecoins, payments, and high-frequency DeFi."
  },
  {
    "chainId": 103,
    "name": "Solana Devnet",
    "shortName": "sol-devnet",
    "ecosystem": "solana",
    "nativeCurrency": { "name": "SOL", "symbol": "SOL", "decimals": 9 },
    "rpcUrls": ["https://api.devnet.solana.com"],
    "blockExplorers": ["https://explorer.solana.com/?cluster=devnet"],
    "faucets": ["https://faucet.solana.com"],
    "testnet": true,
    "learn": "Solana's development network for testing. Free SOL from the faucet. Resets periodically — don't store anything important here. Use for development and testing before deploying to mainnet."
  }
]
```

- [ ] **Step 4: Implement chains.ts**

Create `packages/registry/src/chains.ts`:

```typescript
import type { Chain } from "./types.js";
import chainsData from "../data/chains.json" with { type: "json" };

const chains: Chain[] = chainsData as Chain[];

const chainsByIdMap = new Map<number, Chain>(
  chains.map((chain) => [chain.chainId, chain])
);

export function getAllChains(): Chain[] {
  return chains;
}

export function getChain(chainId: number): Chain | undefined {
  return chainsByIdMap.get(chainId);
}

export function getChainsByEcosystem(
  ecosystem: "evm" | "solana" | "bitcoin"
): Chain[] {
  return chains.filter((chain) => chain.ecosystem === ecosystem);
}
```

- [ ] **Step 5: Run tests**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/packages/registry
npx vitest run tests/chains.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/registry/
git commit -m "feat(registry): add chain data with 10 chains and lookup functions"
```

---

### Task 5: Create registry package — token data

**Files:**
- Create: `packages/registry/data/tokens.json`
- Create: `packages/registry/src/tokens.ts`
- Create: `packages/registry/tests/tokens.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/registry/tests/tokens.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  getToken,
  getTokensByChain,
  getAllTokens,
} from "../src/tokens.js";

describe("tokens", () => {
  describe("getAllTokens", () => {
    it("returns all tokens", () => {
      const tokens = getAllTokens();
      expect(tokens.length).toBeGreaterThanOrEqual(15);
    });

    it("every token has required fields", () => {
      const tokens = getAllTokens();
      for (const token of tokens) {
        expect(token.symbol).toBeTruthy();
        expect(token.name).toBeTruthy();
        expect(typeof token.decimals).toBe("number");
        expect(token.chains.length).toBeGreaterThan(0);
        expect(token.learn).toBeTruthy();
      }
    });
  });

  describe("getToken", () => {
    it("returns USDC by symbol", () => {
      const usdc = getToken("USDC");
      expect(usdc).toBeDefined();
      expect(usdc!.name).toBe("USD Coin");
      expect(usdc!.chains.length).toBeGreaterThan(1);
    });

    it("is case-insensitive", () => {
      const usdc = getToken("usdc");
      expect(usdc).toBeDefined();
      expect(usdc!.symbol).toBe("USDC");
    });

    it("returns undefined for unknown token", () => {
      expect(getToken("NOTAREALTOKEN")).toBeUndefined();
    });
  });

  describe("getTokensByChain", () => {
    it("returns tokens available on Ethereum (chainId 1)", () => {
      const tokens = getTokensByChain(1);
      expect(tokens.length).toBeGreaterThanOrEqual(5);
      for (const token of tokens) {
        expect(token.chains.some((c) => c.chainId === 1)).toBe(true);
      }
    });

    it("returns tokens available on Solana (chainId 101)", () => {
      const tokens = getTokensByChain(101);
      expect(tokens.length).toBeGreaterThanOrEqual(3);
      for (const token of tokens) {
        expect(token.chains.some((c) => c.chainId === 101)).toBe(true);
      }
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/packages/registry
npx vitest run tests/tokens.test.ts
```

Expected: FAIL — `Cannot find module '../src/tokens.js'`

- [ ] **Step 3: Create tokens.json data file**

Create `packages/registry/data/tokens.json`:

```json
[
  {
    "symbol": "USDC",
    "name": "USD Coin",
    "decimals": 6,
    "chains": [
      { "chainId": 1, "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
      { "chainId": 8453, "address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
      { "chainId": 42161, "address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
      { "chainId": 10, "address": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" },
      { "chainId": 137, "address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
      { "chainId": 56, "address": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" },
      { "chainId": 43114, "address": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },
      { "chainId": 101, "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    "learn": "The most widely used stablecoin, pegged 1:1 to USD and backed by cash reserves. Issued by Circle. Available on virtually every chain. The default choice for denominating prices and settling payments in DeFi."
  },
  {
    "symbol": "USDT",
    "name": "Tether",
    "decimals": 6,
    "chains": [
      { "chainId": 1, "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
      { "chainId": 56, "address": "0x55d398326f99059fF775485246999027B3197955" },
      { "chainId": 42161, "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" },
      { "chainId": 137, "address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" },
      { "chainId": 43114, "address": "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7" },
      { "chainId": 101, "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    "learn": "The first and largest stablecoin by market cap. Pegged to USD. More controversial than USDC due to reserve transparency debates, but has the deepest liquidity across most exchanges and chains."
  },
  {
    "symbol": "WETH",
    "name": "Wrapped Ether",
    "decimals": 18,
    "chains": [
      { "chainId": 1, "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
      { "chainId": 8453, "address": "0x4200000000000000000000000000000000000006" },
      { "chainId": 42161, "address": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" },
      { "chainId": 10, "address": "0x4200000000000000000000000000000000000006" },
      { "chainId": 137, "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    "learn": "ETH wrapped as an ERC-20 token. Native ETH doesn't follow the ERC-20 standard, so DEXs and DeFi protocols need WETH for uniform token handling. You can wrap/unwrap 1:1 anytime via the WETH contract."
  },
  {
    "symbol": "WBTC",
    "name": "Wrapped Bitcoin",
    "decimals": 8,
    "chains": [
      { "chainId": 1, "address": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
      { "chainId": 42161, "address": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" },
      { "chainId": 137, "address": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
    "learn": "Bitcoin represented as an ERC-20 on Ethereum. Lets you use BTC in EVM DeFi (lending, LPing, collateral). Backed 1:1 by Bitcoin held in custody. The main way to get Bitcoin exposure in DeFi."
  },
  {
    "symbol": "DAI",
    "name": "Dai",
    "decimals": 18,
    "chains": [
      { "chainId": 1, "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
      { "chainId": 42161, "address": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" },
      { "chainId": 10, "address": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1" },
      { "chainId": 137, "address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
    "learn": "Decentralized stablecoin by MakerDAO (now Sky). Unlike USDC/USDT, DAI is generated by depositing crypto collateral into vaults — no single company controls it. The OG decentralized stablecoin."
  },
  {
    "symbol": "UNI",
    "name": "Uniswap",
    "decimals": 18,
    "chains": [
      { "chainId": 1, "address": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
      { "chainId": 42161, "address": "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0" },
      { "chainId": 10, "address": "0x6fd9d7AD17242c41f7131d257212c54A0e816691" },
      { "chainId": 137, "address": "0xb33EaAd8d922B1083446DC23f610c2567fB5180f" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
    "learn": "Governance token for Uniswap, the largest decentralized exchange. Holders vote on protocol upgrades and fee distribution. Uniswap pioneered the AMM (Automated Market Maker) model that most DEXs now use."
  },
  {
    "symbol": "LINK",
    "name": "Chainlink",
    "decimals": 18,
    "chains": [
      { "chainId": 1, "address": "0x514910771AF9Ca656af840dff83E8264EcF986CA" },
      { "chainId": 42161, "address": "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" },
      { "chainId": 137, "address": "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39" },
      { "chainId": 43114, "address": "0x5947BB275c521040051D82396192181b413227A3" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    "learn": "The dominant oracle network — it feeds real-world data (prices, weather, sports scores) to smart contracts. Most DeFi protocols depend on Chainlink price feeds. The LINK token pays node operators for providing data."
  },
  {
    "symbol": "AAVE",
    "name": "Aave",
    "decimals": 18,
    "chains": [
      { "chainId": 1, "address": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" },
      { "chainId": 42161, "address": "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196" },
      { "chainId": 137, "address": "0xD6DF932A45C0f255f85145f286eA0b292B21C90B" },
      { "chainId": 43114, "address": "0x63a72806098Bd3D9520cC43356dD78afe5D386D9" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/12645/small/aave-token-round.png",
    "learn": "Governance token for Aave, the largest decentralized lending protocol. Deposit crypto to earn interest, borrow against your collateral. Flash loans (uncollateralized loans repaid in one transaction) were pioneered here."
  },
  {
    "symbol": "ARB",
    "name": "Arbitrum",
    "decimals": 18,
    "chains": [
      { "chainId": 1, "address": "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1" },
      { "chainId": 42161, "address": "0x912CE59144191C1204E64559FE8253a0e49E6548" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    "learn": "Governance token for Arbitrum One, the largest Ethereum L2 by TVL. Used for voting on DAO proposals and incentive programs. Airdropped in March 2023 to early users."
  },
  {
    "symbol": "OP",
    "name": "Optimism",
    "decimals": 18,
    "chains": [
      { "chainId": 1, "address": "0x4200000000000000000000000000000000000042" },
      { "chainId": 10, "address": "0x4200000000000000000000000000000000000042" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    "learn": "Governance token for the Optimism Collective. Used for voting and retroactive public goods funding (RetroPGF). Optimism's OP Stack powers Base, Zora, and other L2s."
  },
  {
    "symbol": "SOL",
    "name": "Solana",
    "decimals": 9,
    "chains": [
      { "chainId": 101, "address": "So11111111111111111111111111111111111111112" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    "learn": "Native token of the Solana blockchain. Used to pay transaction fees (fractions of a cent) and for staking. Unlike ETH, SOL uses a proof-of-stake + proof-of-history consensus mechanism."
  },
  {
    "symbol": "JUP",
    "name": "Jupiter",
    "decimals": 6,
    "chains": [
      { "chainId": 101, "address": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/34188/small/jup.png",
    "learn": "Governance token for Jupiter, the dominant DEX aggregator on Solana (like 1inch for EVM). Jupiter routes trades across all Solana DEXs to find the best price. Also runs a launchpad and perpetuals platform."
  },
  {
    "symbol": "RAY",
    "name": "Raydium",
    "decimals": 6,
    "chains": [
      { "chainId": 101, "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg",
    "learn": "AMM and DEX on Solana. Unique because it provides on-chain liquidity to Serum's central order book. The primary venue for new Solana token launches and liquidity pools."
  },
  {
    "symbol": "BONK",
    "name": "Bonk",
    "decimals": 5,
    "chains": [
      { "chainId": 101, "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg",
    "learn": "The first major Solana memecoin. Community-driven, airdropped to Solana ecosystem participants in late 2022 during the post-FTX recovery. Helped revive Solana developer and user activity."
  },
  {
    "symbol": "PYTH",
    "name": "Pyth Network",
    "decimals": 6,
    "chains": [
      { "chainId": 101, "address": "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3" },
      { "chainId": 1, "address": "0xeFc0C626A249dBe09C5E0e8B42B4A58b1CeA130C" }
    ],
    "logoUrl": "https://assets.coingecko.com/coins/images/31924/small/pyth.png",
    "learn": "Oracle network competing with Chainlink, but Solana-native. Provides high-frequency price feeds (every 400ms vs Chainlink's heartbeat model). Used by most Solana DeFi protocols. Expanding to EVM chains."
  }
]
```

- [ ] **Step 4: Implement tokens.ts**

Create `packages/registry/src/tokens.ts`:

```typescript
import type { Token } from "./types.js";
import tokensData from "../data/tokens.json" with { type: "json" };

const tokens: Token[] = tokensData as Token[];

const tokensBySymbolMap = new Map<string, Token>(
  tokens.map((token) => [token.symbol.toUpperCase(), token])
);

export function getAllTokens(): Token[] {
  return tokens;
}

export function getToken(symbol: string): Token | undefined {
  return tokensBySymbolMap.get(symbol.toUpperCase());
}

export function getTokensByChain(chainId: number): Token[] {
  return tokens.filter((token) =>
    token.chains.some((c) => c.chainId === chainId)
  );
}
```

- [ ] **Step 5: Run tests**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/packages/registry
npx vitest run tests/tokens.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/registry/
git commit -m "feat(registry): add token data with 15 tokens and lookup functions"
```

---

### Task 6: Create registry package — public API

**Files:**
- Create: `packages/registry/src/index.ts`

- [ ] **Step 1: Create the barrel export**

Create `packages/registry/src/index.ts`:

```typescript
export type { Chain, Token } from "./types.js";

export { getAllChains, getChain, getChainsByEcosystem } from "./chains.js";

export { getAllTokens, getToken, getTokensByChain } from "./tokens.js";
```

- [ ] **Step 2: Run all tests to verify nothing broke**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/packages/registry
npx vitest run
```

Expected: All 12 tests PASS.

- [ ] **Step 3: Build the package**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/packages/registry
npx tsc
```

Expected: Clean compilation with no errors. `dist/` directory created with `.js` and `.d.ts` files.

- [ ] **Step 4: Commit**

```bash
git add packages/registry/
git commit -m "feat(registry): add public API and verify build"
```

---

### Task 7: Create .learn.md for token-swap component

**Files:**
- Create: `ui/components/token-swap/token-swap.learn.md`

First, read the existing component to understand what it does:

- [ ] **Step 1: Read the existing token-swap component**

```bash
cat ui/components/token-swap/TokenSwap.tsx
cat ui/components/token-swap/types.ts
```

Understand what props it takes, what it renders, and how it works before writing educational content.

- [ ] **Step 2: Write the .learn.md file**

Create `ui/components/token-swap/token-swap.learn.md`:

```markdown
# Token Swap — Learn

## What is a token swap?

A token swap exchanges one cryptocurrency for another directly on a blockchain — no bank, no exchange account, no intermediary. You connect your wallet, pick two tokens, and the swap happens in a single transaction.

On traditional exchanges (Coinbase, Binance), you deposit funds, place an order, wait for a match, then withdraw. With on-chain swaps, your tokens never leave your wallet until the exact moment they're exchanged.

## How does it work under the hood?

### Automated Market Makers (AMMs)

Most on-chain swaps use an **AMM** instead of a traditional order book. Here's the key idea:

1. **Liquidity providers** deposit pairs of tokens into a **pool** (e.g., ETH + USDC)
2. A mathematical formula (usually `x * y = k`) determines the price based on the ratio of tokens in the pool
3. When you swap, you add tokens to one side of the pool and remove from the other — this changes the ratio, which changes the price

This is fundamentally different from order books where buyers and sellers set specific prices. With AMMs, the price is algorithmic.

### EVM vs Solana

| | EVM (Uniswap, SushiSwap) | Solana (Jupiter, Raydium) |
|---|---|---|
| **Standard** | ERC-20 token approvals | SPL token accounts |
| **Before swapping** | Must `approve()` the router to spend your tokens | Token accounts created automatically |
| **Gas cost** | $2-50 on mainnet, <$0.01 on L2s | <$0.01 always |
| **Speed** | 12s (Ethereum), 2s (L2s) | ~400ms |
| **Aggregators** | 1inch, Paraswap | Jupiter |

### Key terms

- **Slippage** — The difference between the expected price and the actual execution price. Pools with low liquidity have higher slippage. Setting slippage tolerance too low = transaction fails. Too high = you might get a bad price.
- **Price impact** — How much YOUR trade moves the price. Big trades in small pools = big price impact.
- **Liquidity** — The total value of tokens in the pool. More liquidity = less slippage = better prices.
- **Router** — The smart contract that finds the best path for your swap (might route through multiple pools).

## Security considerations

- **Always check the token address** — scam tokens can have the same name/symbol as real ones
- **Set reasonable slippage** — 0.5-1% for major tokens, up to 5% for low-liquidity tokens
- **Beware of sandwich attacks** — MEV bots can front-run your swap on EVM chains. Private RPCs (Flashbots) or L2s reduce this risk
- **Infinite approvals** — Many dApps request unlimited token approval. This means the contract can spend all your tokens forever. Revoke unused approvals at revoke.cash

## How this component works

This component provides the UI for a token swap interface. It handles:
- Token selection (input/output)
- Amount input with balance display
- Slippage settings
- Swap direction toggle (flip input/output)
- Loading and transaction states

The component is **presentation-only** — it doesn't execute actual swaps. You connect it to your swap logic (Uniswap SDK, Jupiter SDK, etc.) via the callback props.
```

- [ ] **Step 3: Commit**

```bash
git add ui/components/token-swap/token-swap.learn.md
git commit -m "docs: add .learn.md for token-swap component"
```

---

### Task 8: Create .learn.md for connect-wallet component

**Files:**
- Create: `ui/components/connect-wallet/connect-wallet.learn.md`

- [ ] **Step 1: Read the existing component**

```bash
cat ui/components/connect-wallet/ConnectWallet.tsx
cat ui/components/connect-wallet/types.ts
```

- [ ] **Step 2: Write the .learn.md file**

Create `ui/components/connect-wallet/connect-wallet.learn.md`:

```markdown
# Connect Wallet — Learn

## What is wallet connection?

Wallet connection is how users authenticate in web3. Instead of email + password, users prove who they are by signing a message with their private key. No accounts to create, no passwords to remember — your wallet IS your identity.

When a user "connects" their wallet to a dApp, they're granting the dApp permission to:
- **See** their public address and token balances
- **Request** transaction signatures (the user must approve each one)

They are NOT giving the dApp access to their private key or permission to move funds without approval.

## How it works

### The connection flow

1. User clicks "Connect Wallet"
2. The dApp detects available wallets (MetaMask, Phantom, etc.) via browser APIs
3. User picks a wallet → the wallet extension opens a popup
4. User approves the connection → the dApp receives the user's public address
5. The dApp can now show the user's address, balances, and request signatures

### EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Standard** | EIP-1193 (`window.ethereum`) + EIP-6963 (multi-wallet discovery) | Wallet Standard (`window.solana` or Wallet Standard API) |
| **Libraries** | wagmi + RainbowKit, ConnectKit, Web3Modal | @solana/wallet-adapter-react |
| **Key wallet** | MetaMask | Phantom |
| **Address format** | `0x` + 40 hex chars (e.g., `0x1234...abcd`) | Base58 string (e.g., `7nYB...3kPW`) |
| **Auth pattern** | SIWE (Sign-In With Ethereum) | SIWS (Sign-In With Solana) |

### What is EIP-6963?

Before EIP-6963 (2023), if you had multiple EVM wallets installed, they'd fight over `window.ethereum`. Only one would win. EIP-6963 introduced a discovery protocol — dApps can now detect ALL installed wallets and let the user choose. Modern wallet libraries (wagmi v2+, RainbowKit v2+) support this by default.

### What is SIWE?

Sign-In With Ethereum (EIP-4361) lets users authenticate to backends using their wallet. Instead of OAuth or passwords:
1. Backend generates a nonce
2. User signs a standardized message with their wallet
3. Backend verifies the signature
4. User is authenticated — no password needed

## Security considerations

- **Never ask users to sign messages they don't understand** — a malicious signature request can drain a wallet
- **Verify the domain** — SIWE messages include the domain to prevent phishing
- **Disconnect when done** — connected dApps can track your address and balances
- **Multiple wallets** — users may have different wallets for different purposes (hot wallet for daily use, hardware wallet for savings)

## How this component works

This component provides the wallet connection UI — the button, wallet selection modal, and connected state display. It handles:
- "Connect" button with wallet provider icons
- Wallet selection when multiple wallets are detected
- Connected state (shows address, avatar, disconnect option)
- Network mismatch warnings

The component is **presentation-only**. Connect it to your wallet provider (wagmi, solana wallet-adapter) via callback props.
```

- [ ] **Step 3: Commit**

```bash
git add ui/components/connect-wallet/connect-wallet.learn.md
git commit -m "docs: add .learn.md for connect-wallet component"
```

---

### Task 9: Create .learn.md for staking-interface component

**Files:**
- Create: `ui/components/staking-interface/staking-interface.learn.md`

- [ ] **Step 1: Read the existing component**

```bash
cat ui/components/staking-interface/StakingInterface.tsx
cat ui/components/staking-interface/types.ts
```

- [ ] **Step 2: Write the .learn.md file**

Create `ui/components/staking-interface/staking-interface.learn.md`:

```markdown
# Staking Interface — Learn

## What is staking?

Staking means locking up your tokens to earn rewards. There are two very different kinds:

### 1. Protocol staking (securing the network)

On proof-of-stake chains, validators lock tokens as collateral to validate transactions. If they cheat, their stake gets "slashed" (partially destroyed). In return, they earn block rewards.

- **Ethereum:** Stake 32 ETH to run a validator (~3-4% APR), or use liquid staking (Lido, Rocket Pool) for any amount
- **Solana:** Delegate SOL to a validator (~7% APR), minimum amount is ~0.01 SOL

### 2. DeFi staking (earning yield)

Protocols incentivize users to lock tokens by distributing rewards. This could mean:
- **Liquidity mining** — stake LP tokens to earn protocol tokens
- **Single-sided staking** — lock a token to earn more of it
- **Governance staking** — lock tokens to gain voting power + rewards

## Key concepts

- **APR vs APY** — APR is the simple interest rate. APY includes compounding. A 10% APR compounded daily ≈ 10.52% APY. Be skeptical of extremely high APYs — they're often unsustainable or denominated in inflationary tokens.
- **Lock-up period** — How long your tokens are locked. Some staking has no lock-up (withdraw anytime), others require days or weeks to unstake. Ethereum validators face a withdrawal queue.
- **Slashing** — The penalty for validator misbehavior (double-signing, extended downtime). Delegators can also lose a portion of their stake if their validator is slashed.
- **Liquid staking** — Stake tokens and receive a receipt token (stETH, mSOL, jitoSOL) that you can use in DeFi while your original tokens are staked. Best of both worlds.
- **Impermanent loss** — When staking LP tokens, the value of your position can decrease relative to just holding the tokens. This happens when the price ratio of the two tokens changes.

### EVM vs Solana

| | EVM | Solana |
|---|---|---|
| **Protocol staking** | 32 ETH minimum (or liquid staking) | Delegate to any validator, tiny minimum |
| **Unstaking time** | Days to weeks (withdrawal queue) | ~2 days (epoch boundary) |
| **Liquid staking tokens** | stETH (Lido), rETH (Rocket Pool) | mSOL (Marinade), jitoSOL (Jito) |
| **DeFi staking** | Approve + stake in separate txns | Often single transaction |

## Security considerations

- **Smart contract risk** — Your staked tokens are held by a contract. If the contract has a bug, funds can be lost. Prefer audited, battle-tested protocols.
- **Rug pull risk** — High APY "staking" platforms may be scams. If rewards seem too good to be true, they are.
- **Validator selection** — When delegating, research validators. Check uptime, commission rate, and slashing history.
- **Token inflation** — Staking rewards often come from token inflation. 20% APY means nothing if the token price drops 50% from dilution.

## How this component works

This component provides the UI for a staking interface. It handles:
- Stake/unstake amount input
- Available balance display
- Current staking position and earned rewards
- APR/APY display
- Claim rewards action
- Lock-up period information

The component is **presentation-only**. Connect it to your staking contract interactions via callback props.
```

- [ ] **Step 3: Commit**

```bash
git add ui/components/staking-interface/staking-interface.learn.md
git commit -m "docs: add .learn.md for staking-interface component"
```

---

### Task 10: Create web3 glossary

**Files:**
- Create: `guides/glossary/glossary.md`
- Remove: `guides/glossary/.gitkeep`

- [ ] **Step 1: Write the glossary**

Create `guides/glossary/glossary.md`:

```markdown
# Web3 Glossary

A plain-language reference for web3 terminology. Terms are explained in the context of building software, not investing.

---

## A

**ABI (Application Binary Interface)** — A JSON description of a smart contract's functions and data types. Like an API schema, but for on-chain contracts. You need the ABI to call a contract's functions from JavaScript/TypeScript.

**Account** — On EVM chains, an address that can hold ETH and interact with contracts. On Solana, a data storage unit — everything is an account (programs, token balances, NFT metadata). These are fundamentally different models.

**Airdrop** — Free tokens distributed to wallet addresses, usually as a reward for early usage or community participation. Many protocols airdrop governance tokens to early users.

**AMM (Automated Market Maker)** — A smart contract that enables token swaps using liquidity pools instead of order books. Uses a mathematical formula (usually `x * y = k`) to determine prices. Uniswap, Raydium, and most DEXs use AMMs.

**Anchor** — The dominant framework for writing Solana programs in Rust. Provides macros that reduce boilerplate, generates TypeScript clients from IDL files, and includes a testing framework.

**Approve** — On EVM chains, you must `approve()` a contract to spend your ERC-20 tokens before it can move them. This is a separate transaction from the actual spend. A common source of confusion for new users.

## B

**Block** — A batch of transactions confirmed together. Ethereum produces a block every ~12 seconds, Solana every ~400ms. Each block references the previous one, forming the chain.

**Block Explorer** — A web app for viewing on-chain data (transactions, addresses, contracts). Etherscan (EVM), Solscan (Solana). Essential for debugging — you can see exactly what happened in any transaction.

**Bridge** — A protocol that moves assets between different blockchains. You lock tokens on chain A and receive wrapped tokens on chain B. Bridges are historically the biggest attack surface in web3 — handle with care.

**Bytecode** — The compiled form of a smart contract that runs on the EVM. Solidity compiles to bytecode. You deploy bytecode, not source code.

## C

**Chain ID** — A unique number identifying an EVM network. Ethereum mainnet = 1, Base = 8453, Arbitrum = 42161. Prevents transactions from being replayed on different chains.

**Confirmation** — The number of blocks mined after your transaction's block. More confirmations = more finality. For Ethereum, 12+ confirmations is considered safe. Solana achieves finality in ~400ms.

**Consensus** — How a blockchain agrees on which transactions are valid. Ethereum uses proof-of-stake (validators stake ETH). Solana uses proof-of-stake + proof-of-history (validators order events using a verifiable clock).

**Contract (Smart Contract)** — Code deployed on a blockchain that executes automatically when called. On EVM chains, written in Solidity or Vyper. On Solana, written in Rust and called "programs" (see **Program**).

**CPI (Cross-Program Invocation)** — Solana term for one program calling another program. Similar to calling another contract on EVM, but with different account and ownership rules.

## D

**DAO (Decentralized Autonomous Organization)** — An organization governed by token holders through on-chain voting. Members propose and vote on changes, treasury spending, and protocol parameters.

**dApp (Decentralized Application)** — A web application that interacts with smart contracts. Usually a React/Next.js frontend + wallet connection + on-chain contracts for the backend logic.

**DeFi (Decentralized Finance)** — Financial services (lending, borrowing, trading, insurance) built on smart contracts instead of banks. Aave, Uniswap, MakerDAO, Jupiter are all DeFi protocols.

**DEX (Decentralized Exchange)** — A platform for swapping tokens without a central authority. Uniswap (EVM), Jupiter (Solana). Uses AMMs or order books on-chain.

## E

**EIP (Ethereum Improvement Proposal)** — A design document for proposing changes to Ethereum. EIP-20 defined ERC-20 tokens, EIP-721 defined NFTs, EIP-4337 defined account abstraction.

**ENS (Ethereum Name Service)** — Turns Ethereum addresses into human-readable names (e.g., `vitalik.eth`). Like DNS but for wallets. Stores names as NFTs on Ethereum.

**EOA (Externally Owned Account)** — A regular wallet address controlled by a private key (as opposed to a contract account). When MetaMask creates a wallet, it creates an EOA.

**ERC-20** — The standard interface for fungible tokens on EVM chains. Defines `transfer()`, `approve()`, `balanceOf()`, and other functions that all tokens implement. USDC, UNI, LINK are all ERC-20 tokens.

**ERC-721** — The standard for non-fungible tokens (NFTs) on EVM chains. Each token has a unique ID. Used for art, gaming items, domain names, and more.

**EVM (Ethereum Virtual Machine)** — The runtime environment that executes smart contracts on Ethereum and compatible chains. Base, Arbitrum, Polygon, BSC all run the EVM, which is why the same Solidity code works across them.

## F

**Faucet** — A service that gives free testnet tokens for development. Every testnet has faucets. You'll use them constantly during development.

**Finality** — When a transaction can never be reversed. Ethereum: ~12 minutes (2 epochs). Solana: ~400ms (single slot). L2s inherit Ethereum's finality after posting data.

**Flash Loan** — An uncollateralized loan that must be borrowed and repaid within a single transaction. If not repaid, the entire transaction reverts as if it never happened. Used for arbitrage, liquidations, and collateral swaps.

**Foundry** — A Solidity development toolkit (compile, test, deploy). Tests are written in Solidity, not JavaScript. Faster than Hardhat. Includes `forge` (build/test), `cast` (CLI), `anvil` (local node), `chisel` (REPL).

## G

**Gas** — The unit measuring computational work on EVM chains. Every operation costs gas. Gas price × gas used = transaction fee. Solana doesn't use gas — it has fixed compute unit fees.

**Gas Limit** — The maximum gas you're willing to spend on a transaction. If execution exceeds the limit, the transaction fails but you still pay for the gas consumed.

**Governance** — On-chain voting by token holders to make protocol decisions. Typically involves proposal creation, voting period, timelock delay, and execution.

## H

**Hardhat** — JavaScript/TypeScript Ethereum development environment. Compile, test, deploy contracts. Includes a local network for development. Tests are written in JS/TS with ethers.js or viem.

**Hash** — A fixed-length string produced by a cryptographic function. Transaction hashes uniquely identify transactions. Block hashes identify blocks. Used everywhere in web3 for verification.

## I

**IDL (Interface Definition Language)** — Solana/Anchor's equivalent of an ABI. A JSON file describing a program's instructions and accounts. Auto-generated by Anchor and used to create TypeScript clients.

**Impermanent Loss** — The loss of value from providing liquidity to an AMM compared to just holding the tokens. Happens when the price ratio of the pooled tokens changes. "Impermanent" because it reverses if prices return to their original ratio.

## K

**Keypair** — A public key + private key pair. The public key is your address (safe to share). The private key signs transactions (never share). On Solana, keypairs are stored as 64-byte arrays. On EVM, the private key is 32 bytes and the address is derived from the public key.

## L

**L1 (Layer 1)** — The base blockchain (Ethereum, Solana, Bitcoin). Handles consensus and security directly.

**L2 (Layer 2)** — A chain built on top of an L1 for scalability. Executes transactions faster/cheaper, then posts proofs or data back to the L1 for security. Base, Arbitrum, Optimism are Ethereum L2s.

**Liquidity** — The amount of tokens available for trading in a pool or market. More liquidity = less slippage = better prices.

**Liquidity Pool (LP)** — A smart contract holding pairs of tokens that enable trading. Liquidity providers deposit tokens and earn a share of trading fees.

## M

**Mainnet** — The live, production blockchain where real value is transacted. As opposed to testnet/devnet.

**MEV (Maximal Extractable Value)** — Profit that block producers (or searchers) can extract by reordering, inserting, or censoring transactions. Includes front-running, sandwich attacks, and arbitrage. A major issue on EVM chains.

**Mint** — To create new tokens or NFTs. "Minting" an NFT means deploying the token for the first time. On Solana, the mint account holds the supply and decimals for a token.

**Multisig** — A wallet that requires multiple signatures (e.g., 3 of 5 owners) to approve a transaction. Used for treasury management and team-controlled contracts. Safe (formerly Gnosis Safe) is the standard on EVM.

## N

**NFT (Non-Fungible Token)** — A unique token representing ownership of a specific item. Unlike fungible tokens (1 USDC = 1 USDC), each NFT is distinct. ERC-721 on EVM, Metaplex standards on Solana.

**Nonce** — A counter tracking how many transactions an address has sent (EVM). Each transaction must use the next nonce in sequence. If nonce 5 is pending, nonce 6 can't execute. On Solana, recent blockhashes serve a similar anti-replay purpose.

## O

**Oracle** — A service that brings off-chain data (prices, weather, sports scores) onto the blockchain. Smart contracts can't access external data directly — oracles bridge this gap. Chainlink (EVM) and Pyth (Solana) are the dominant oracle networks.

## P

**PDA (Program Derived Address)** — A Solana address deterministically derived from a program ID and seeds. PDAs don't have private keys — only the program that derived them can sign for them. Used for program-owned accounts, vaults, and configuration storage. No EVM equivalent — the closest concept is `CREATE2` deterministic contract addresses.

**Private Key** — The secret key that controls a wallet. Anyone with your private key can steal all your funds. Never share it, never commit it to git, never paste it in a website.

**Program** — Solana's term for a smart contract. Programs are stateless — they read and write to accounts but don't store data themselves. This is a fundamental difference from EVM contracts, which store their own state.

**Proof of Stake (PoS)** — Consensus mechanism where validators lock tokens as collateral. If they misbehave, their stake is slashed. Ethereum switched from proof-of-work to PoS in 2022 ("The Merge").

## R

**Rent** — On Solana, accounts must maintain a minimum SOL balance to exist on-chain (called "rent exemption"). If an account's balance drops below this threshold, it can be garbage collected. In practice, all accounts are made rent-exempt at creation.

**RPC (Remote Procedure Call)** — The API endpoint for communicating with a blockchain node. You send transactions and read data through RPC calls. Public RPCs are free but rate-limited. Production apps use paid providers (Alchemy, Helius, QuickNode).

**Rug Pull** — A scam where project creators drain liquidity or abandon a project after raising funds. Common patterns: removing LP, minting unlimited tokens, disabling selling via contract logic.

## S

**Seed Phrase (Mnemonic)** — A 12 or 24 word phrase that generates your private key. Write it down on paper. Never store it digitally. Losing it = losing all your funds forever. No customer support to call.

**Signature** — Cryptographic proof that a transaction was authorized by the private key holder. You sign transactions in your wallet before they're broadcast. dApps can also request message signatures for authentication (SIWE).

**Slippage** — The difference between expected and actual trade execution price. Caused by price movement between when you submit a transaction and when it executes. Set slippage tolerance in DEX UIs to control maximum acceptable deviation.

**SPL Token** — Solana's token standard (equivalent to ERC-20). Managed by the SPL Token Program. Each token has a mint account (supply, decimals) and token accounts (individual balances).

**Staking** — Locking tokens to earn rewards. Can mean protocol-level staking (securing the network) or DeFi staking (earning yield from protocols).

## T

**Testnet** — A test blockchain for development. Free tokens, no real value. Ethereum has Sepolia and Holesky. Solana has Devnet and Testnet. Always develop and test on testnets before mainnet.

**Token** — A digital asset on a blockchain. Fungible tokens (ERC-20, SPL) are interchangeable (1 USDC = 1 USDC). Non-fungible tokens (ERC-721, Metaplex) are unique.

**Transaction** — An on-chain operation signed by a wallet. On EVM: a single contract call with a gas limit. On Solana: can contain multiple instructions that execute atomically (all succeed or all fail).

**TVL (Total Value Locked)** — The total value of assets deposited in a DeFi protocol. A common metric for comparing protocol size and adoption.

## V

**Validator** — A node that participates in consensus by staking tokens and validating transactions. On Ethereum, validators stake 32 ETH. On Solana, validators can accept delegated SOL from any user.

**Vesting** — A schedule that gradually unlocks tokens over time. Used for team allocations, investor tokens, and employee compensation. Prevents recipients from dumping all tokens at once.

## W

**Wallet** — Software that manages your private keys and lets you sign transactions. Browser extensions (MetaMask, Phantom), mobile apps (Rainbow, Solflare), or hardware devices (Ledger, Trezor).

**Wei** — The smallest unit of ETH. 1 ETH = 10^18 wei. Smart contracts work in wei, not ETH. Similarly, USDC uses 6 decimals (1 USDC = 1,000,000 units).

**Wrapped Token** — A token pegged 1:1 to another asset, represented on a different chain or standard. WETH is ETH wrapped as ERC-20. WBTC is Bitcoin on Ethereum. Wrapping/unwrapping is always 1:1.

## Y

**Yield** — The return earned on deposited/staked tokens, expressed as APR or APY. Sources include: trading fees, protocol rewards, lending interest, and token emissions.

## Z

**Zero-Knowledge Proof (ZKP)** — A cryptographic proof that something is true without revealing the underlying data. Used in ZK rollups (L2s that prove transaction validity) and privacy protocols. zkSync and Scroll are ZK rollup L2s on Ethereum.
```

- [ ] **Step 2: Remove the .gitkeep**

```bash
rm guides/glossary/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add guides/glossary/
git commit -m "docs: add web3 glossary with 50+ core terms"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run all registry tests**

```bash
cd /Users/petarstoev/Code/w3-kit-repo/packages/registry
npx vitest run
```

Expected: All 12 tests PASS.

- [ ] **Step 2: Verify full directory structure**

```bash
cd /Users/petarstoev/Code/w3-kit-repo
find contracts recipes guides templates packages -type f -not -path '*/node_modules/*' -not -path '*/dist/*' | sort
```

Expected output should include:
```
contracts/evm/.gitkeep
contracts/solana/.gitkeep
guides/concepts/.gitkeep
guides/evm/.gitkeep
guides/glossary/glossary.md
guides/security/.gitkeep
guides/solana/.gitkeep
packages/registry/data/chains.json
packages/registry/data/tokens.json
packages/registry/package.json
packages/registry/src/chains.ts
packages/registry/src/index.ts
packages/registry/src/tokens.ts
packages/registry/src/types.ts
packages/registry/tests/chains.test.ts
packages/registry/tests/tokens.test.ts
packages/registry/tsconfig.json
packages/registry/vitest.config.ts
recipes/cross-chain/.gitkeep
recipes/evm/.gitkeep
recipes/solana/.gitkeep
templates/saas-boilerplate/...
```

- [ ] **Step 3: Verify .learn.md files exist**

```bash
ls ui/components/token-swap/token-swap.learn.md
ls ui/components/connect-wallet/connect-wallet.learn.md
ls ui/components/staking-interface/staking-interface.learn.md
```

Expected: All three files exist.

- [ ] **Step 4: Check git log for clean commit history**

```bash
git log --oneline -10
```

Expected: ~7 clean commits from this plan:
1. `chore: create monorepo directory structure for w3-kit expansion`
2. `chore: move sol-saas-boilerplate into templates/saas-boilerplate`
3. `feat(registry): scaffold registry package with types`
4. `feat(registry): add chain data with 10 chains and lookup functions`
5. `feat(registry): add token data with 15 tokens and lookup functions`
6. `feat(registry): add public API and verify build`
7. `docs: add .learn.md for token-swap component`
8. `docs: add .learn.md for connect-wallet component`
9. `docs: add .learn.md for staking-interface component`
10. `docs: add web3 glossary with 50+ core terms`
