"use client";

import { getNetwork } from "@iota/iota-sdk/client";
import { Balance } from "../../scaffold-move/Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { ConnectButton, useCurrentAccount } from "@iota/dapp-kit";
import { getAddressUrl } from "~~/utils/scaffold-iota";

export const CustomConnectButton = () => {
  const networkConfig = getNetwork("testnet");

  const account = useCurrentAccount();
  const connected = account !== null;

  const blockExplorerAddressLink = account
    ? getAddressUrl(account?.address, "testnet", "")
    : undefined;

  return (
    <>
      {!connected ? (
        <ConnectButton />

      ) : (
        <>
          <div className="flex flex-col items-center mr-1">
            <Balance address={account?.address || ""} />
            <span className="text-xs">{networkConfig.name}</span>
          </div>
          <AddressInfoDropdown
            address={account?.address || ""}
            blockExplorerAddressLink={blockExplorerAddressLink}
          />
          <AddressQRCodeModal address={account?.address?.toString() || ""} modalId="qrcode-modal" />
        </>
      )}
    </>
  );
};
