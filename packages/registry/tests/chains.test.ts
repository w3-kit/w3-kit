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
