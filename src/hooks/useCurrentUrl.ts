import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useCurrentUrl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const url = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  return url;
}
