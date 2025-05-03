import { ReactNode } from "react";
import { IotaClientProvider, WalletProvider, createNetworkConfig } from "@iota/dapp-kit";
import scaffoldConfig from "~~/scaffold.config";

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig(
  Object.fromEntries(scaffoldConfig.targetNetworks.map(network => [network.id, { url: network.url }])),
);

export const IotaWalletContext = ({ children }: { children: ReactNode }) => {
  return (
    <IotaClientProvider networks={networkConfig} network={scaffoldConfig.targetNetworks[0].id}>
      <WalletProvider autoConnect>{children}</WalletProvider>
    </IotaClientProvider>
  );
};
