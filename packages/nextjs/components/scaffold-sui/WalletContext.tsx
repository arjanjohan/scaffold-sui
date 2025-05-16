import { ReactNode } from "react";
import { WalletProvider } from "@mysten/dapp-kit";

export const WalletContext = ({ children }: { children: ReactNode }) => {
  return <WalletProvider autoConnect>{children}</WalletProvider>;
};
