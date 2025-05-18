// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
// import { Network, NetworkId, getNetwork } from "@mysten/sui/client";

import { defaultChains, NetworkId } from "./chains";

function getExplorerUrl(
  path: string,
  network: NetworkId,
  customExplorer?: string,
  getUrlWithDeviceId: (url: URL) => URL = url => url,
) {
  const networkConfig = defaultChains[network];
  const explorer = networkConfig?.explorer;

  const url = getUrlWithDeviceId(new URL(path, explorer));
  if (explorer) {
    url.searchParams.append("network", network);
  }

  return url.href;
}

export function getObjectUrl(
  objectID: string,
  network: NetworkId,
  customExplorer?: string,
  moduleName?: string | null,
) {
  return getExplorerUrl(`/object/${objectID}${moduleName ? `?module=${moduleName}` : ""}`, network, customExplorer);
}

export function getTransactionUrl(txDigest: string, network: NetworkId, customExplorer?: string) {
  return getExplorerUrl(`/txblock/${encodeURIComponent(txDigest)}`, network, customExplorer);
}

export function getAddressUrl(address: string, network: NetworkId, customExplorer?: string) {
  return getExplorerUrl(`/address/${address}`, network, customExplorer);
}

export function getValidatorUrl(address: string, network: NetworkId, customExplorer?: string) {
  return getExplorerUrl(`/validator/${address}`, network, customExplorer);
}
