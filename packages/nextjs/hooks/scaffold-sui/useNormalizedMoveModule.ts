// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useSuiClient } from '@mysten/dapp-kit';
import { type SuiMoveNormalizedModule } from '@mysten/sui/src/client';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export function useNormalizedMoveModule(
    packageId?: string | null,
    moduleName?: string | null,
): UseQueryResult<SuiMoveNormalizedModule, Error> {
    const client = useSuiClient();
    return useQuery<SuiMoveNormalizedModule, Error>({
        queryKey: ['normalized-module', packageId, moduleName],
        queryFn: async () =>
            await client.getNormalizedMoveModule({
                package: packageId!,
                module: moduleName!,
            }),
        enabled: !!(packageId && moduleName),
    });
}
