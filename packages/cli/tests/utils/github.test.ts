import { describe, it, expect, vi } from "vitest";
import { fetchGithubDirectory, fetchGithubFile } from "../../src/utils/github.js";

describe("github utils", () => {
  describe("fetchGithubDirectory", () => {
    it("constructs correct API URL for a directory path", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{
          name: "README.md",
          path: "recipes/swap-tokens/README.md",
          type: "file",
          download_url: "https://raw.githubusercontent.com/w3-kit/w3-kit/main/recipes/swap-tokens/README.md",
        }]),
      });
      vi.stubGlobal("fetch", fetchSpy);
      const files = await fetchGithubDirectory("recipes/swap-tokens");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/w3-kit/w3-kit/contents/recipes/swap-tokens?ref=main",
        expect.objectContaining({
          headers: expect.objectContaining({ Accept: "application/vnd.github.v3+json" }),
        })
      );
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe("README.md");
      vi.unstubAllGlobals();
    });

    it("throws on non-200 response", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
      await expect(fetchGithubDirectory("nonexistent")).rejects.toThrow("Failed to fetch from GitHub (404)");
      vi.unstubAllGlobals();
    });
  });

  describe("fetchGithubFile", () => {
    it("fetches raw file content", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hello") }));
      const content = await fetchGithubFile("https://raw.githubusercontent.com/w3-kit/w3-kit/main/README.md");
      expect(content).toBe("# Hello");
      vi.unstubAllGlobals();
    });
  });
});
