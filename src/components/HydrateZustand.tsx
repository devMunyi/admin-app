'use client';

import { useUserStore } from '@/lib/stores/useUserStore';
import { useEffect } from 'react';

export default function HydrateZustand() {
    const hydrate = useUserStore((state) => state.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return null;
}