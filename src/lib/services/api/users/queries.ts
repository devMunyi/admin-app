// src/lib/services/users/queries.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EventsResponse, FindUsersApiResponse, FindUsersFilters, UserInfo } from "../../../types";
import { fetchUserEvents, fetchUserInfo, fetchUsersRequest } from "./requests";

export function useUsersQuery(filters: FindUsersFilters) {
    const queryClient = useQueryClient();

    return useQuery<FindUsersApiResponse>({
        queryKey: ['users', filters],
        queryFn: () => fetchUsersRequest(filters),
        placeholderData: () => queryClient.getQueryData<FindUsersApiResponse>(['users', filters]),
        staleTime: 60 * 1000 // 1 minute
    });
}


export const useUserInfoQuery = (userId: string) => {
    return useQuery<UserInfo>({
        queryKey: ["user", userId],
        queryFn: () => fetchUserInfo(userId),
    });
};

export const useUserEventsQuery = (
    userId: string,
    type: 'by' | 'on',
    enabled: boolean
) => {
    return useQuery<EventsResponse>({
        queryKey: [`events${type === 'by' ? 'By' : 'On'}`, userId],
        queryFn: () => fetchUserEvents(userId, type),
        enabled,
    });
};