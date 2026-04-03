export type ChainFilter = "evm" | "solana" | "both";

export interface TemplateMeta {
  name: string;
  description: string;
  chain: ChainFilter;
  stack: string;
}

export interface RecipeMeta {
  name: string;
  description: string;
  chains: ("evm" | "solana")[];
  dependencies: {
    evm?: string[];
    solana?: string[];
  };
}

export interface GithubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
}
