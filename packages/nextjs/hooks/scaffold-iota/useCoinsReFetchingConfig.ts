// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { useFeatureValue } from '@growthbook/growthbook-react';
import { Feature } from '~~/enums';
import { COINS_QUERY_REFETCH_INTERVAL, COINS_QUERY_STALE_TIME } from '~~/constants';

export function useCoinsReFetchingConfig() {
    const refetchInterval = useFeatureValue(
        Feature.WalletBalanceRefetchInterval,
        COINS_QUERY_REFETCH_INTERVAL,
    );
    return {
        refetchInterval,
        staleTime: COINS_QUERY_STALE_TIME,
    };
}
