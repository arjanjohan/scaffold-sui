"use client";

import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";
import { Balance } from "~~/components/scaffold-iota";
import { useGlobalState } from "~~/services/store/store";
import { getAddressUrl } from "~~/utils/scaffold-iota/getExplorerPaths";

export const CustomConnectButton = () => {
  const { targetNetwork } = useGlobalState();
  const account = useCurrentAccount();
  const connected = account !== null;

  let blockExplorerAddressLink = undefined;
  if (account) {
    blockExplorerAddressLink = getAddressUrl(account.address, targetNetwork.id);
  }

  return (
    <>
      {!connected ? (
        <ConnectButton />
      ) : (
        <>
          <div className="flex flex-col items-center mr-1">
            <Balance address={account?.address || ""} />
            <span className="text-xs capitalize">{targetNetwork.name}</span>
          </div>
          <AddressInfoDropdown address={account?.address || ""} blockExplorerAddressLink={blockExplorerAddressLink} />
          <AddressQRCodeModal address={account?.address?.toString() || ""} modalId="qrcode-modal" />
        </>
      )}
    </>
  );
};
