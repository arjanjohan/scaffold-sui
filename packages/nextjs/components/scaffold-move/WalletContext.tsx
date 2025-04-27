import { ReactNode } from "react";
import { IotaClientProvider, WalletProvider } from "@iota/dapp-kit";

export const WalletContext = ({ children }: { children: ReactNode }) => {
  return <WalletProvider autoConnect>{children}</WalletProvider>;
};
