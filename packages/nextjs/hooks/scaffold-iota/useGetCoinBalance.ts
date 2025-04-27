// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useIotaClient } from '@iota/dapp-kit';
import { useQuery } from '@tanstack/react-query';

export function useGetCoinBalance(
    coinType: string,
    address?: string | null,
) {
    const client = useIotaClient();
    const query = useQuery({
        queryKey: ['get-coins', address, coinType],
        queryFn: async () => {
            const result = await client.getCoins({
                owner: address!,
                coinType,
                limit: 1, // We only need the first coin
            });
            const firstCoin = result.data[0];
            return firstCoin ? BigInt(firstCoin.balance) : BigInt(0);
        },
        enabled: !!address,
    });

    return {
        balance: query.data ?? BigInt(0),
        isLoading: query.isLoading,
        error: query.error,
        isError: query.isError
    };
}
