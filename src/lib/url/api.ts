// lib/url/api.ts
import { NextApiRequest } from 'next';
import { UrlParts, CallbackUrlOptions } from './types';

export function getApiUrlParts(req: NextApiRequest): UrlParts {
    return {
        pathname: req.url?.split('?')[0] || '',
        search: req.url?.includes('?') ? `?${req.url?.split('?')[1]}` : '',
        hash: '', // API routes typically don't have hashes
        origin: req.headers.origin || req.headers.host
            ? `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
            : undefined
    };
}

export function getApiCallbackUrl(req: NextApiRequest, options?: CallbackUrlOptions): string {
    const referer = req.headers.referer;

    if (referer && options?.includeOrigin) {
        return options?.encode !== false ? encodeURIComponent(referer) : referer;
    }

    const { pathname, search, origin } = getApiUrlParts(req);
    let url = `${pathname}${search}`;

    if (options?.includeOrigin && origin) {
        url = `${origin}${url}`;
    }

    return options?.encode !== false ? encodeURIComponent(url) : url;
}