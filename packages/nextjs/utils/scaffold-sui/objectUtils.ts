// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { type ObjectOwner, type SuiObjectResponse } from '@mysten/sui/client';

import { findIPFSvalue } from './stringUtils';

export function parseImageURL(display?: Record<string, string> | null): string {
    const url = display?.image_url;
    if (url) {
        if (findIPFSvalue(url)) return url;
        // String representing true http/https URLs are valid:
        try {
            new URL(url);
            return url;
        } catch {
            //do nothing
        }
    }
    return '';
}

export function parseObjectType(data: SuiObjectResponse): string {
    if (data.data?.content?.dataType === 'package') {
        return 'Move Package';
    }
    return data.data?.type ?? data?.data?.content?.type ?? 'unknown';
}

export function getOwnerStr(owner: ObjectOwner | string): string {
    if (typeof owner === 'object') {
        if ('AddressOwner' in owner) return owner.AddressOwner;
        if ('ObjectOwner' in owner) return owner.ObjectOwner;
        if ('Shared' in owner) return 'Shared';
    }
    return owner as string;
}

export const checkIsPropertyType = (value: unknown): boolean =>
    ['number', 'string'].includes(typeof value);

export const extractName = (display?: Record<string, string> | null): string | null | undefined => {
    if (!display || !('name' in display)) return undefined;
    const name = display.name;
    if (typeof name === 'string') {
        return name;
    }
    return null;
};

export function getDisplayUrl(url?: string): { href: string; display: string } | string | null {
    if (url) {
        try {
            const parsedUrl = new URL(url);
            return {
                href: url,
                display: parsedUrl.hostname,
            };
        } catch (e) {
            // do nothing
        }
    }
    return url || null;
}
