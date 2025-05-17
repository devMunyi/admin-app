// lib/url/server.ts
import { headers } from 'next/headers';
import { CallbackUrlOptions, UrlParts } from '../types';

export async function getServerUrlParts(): Promise<UrlParts> {
    const headersList = await headers();
    return {
        pathname: headersList.get('x-invoke-path') || '',
        search: headersList.get('x-invoke-query') ? `?${headersList.get('x-invoke-query')}` : '',
        hash: headersList.get('x-invoke-hash') ? `#${headersList.get('x-invoke-hash')}` : '',
        origin: headersList.get('x-forwarded-host')
            ? `${headersList.get('x-forwarded-proto')}://${headersList.get('x-forwarded-host')}`
            : undefined
    };
}

export async function getServerCallbackUrl(options?: CallbackUrlOptions): Promise<string> {
    const { pathname, search, hash, origin } = await getServerUrlParts();
    let url = `${pathname}${search}${hash}`;

    if (options?.includeOrigin && origin) {
        url = `${origin}${url}`;
    }

    return options?.encode !== false ? encodeURIComponent(url) : url;
}