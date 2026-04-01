export interface Network {
  chainId: number;
  name: string;
  logoURI?: string;
  rpcUrl: string;
  currency: string;
  blockExplorer: string;
}

export interface NetworkSwitcherProps {
  networks: Network[];
  testNetworks: Network[];
  onSwitch: (chainId: number) => Promise<void>;
  className?: string;
}
