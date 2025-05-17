// app/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, useState } from "react";
import Loading from "../loading";
import { AxiosError } from 'axios'; // Import AxiosError type

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              console.log({ failureCount, error });

              let status: number | undefined;

              if (error instanceof AxiosError && error.response) {
                status = error.response.status;
              }

              const nonRetryableStatusCodes = [400, 401, 403, 404];

              if (status && nonRetryableStatusCodes.includes(status)) {
                console.log("Not retrying due to status code:", status);
                return false;
              } else {
                console.log("Retrying due to status code:", status);
              }

              // Handle network errors (no response received) - Axios errors will usually have a response object even for network issues
              const isNetworkError = error instanceof AxiosError && !error.response;

              return isNetworkError && failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}