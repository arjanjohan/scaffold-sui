import { getFullnodeUrl } from "@mysten/sui/client";
import { getFaucetHost } from "@mysten/sui/faucet";

export const networks = ["devnet", "testnet"] as const;
export type NetworkId = typeof networks[number];

export type Chain = {
  id: NetworkId;
  name: string;
  url: string;
  isTestnet: boolean;
  faucet?: string;
  explorer?: string;
};

export const defaultChains = {
  devnet: {
    id: "devnet",
    name: "IOTA Devnet",
    url: getFullnodeUrl("devnet"),
    isTestnet: true,
    faucet: getFaucetHost("devnet"),
    explorer: "https://suiscan.xyz/devnet/",
  },
  testnet: {
    id: "testnet",
    name: "IOTA Testnet",
    url: getFullnodeUrl("testnet"),
    isTestnet: true,
    faucet: getFaucetHost("testnet"),
    explorer: "https://suiscan.xyz/testnet/",
  },
} as const satisfies Record<NetworkId, Chain>;
