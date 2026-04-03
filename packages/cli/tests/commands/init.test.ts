import { describe, it, expect } from "vitest";
import { filterTemplates } from "../../src/commands/init.js";
import type { TemplateMeta } from "../../src/types.js";

const templates: TemplateMeta[] = [
  { name: "nextjs-evm", description: "Next.js + wagmi", chain: "evm", stack: "Next.js + wagmi + viem + RainbowKit" },
  { name: "script-evm", description: "TS + viem", chain: "evm", stack: "TypeScript + viem" },
  { name: "nextjs-solana", description: "Next.js + wallet-adapter", chain: "solana", stack: "Next.js + wallet-adapter" },
  { name: "script-solana", description: "TS + web3.js", chain: "solana", stack: "TypeScript + @solana/web3.js" },
];

describe("init command", () => {
  describe("filterTemplates", () => {
    it("filters templates by evm chain", () => {
      const result = filterTemplates(templates, "evm");
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.chain === "evm")).toBe(true);
    });
    it("filters templates by solana chain", () => {
      const result = filterTemplates(templates, "solana");
      expect(result).toHaveLength(2);
      expect(result.every((t) => t.chain === "solana")).toBe(true);
    });
    it("returns all templates for both", () => {
      const result = filterTemplates(templates, "both");
      expect(result).toHaveLength(4);
    });
  });
});
