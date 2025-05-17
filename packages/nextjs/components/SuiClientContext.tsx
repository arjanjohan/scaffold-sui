import { ReactNode } from "react";
import { SuiClientProvider, WalletProvider, createNetworkConfig } from "@mysten/dapp-kit";
import scaffoldConfig from "~~/scaffold.config";

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig(
  Object.fromEntries(scaffoldConfig.targetNetworks.map(network => [network.id, { url: network.url }])),
);

export const SuiWalletContext = ({ children }: { children: ReactNode }) => {
  return (
    <SuiClientProvider networks={networkConfig} network={scaffoldConfig.targetNetworks[0].id}>
      <WalletProvider autoConnect>{children}</WalletProvider>
    </SuiClientProvider>
  );
};
