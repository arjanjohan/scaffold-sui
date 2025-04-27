import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { Network, NetworkToChainId } from "@aptos-labs/ts-sdk";

export type Chain = {
  url: string;
  name: string;

};

type Chains = {
  [key: string]: Chain;
};

export const defaultChains: Chains = {
  devnet: {
    url: getFullnodeUrl("devnet"),
    name: "Devnet",
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    name: "Testnet",
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    name: "Mainnet",
  },
};
