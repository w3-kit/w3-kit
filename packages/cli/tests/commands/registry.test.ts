import { describe, it, expect } from "vitest";
import { getAllChains, getChain, getToken } from "@w3-kit/registry";
import { formatChainsTable, formatChainDetail, formatTokenTable } from "../../src/commands/registry.js";

describe("registry command", () => {
  describe("formatChainsTable", () => {
    it("formats all chains into table data", () => {
      const chains = getAllChains();
      const result = formatChainsTable(chains);
      expect(result.headers).toEqual(["Chain", "Chain ID", "Type", "Native Token"]);
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0]).toHaveLength(4);
    });
  });

  describe("formatChainDetail", () => {
    it("formats a single chain as key-value pairs", () => {
      const chain = getChain(1);
      expect(chain).toBeDefined();
      const result = formatChainDetail(chain!);
      expect(result.some(([k]) => k === "Chain")).toBe(true);
      expect(result.some(([k]) => k === "Chain ID")).toBe(true);
      expect(result.some(([k]) => k === "RPC")).toBe(true);
    });

    it("returns undefined for unknown chain", () => {
      const chain = getChain(999999);
      expect(chain).toBeUndefined();
    });
  });

  describe("formatTokenTable", () => {
    it("formats token addresses across chains", () => {
      const token = getToken("USDC");
      expect(token).toBeDefined();
      const result = formatTokenTable(token!);
      expect(result.headers).toEqual(["Chain", "Address", "Decimals"]);
      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});
