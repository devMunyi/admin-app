// lib/url/client.ts
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CallbackUrlOptions, UrlParts } from '../types';

export function useClientUrlParts(): UrlParts {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [origin, setOrigin] = useState<string | undefined>();

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    return {
        pathname: pathname || '',
        search: searchParams.toString() ? `?${searchParams.toString()}` : '',
        hash: typeof window !== 'undefined' ? window.location.hash : '',
        origin
    };
}

export function useClientCallbackUrl(options?: CallbackUrlOptions): string {
    const { pathname, search, hash, origin } = useClientUrlParts();
    let url = `${pathname}${search}${hash}`;

    if (options?.includeOrigin && origin) {
        url = `${origin}${url}`;
    }

    return options?.encode !== false ? encodeURIComponent(url) : url;
}