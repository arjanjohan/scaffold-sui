import scaffoldConfig from "~~/scaffold.config";
import { Chain } from "~~/utils/scaffold-iota/chains";

/**
 * @returns targetNetworks array containing networks configured in scaffold.config including extra network metadata
 */
export function getTargetNetworks(): Chain[] {
  return scaffoldConfig.targetNetworks.map(targetNetwork => ({
    ...targetNetwork,
  }));
}
