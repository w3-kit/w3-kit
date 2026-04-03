import { describe, it, expect } from "vitest";
import { parseRecipeMeta, resolveRecipeFiles } from "../../src/commands/add.js";

describe("add command", () => {
  describe("parseRecipeMeta", () => {
    it("parses meta.json content", () => {
      const json = JSON.stringify({
        name: "swap-tokens",
        description: "Swap tokens on a DEX",
        chains: ["evm", "solana"],
        dependencies: { evm: ["viem"], solana: ["@solana/web3.js"] },
      });
      const meta = parseRecipeMeta(json);
      expect(meta.name).toBe("swap-tokens");
      expect(meta.chains).toEqual(["evm", "solana"]);
      expect(meta.dependencies.evm).toEqual(["viem"]);
    });
  });

  describe("resolveRecipeFiles", () => {
    it("filters files by chain selection for evm", () => {
      const files = [
        { path: "recipes/swap-tokens/evm.tsx", content: "evm code" },
        { path: "recipes/swap-tokens/solana.tsx", content: "solana code" },
        { path: "recipes/swap-tokens/README.md", content: "readme" },
        { path: "recipes/swap-tokens/swap-tokens.learn.md", content: "learn" },
        { path: "recipes/swap-tokens/meta.json", content: "{}" },
      ];
      const result = resolveRecipeFiles(files, "evm");
      const paths = result.map((f) => f.path);
      expect(paths).toContain("recipes/swap-tokens/evm.tsx");
      expect(paths).toContain("recipes/swap-tokens/README.md");
      expect(paths).toContain("recipes/swap-tokens/swap-tokens.learn.md");
      expect(paths).not.toContain("recipes/swap-tokens/solana.tsx");
      expect(paths).not.toContain("recipes/swap-tokens/meta.json");
    });

    it("includes both chain files when chain is both", () => {
      const files = [
        { path: "recipes/swap-tokens/evm.tsx", content: "evm" },
        { path: "recipes/swap-tokens/solana.tsx", content: "solana" },
        { path: "recipes/swap-tokens/README.md", content: "readme" },
      ];
      const result = resolveRecipeFiles(files, "both");
      expect(result).toHaveLength(3);
    });
  });
});
