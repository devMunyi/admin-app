// lib/url/types.ts
export type UrlParts = {
    pathname: string;
    search: string;
    hash: string;
    origin?: string;
};

export type CallbackUrlOptions = {
    includeOrigin?: boolean;
    encode?: boolean;
};