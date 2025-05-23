// Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { type CoinBalance } from '@mysten/sui/client';
import { getCoinSymbol } from '~~/hooks/scaffold-sui';

/**
 * Filter and sort token balances by symbol and total balance.
 * Sui tokens are always sorted first.
 * @param tokens The token balances to filter and sort.
 * @returns The filtered and sorted token balances.
 */
export function filterAndSortTokenBalances(tokens: CoinBalance[]) {
    return tokens
        .filter((token) => Number(token.totalBalance) > 0)
        .sort((a, b) =>
            (getCoinSymbol(a.coinType) + Number(a.totalBalance)).localeCompare(
                getCoinSymbol(b.coinType) + Number(b.totalBalance),
            ),
        );
}
