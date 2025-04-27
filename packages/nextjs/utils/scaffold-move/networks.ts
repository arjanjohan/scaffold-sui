import { Network } from "@aptos-labs/ts-sdk";
import scaffoldConfig from "~~/scaffold.config";
import { Chain } from "~~/utils/scaffold-move/chains";

/**
 * Gives the faucet address URL, returns empty string if the faucet is not defined (mainnet or local chain)
 */
export function getFaucetAddressLink(chain: Chain) {
  // if (chain.faucet === "") {
    return "";
  // }
  // return chain.faucet;
}

/**
 * @returns targetNetworks array containing networks configured in scaffold.config including extra network metadata
 */
export function getTargetNetworks(): Chain[] {
  return scaffoldConfig.targetNetworks.map(targetNetwork => ({
    ...targetNetwork,
  }));
}
