import { describe, it, expect, vi } from "vitest";
import { detectPackageManager, buildInstallCommand } from "../../src/utils/deps.js";
import { existsSync } from "fs";

vi.mock("fs", () => ({ existsSync: vi.fn() }));

describe("deps utils", () => {
  describe("detectPackageManager", () => {
    it("detects pnpm from pnpm-lock.yaml", () => {
      vi.mocked(existsSync).mockImplementation((path) => String(path).endsWith("pnpm-lock.yaml"));
      expect(detectPackageManager("/project")).toBe("pnpm");
    });
    it("detects yarn from yarn.lock", () => {
      vi.mocked(existsSync).mockImplementation((path) => String(path).endsWith("yarn.lock"));
      expect(detectPackageManager("/project")).toBe("yarn");
    });
    it("detects bun from bun.lockb", () => {
      vi.mocked(existsSync).mockImplementation((path) => String(path).endsWith("bun.lockb"));
      expect(detectPackageManager("/project")).toBe("bun");
    });
    it("defaults to npm when no lockfile found", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      expect(detectPackageManager("/project")).toBe("npm");
    });
  });

  describe("buildInstallCommand", () => {
    it("builds npm install command", () => {
      expect(buildInstallCommand("npm", ["viem", "@uniswap/sdk-core"])).toEqual({ command: "npm", args: ["install", "viem", "@uniswap/sdk-core"] });
    });
    it("builds pnpm add command", () => {
      expect(buildInstallCommand("pnpm", ["viem"])).toEqual({ command: "pnpm", args: ["add", "viem"] });
    });
    it("builds yarn add command", () => {
      expect(buildInstallCommand("yarn", ["viem"])).toEqual({ command: "yarn", args: ["add", "viem"] });
    });
    it("builds bun add command", () => {
      expect(buildInstallCommand("bun", ["viem"])).toEqual({ command: "bun", args: ["add", "viem"] });
    });
    it("returns null for no dependencies", () => {
      expect(buildInstallCommand("npm", [])).toBeNull();
    });
  });
});
