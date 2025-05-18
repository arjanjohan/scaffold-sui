import { useSuiClientContext } from "@mysten/dapp-kit";
import scaffoldConfig from "~~/scaffold.config";
import { Chain } from "~~/utils/scaffold-sui/chains";

/**
 * Retrieves the connected wallet's network from scaffold.config or defaults to the 0th network in the list if the wallet is not connected.
 * Also provides a way to switch networks.
 */

export function useTargetNetwork(): {
  targetNetwork: Chain;
  setTargetNetwork: (network: Chain) => void;
  availableNetworks: readonly Chain[];
} {
  const ctx = useSuiClientContext();
  const targetNetwork = scaffoldConfig.targetNetworks.find(n => n.id === ctx.network) as Chain;

  const setTargetNetwork = (network: Chain) => {
    if (ctx?.selectNetwork) {
      ctx.selectNetwork(network.id);
    }
  };

  return {
    targetNetwork,
    setTargetNetwork,
    availableNetworks: scaffoldConfig.targetNetworks,
  };
}
