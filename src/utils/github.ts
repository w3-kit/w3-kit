import type { GithubFile } from "../types.js";

const BRANCH = "main";

function apiBase(repo: string): string {
  return `https://api.github.com/repos/${repo}/contents`;
}

export async function fetchGithubDirectory(repo: string, path: string): Promise<GithubFile[]> {
  const url = `${apiBase(repo)}/${path}?ref=${BRANCH}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "w3-kit-cli",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch from GitHub (${response.status})`);
  }
  return response.json() as Promise<GithubFile[]>;
}

export async function fetchGithubFile(downloadUrl: string): Promise<string> {
  const response = await fetch(downloadUrl, {
    headers: { "User-Agent": "w3-kit-cli" },
  });
  if (!response.ok) {
    throw new Error(`Failed to download file (${response.status})`);
  }
  return response.text();
}

export async function fetchDirectoryRecursive(repo: string, path: string): Promise<{ path: string; content: string }[]> {
  const entries = await fetchGithubDirectory(repo, path);

  const filePromises = entries
    .filter((e): e is GithubFile & { download_url: string } => e.type === "file" && e.download_url !== null)
    .map((e) => fetchGithubFile(e.download_url).then((content) => ({ path: e.path, content })));

  const dirPromises = entries
    .filter((e) => e.type === "dir")
    .map((e) => fetchDirectoryRecursive(repo, e.path));

  const [files, ...nestedArrays] = await Promise.all([
    Promise.all(filePromises),
    ...dirPromises,
  ]);

  return [...files, ...nestedArrays.flat()];
}
