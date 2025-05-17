// lib/apiClient.ts
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

interface ApiClientConfig extends AxiosRequestConfig {
    skipAuthRedirect?: boolean; // Optional flag to prevent automatic redirect on 401
}

export async function apiClient<T = any>(
    url: string,
    config?: ApiClientConfig
): Promise<AxiosResponse<T>> {
    try {
        const response = await axios(url, {
            ...config,
            withCredentials: true,
        });
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;


        const isAxiosError = axios.isAxiosError(axiosError);
        // log status code
        if (isAxiosError) {
            console.log('Axios error status code:', axiosError.response?.status);
        } else {
            console.log('Non-Axios error:', error);
        }

        // Handle unauthorized requests
        if (axiosError.response?.status === 401 && !config?.skipAuthRedirect) {
            // Store the original request for retry after auth
            if (config?.method !== 'GET') {
                sessionStorage.setItem(
                    'pendingRequest',
                    JSON.stringify({
                        url,
                        method: config?.method,
                        data: config?.data,
                    })
                );
            }

            // Redirect to sign-in with callback URL
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/signin?callbackUrl=${callbackUrl}`;
            throw new Error('Session expired. Redirecting to login...');
        }

        // Handle other errors
        let errorMessage = 'Request failed';
        const responseData = axiosError.response?.data as Record<string, any>;

        if (responseData) {
            errorMessage =
                responseData.message ||
                responseData.error ||
                axiosError.response?.statusText ||
                errorMessage;
        }

        throw new Error(errorMessage);
    }
}


export async function customFetch<T = any>(
    url: string,
    config?: {
        skipAuthRedirect?: boolean;
        method?: string;
        headers?: Record<string, string>;
        body?: any;
        params?: Record<string, any>;
    }
): Promise<T> {
    try {
        // Convert params to query string if they exist
        const queryString = config?.params
            ? `?${new URLSearchParams(config.params).toString()}`
            : '';

        const fullUrl = url + queryString;

        const headers = {
            'Content-Type': 'application/json',
            ...config?.headers,
        };

        const response = await fetch(fullUrl, {
            method: config?.method || 'GET',
            headers,
            credentials: 'include',
            body: config?.body ? JSON.stringify(config.body) : undefined,
        });

        if (response.status === 401 && !config?.skipAuthRedirect) {
            // Store the original request for retry after auth
            if (config?.method !== 'GET') {
                sessionStorage.setItem(
                    'pendingRequest',
                    JSON.stringify({
                        url,
                        method: config?.method,
                        body: config?.body,
                    })
                );
            }

            // Redirect to sign-in with callback URL
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/signin?callbackUrl=${callbackUrl}`;
            throw new Error('Session expired. Redirecting to login...');
        }

        if (!response.ok) {
            let errorMessage = `HTTP error! Status: ${response.status} ${response.statusText}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // If response isn't JSON, keep the original message
            }

            throw new Error(errorMessage);
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}