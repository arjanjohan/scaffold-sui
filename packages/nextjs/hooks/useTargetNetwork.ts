// import { useEffect } from "react";
// import { useWallets } from "@iota/dapp-kit";
// import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";
import { Chain } from "~~/utils/scaffold-iota/chains";

/**
 * Retrieves the connected wallet's network from scaffold.config or defaults to the 0th network in the list if the wallet is not connected.
 */
export function useTargetNetwork(): { targetNetwork: Chain } {
  const targetNetwork = useGlobalState(({ targetNetwork }) => targetNetwork);
  // const setTargetNetwork = useGlobalState(({ setTargetNetwork }) => setTargetNetwork);

  // useEffect(() => {
  //   const newSelectedNetwork = scaffoldConfig.targetNetworks.find(
  //     (network) => network.id === useWallets()[0].chains.find((chain) => chain.id === targetNetwork.id)?.id,
  //   );
  //   if (newSelectedNetwork) {
  //     setTargetNetwork(newSelectedNetwork);
  //   }
  // }, [setTargetNetwork, targetNetwork.id]);

  return { targetNetwork };
}
