// SPDX-License-Identifier: Apache-2.0

import { useIotaClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';

const MAX_COINS_PER_REQUEST = 10;

export function useGetCoinBalance(
    coinType: string,
    address?: string | null,
    maxCoinsPerRequest = MAX_COINS_PER_REQUEST,
) {
    const client = useIotaClient();
    const query = useQuery({
        queryKey: ['get-coins', address, coinType],
        queryFn: async () => {
            const result = await client.getCoins({
                owner: address!,
                coinType,
                limit: maxCoinsPerRequest,
            });
            // Sum up all coin balances
            return result.data.reduce((total, coin) => total + BigInt(coin.balance), BigInt(0));
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
