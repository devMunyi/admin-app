// src/lib/services/api/users/requests.ts
import { AxiosError } from "axios";
import { apiClient } from "../../../apiClient";
import { EventsResponse, FindUsersApiResponse, FindUsersFilters, SignInResponse, User, UserInfo } from "../../../types";
import { CreateUserValues, EditUserValues, signInFormInferSchema } from "../../../validators/authSchema";

export async function signInRequest(
    data: signInFormInferSchema
): Promise<SignInResponse> {
    try {
        const response = await apiClient<SignInResponse>('/api/auth/signin', {
            method: 'POST',
            data, // Axios uses 'data' instead of 'body'
            skipAuthRedirect: true, // Prevent automatic redirect for sign-in attempts
        });

        // Handle successful sign-in by checking for pending requests
        const pendingRequest = sessionStorage.getItem('pendingRequest');
        if (pendingRequest) {
            const { url, method, data } = JSON.parse(pendingRequest);
            sessionStorage.removeItem('pendingRequest');
            await apiClient(url, { method, data });
        }

        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<SignInResponse>;

        // Extract error message from response
        const errorMessage = axiosError.response?.data?.error
            || axiosError.message
            || 'Sign in failed';

        throw new Error(errorMessage);
    }
}

export async function createUserRequest(data: CreateUserValues): Promise<{ message?: string }> {
    try {
        const response = await apiClient("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: data, // Axios uses 'data' instead of 'body'
        });

        return response.data;
    } catch (error) {
        // Error is already handled by apiClient, but we can add additional handling if needed
        throw error;
    }
}


export async function updateUserRequest(
    id: string,
    data: EditUserValues
): Promise<{ message: string }> { // Replace with your actual return type
    try {
        const response = await apiClient(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            data: data, // Changed from 'body' to 'data'
        });

        return response.data;
    } catch (error) {
        console.log("Update user error");
        throw error; // Error is already properly formatted by apiClient
    }
}

export async function fetchUsersRequest(
    filters: FindUsersFilters
): Promise<FindUsersApiResponse> {
    try {
        // Axios handles query parameters more elegantly
        const response = await apiClient<FindUsersApiResponse>('/api/users/findMany', {
            method: 'GET',
            params: { // Axios will automatically serialize this to URL params
                page: filters.page,
                limit: filters.rpp,
                ...(filters.branch && { branch_id: filters.branch }),
                ...(filters.role && { role: filters.role }),
                ...(filters.status && { status: filters.status }),
                ...(filters.search && { search: filters.search }),
            }
        });

        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch users");
    }
}

type fetchUserInfoResponse = {
    user: UserInfo;
}

export const fetchUserInfo = async (userId: string): Promise<UserInfo> => {
    try {
        const response = await apiClient<fetchUserInfoResponse>(`/api/users/${userId}`);

        // Access .data if your apiClient wraps responses in a data property
        console.log('User info response:', response?.data?.user);

        return response?.data?.user;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw new Error('Failed to fetch user info');
    }
};


export const fetchUserEvents = async (
    userId: string,
    type: 'by' | 'on'
): Promise<EventsResponse> => {
    try {
        const response = await apiClient<EventsResponse>(
            `/api/users/${userId}/events?type=${type}`
        );
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch events ${type} user`);
    }
};


export async function logoutRequest(): Promise<{ success: boolean }> {
    try {
        const response = await apiClient<{ success: boolean }>('/api/auth/logout', {
            method: 'POST',
            skipAuthRedirect: true, // Prevent automatic redirect since we handle it ourselves
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to logout');
    }
}
