// Copyright (c) 2025 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useIotaClientQuery } from '@mysten/dapp-kit';
import { filterAndSortTokenBalances } from '~~/utils/scaffold-sui/filterAndSortTokenBalances';
import { useCoinsReFetchingConfig } from './';

export function useGetAllBalances(address: string | null | undefined) {
    const { staleTime, refetchInterval } = useCoinsReFetchingConfig();

    return useIotaClientQuery(
        'getAllBalances',
        { owner: address! },
        {
            enabled: !!address,
            refetchInterval,
            staleTime,
            select: filterAndSortTokenBalances,
        },
    );
}
