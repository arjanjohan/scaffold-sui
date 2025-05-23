// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useSuiClient } from '@mysten/dapp-kit';
import { PaginatedCoins } from '@mysten/sui/client';
import { useInfiniteQuery } from '@tanstack/react-query';

const MAX_COINS_PER_REQUEST = 10;

export function useGetCoins(
    coinType: string,
    address?: string | null,
    maxCoinsPerRequest = MAX_COINS_PER_REQUEST,
) {
    const client = useSuiClient();
    return useInfiniteQuery<PaginatedCoins>({
        queryKey: ['get-coins', address, coinType, maxCoinsPerRequest],
        initialPageParam: null,
        queryFn: ({ pageParam }) =>
            client.getCoins({
                owner: address!,
                coinType,
                cursor: pageParam as string | null,
                limit: maxCoinsPerRequest,
            }),
        getNextPageParam: ({ hasNextPage, nextCursor }) => (hasNextPage ? nextCursor : null),
        enabled: !!address,
    });
}
