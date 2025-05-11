// lib/url/index.ts
import { getServerCallbackUrl } from './server';
import { getApiCallbackUrl } from './api';
import { getMiddlewareCallbackUrl } from './middleware';
import { CallbackUrlOptions } from './types';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';

type Environment = 'server' | 'client' | 'api' | 'middleware';

export async function getCallbackUrl(
    environment: Environment,
    context?: unknown, // Request object or nothing for client
    options?: CallbackUrlOptions
): Promise<string> {
    switch (environment) {
        case 'server':
            return getServerCallbackUrl(options);
        case 'api':
            return getApiCallbackUrl(context as NextApiRequest, options);
        case 'middleware':
            return getMiddlewareCallbackUrl(context as NextRequest, options);
        case 'client':
        default:
            // Client components should use the hook directly
            throw new Error('For client components, use useClientCallbackUrl hook');
    }
}