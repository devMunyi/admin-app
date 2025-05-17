// src/lib/services/users/mutation.ts
import { useMutation } from "@tanstack/react-query";
import { SignInResponse, UserInfo } from "../../../types";
import { EditUserValues, signInFormInferSchema } from "../../../validators/authSchema";
import { createUserRequest, logoutRequest, signInRequest, updateUserRequest } from "./requests";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../stores/useUserStore";
import { useSignedInRedirctUrl } from "@/hooks/useCallbackUrl";
import { useCurrentUrl } from "@/hooks/useCurrentUrl";

export function useSignInMutation() {
    const router = useRouter();
    const login = useUserStore((state) => state.login);
    const signedInRedirectUrl = useSignedInRedirctUrl();

    return useMutation<SignInResponse, Error, signInFormInferSchema>({
        mutationFn: signInRequest,
        onSuccess: (data) => {

            console.log({ data });

            if (data.success && data.user) {
                login(data.user as UserInfo);
                toast.success("Success! Please wait...");
                setTimeout(() => {
                    router.push(signedInRedirectUrl);
                }, 1000);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong");
        }
    });
}


type UseCreateUserMutationOptions = {
    onSuccess?: () => void;
    onClose: () => void;
    resetForm: () => void;
}

export function useCreateUserMutation({ onSuccess, onClose, resetForm }: UseCreateUserMutationOptions) {
    const router = useRouter();
    const callbackUrl = useCurrentUrl();

    return useMutation({
        mutationFn: createUserRequest,
        onSuccess: () => {
            toast.success("User created successfully!");
            onSuccess?.();
            onClose();
            resetForm();
        },
        onError: (error: any) => {

            console.log({ updateUserError: error });

            const message = (error as { message?: string })?.message || "Something went wrong";
            if (message.toLowerCase() === "session expired") {
                router.push(`/signin?callbackUrl=${callbackUrl}`);
            }
            toast.error(message);
        },
    });
}


type UseUpdateUserMutationOptions = {
    userId: string;
    onSuccess?: () => void;
    onClose: () => void;
    resetForm: () => void;
}

export function useUpdateUserMutation({ userId, onSuccess, onClose, resetForm }: UseUpdateUserMutationOptions) {
    const router = useRouter();
    const callbackUrl = useCurrentUrl();

    return useMutation({
        mutationFn: (data: EditUserValues) => updateUserRequest(userId, data),
        onSuccess: () => {
            toast.success("User updated successfully!");
            onSuccess?.();
            onClose();
            resetForm();
        },
        onError: (error: any) => {

            console.log("useUpdateUserMutation error", error);

            const message = error?.message || "Something went wrong";
            if (message.toLowerCase() === "session expired") {
                router.push(`/signin?callbackUrl=${callbackUrl}`);
            }
            toast.error(message);
        },
    });
}

export function useLogoutMutation() {
    const router = useRouter();
    const clearUser = useUserStore((state) => state.logout);
    const currentUrl = useCurrentUrl();

    return useMutation({
        mutationFn: logoutRequest,
        onSuccess: () => {
            // Clear client-side state
            clearUser();

            // Show success feedback
            toast.success("Logged out successfully");

            // Redirect options (choose one):

            // Option 1: Hard refresh (recommended for complete state reset)
            window.location.href = `/signin?callbackUrl=${encodeURIComponent(currentUrl)}`;

            // Option 2: Soft redirect (if you prefer no page reload)
            // router.push(`/signin?callbackUrl=${encodeURIComponent(currentUrl)}`);
            // router.refresh();
        },
        onError: (error: Error) => {
            // Handle specific error cases if needed
            if (error.message.includes('Session expired')) {
                // Already handled by apiClient
                return;
            }
            toast.error(error.message || "Failed to logout");
        }
    });
}