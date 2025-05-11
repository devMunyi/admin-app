import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useSignedInRedirctUrl(defaultUrl: string = "/") {
    const searchParams = useSearchParams();

    const callbackUrl = useMemo(() => {
        const url = searchParams?.get("callbackUrl");
        return !url || url === "/signin" ? defaultUrl : url;
    }, [searchParams, defaultUrl]);

    return callbackUrl;
}