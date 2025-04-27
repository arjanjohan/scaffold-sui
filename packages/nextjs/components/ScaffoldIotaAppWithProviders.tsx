"use client";

import { IotaClientProvider, WalletProvider, createNetworkConfig } from "@iota/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { ProgressBar } from "~~/components/scaffold-iota/ProgressBar";
import { useGlobalState } from "~~/services/store/store";
import scaffoldConfig from "~~/scaffold.config";

const ScaffoldIotaApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig(
  Object.fromEntries(
    scaffoldConfig.targetNetworks.map(network => [
      network.id,
      { url: network.url }
    ])
  )
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldIotaAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { targetNetwork, setTargetNetwork } = useGlobalState();

  return (
    <QueryClientProvider client={queryClient}>
      <ProgressBar />
      <IotaClientProvider
        networks={networkConfig}
        network={targetNetwork.id}
        onNetworkChange={(networkId) => {
          const newNetwork = scaffoldConfig.targetNetworks.find(n => n.id === networkId);
          if (newNetwork) setTargetNetwork(newNetwork);
        }}
      >
        <WalletProvider autoConnect>
          <ScaffoldIotaApp>{children}</ScaffoldIotaApp>
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
};
