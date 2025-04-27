import { ReactNode } from "react";
import { WalletProvider } from "@iota/dapp-kit";

export const WalletContext = ({ children }: { children: ReactNode }) => {
  return <WalletProvider autoConnect>{children}</WalletProvider>;
};
