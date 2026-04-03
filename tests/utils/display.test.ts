import { describe, it, expect } from "vitest";
import { formatTable, formatKeyValue } from "../../src/utils/display.js";

describe("display utils", () => {
  describe("formatTable", () => {
    it("formats data into aligned columns", () => {
      const result = formatTable(["Name", "ID"], [["Ethereum", "1"], ["Arbitrum", "42161"]]);
      expect(result).toContain("Name");
      expect(result).toContain("Ethereum");
      expect(result).toContain("42161");
    });
    it("handles empty rows", () => {
      const result = formatTable(["Name"], []);
      expect(result).toContain("Name");
    });
  });
  describe("formatKeyValue", () => {
    it("formats key-value pairs", () => {
      const result = formatKeyValue([["Chain", "Ethereum"], ["Chain ID", "1"]]);
      expect(result).toContain("Chain");
      expect(result).toContain("Ethereum");
    });
  });
});
