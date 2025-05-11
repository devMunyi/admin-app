// lib/url/middleware.ts
import { NextRequest } from 'next/server';
import { UrlParts, CallbackUrlOptions } from './types';

export function getMiddlewareUrlParts(request: NextRequest): UrlParts {
    return {
        pathname: request.nextUrl.pathname,
        search: request.nextUrl.search,
        hash: request.nextUrl.hash,
        origin: request.nextUrl.origin
    };
}

export function getMiddlewareCallbackUrl(request: NextRequest, options?: CallbackUrlOptions): string {
    const { pathname, search, hash, origin } = getMiddlewareUrlParts(request);
    let url = `${pathname}${search}${hash}`;

    if (options?.includeOrigin) {
        url = `${origin}${url}`;
    }

    return options?.encode !== false ? encodeURIComponent(url) : url;
}