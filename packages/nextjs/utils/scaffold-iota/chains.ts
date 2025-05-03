import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { getFaucetHost } from "@iota/iota-sdk/faucet";

export type Chain = {
  id: string;
  name: string;
  url: string;
  isTestnet: boolean;
  faucet?: string;
};

export const defaultChains = {
  devnet: {
    id: "devnet",
    name: "IOTA Devnet",
    url: getFullnodeUrl("devnet"),
    isTestnet: true,
    faucet: getFaucetHost("devnet"),
  },
  testnet: {
    id: "testnet",
    name: "IOTA Testnet",
    url: getFullnodeUrl("testnet"),
    isTestnet: true,
    faucet: getFaucetHost("testnet"),
  },
} as const satisfies Record<string, Chain>;
