// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import { useGetObject } from "./useGetObject";
import { useModuleAddress } from "./useModuleAddress";
import { ModuleName } from "~~/utils/scaffold-sui/module";

export function useScaffoldGetObject<TModuleName extends ModuleName>(moduleName: TModuleName) {
  const { moduleAddress } = useModuleAddress(moduleName);
  const { data, refetch } = useGetObject(moduleAddress);

  return {
    moduleAddress,
    data,
    refetch,
  };
}
