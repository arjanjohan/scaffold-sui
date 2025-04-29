import { useRef, useState } from "react";
import { useDisconnectWallet } from "@iota/dapp-kit";
import { getFaucetHost, requestIotaFromFaucetV0 } from "@iota/iota-sdk/faucet";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  ArrowLeftEndOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-iota";
import { useOutsideClick } from "~~/hooks/scaffold-iota";
import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-iota/notification";

type AddressInfoDropdownProps = {
  address: string;
  blockExplorerAddressLink: string | undefined;
};

export const AddressInfoDropdown = ({ address, blockExplorerAddressLink }: AddressInfoDropdownProps) => {
  const [addressCopied, setAddressCopied] = useState(false);
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  const { mutate: disconnect } = useDisconnectWallet();
  const { targetNetwork, setTargetNetwork } = useGlobalState();

  const handleFaucetRequest = async () => {
    const notificationId = notification.loading("Requesting tokens from faucet...");
    try {
      setIsFaucetLoading(true);
      await requestIotaFromFaucetV0({
        host: getFaucetHost(targetNetwork.id),
        recipient: address,
      });
      notification.remove(notificationId);
      notification.success("Successfully requested tokens from faucet!");
    } catch (error) {
      console.error("Faucet request failed:", error);
      notification.remove(notificationId);
      notification.error("Failed to request tokens from faucet. Please try again.");
    } finally {
      setIsFaucetLoading(false);
    }
  };

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary tabIndex={0} className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 !h-auto">
          <BlockieAvatar address={address} size={30} />
          <span className="ml-2 mr-1">{address?.slice(0, 6) + "..." + address?.slice(-4)}</span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </summary>
        <ul
          tabIndex={0}
          className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
        >
          <li className={selectingNetwork ? "hidden" : ""}>
            {addressCopied ? (
              <div className="btn-sm !rounded-xl flex gap-3 py-3">
                <CheckCircleIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
                <span className=" whitespace-nowrap">Copy address</span>
              </div>
            ) : (
              <CopyToClipboard
                text={address}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 800);
                }}
              >
                <div className="btn-sm !rounded-xl flex gap-3 py-3">
                  <DocumentDuplicateIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                  <span className=" whitespace-nowrap">Copy address</span>
                </div>
              </CopyToClipboard>
            )}
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label htmlFor="qrcode-modal" className="btn-sm !rounded-xl flex gap-3 py-3">
              <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">View QR Code</span>
            </label>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button className="menu-item btn-sm !rounded-xl flex gap-3 py-3" type="button">
              <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <a
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
                className="whitespace-nowrap"
              >
                View on Block Explorer
              </a>
            </button>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={() => setSelectingNetwork(true)}
            >
              <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
            </button>
          </li>
          <li className={!selectingNetwork ? "hidden" : "menu-title pt-2"}>
            <span className="text-sm font-normal">Select Network</span>
          </li>
          {selectingNetwork &&
            scaffoldConfig.targetNetworks.map(network => (
              <li key={network.id} className="!p-0">
                <button
                  className={`btn-sm !rounded-xl flex gap-3 py-3 ${
                    targetNetwork.id === network.id ? "bg-secondary" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    setTargetNetwork(network);
                    setSelectingNetwork(false);
                  }}
                >
                  <span className="whitespace-nowrap capitalize">{network.name}</span>
                </button>
              </li>
            ))}
          <li className={selectingNetwork || !targetNetwork.faucet ? "hidden" : ""}>
            <button
              className="btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={handleFaucetRequest}
              disabled={isFaucetLoading}
            >
              <BanknotesIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">{isFaucetLoading ? "Requesting..." : "Request Tokens"}</span>
            </button>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftEndOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
