import { Chain, defaultChains } from "./utils/scaffold-iota/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly Chain[];
  pollingInterval: number;
  onlyLocalBurnerWallet: boolean;
};

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [defaultChains.iota_testnet, defaultChains.iota_devnet],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // Only show the Burner Wallet when running on local network
  onlyLocalBurnerWallet: true,

} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
