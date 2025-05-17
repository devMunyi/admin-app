"use client";
import { ArrowLeftIcon, ClockIcon, InfoIcon, PencilIcon, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TabContent } from "@/components/events/TabContent";
import { EventsTable } from "@/components/events/EventsTable";
import { UserDetailsTable } from "./UserDetailsTable";
import { TabButton } from "@/components/events/TabButton";
import { capitalizeString } from "@/lib/utils";
import Button from "@/components/temp-ui/button/Button";
import EditUserModal from "../edit-user-modal";
import { getBranches } from "@/lib/actions/util.action";
import Link from "next/link";
import { EventsResponse, TabData, UserInfo } from "@/lib/types";
import { customFetch } from "@/lib/apiClient";
import { fetchUserInfo } from "@/lib/services/api/users/requests";


type UserDetailsProps = {
    userId: string;
    branches: Awaited<ReturnType<typeof getBranches>>;
}


export default function UserDetails(
    { userId, branches }: UserDetailsProps
) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>("Info");
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    const handleEditUser = (user: UserInfo) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };


    // Fetch user info

    // const fetchUserInfo = async (userId: string) => {
    //     const response = await customFetch(`/api/users/${userId}`);
    //     if (!response.ok) {
    //         throw new Error("Failed to fetch user info");
    //     }
    //     const data = await response.json();
    //     return data.data;
    // };

    const {
        data: userInfo,
        isLoading: isUserLoading,
        error: userError,
    } = useQuery<UserInfo>({
        queryKey: ["user", userId],
        queryFn: () => fetchUserInfo(userId)
    });

    // Fetch events by user
    const {
        data: eventsByUser,
        isLoading: isEventsByLoading,
        error: eventsByError,
    } = useQuery<EventsResponse>({
        queryKey: ["eventsBy", userId],
        queryFn: async () => {
            const response = await customFetch(`/api/users/${userId}/events?type=by`);
            if (!response.ok) {
                throw new Error("Failed to fetch events by user");
            }
            return response.json();
        },
        enabled: activeTab === "Events By",
    });

    // Fetch events on user
    const {
        data: eventsOnUser,
        isLoading: isEventsOnLoading,
        error: eventsOnError,
    } = useQuery<EventsResponse>({
        queryKey: ["eventsOn", userId],
        queryFn: async () => {
            const response = await customFetch(`/api/users/${userId}/events?type=on`);
            if (!response.ok) {
                throw new Error("Failed to fetch events on user");
            }
            return response.json();
        },
        enabled: activeTab === "Events On",
    });

    const firstName = capitalizeString(userInfo?.name?.split(" ")[0] || "");
    const tabData: TabData[] = [
        {
            id: "Info",
            label: "Info",
            icon: <InfoIcon />,
            content: (
                <>
                    {isUserLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        </div>
                    ) : userError ? (
                        <div className="p-4 text-red-500 rounded-lg bg-red-50 dark:bg-red-900/20">
                            Error loading user info: {(userError as Error).message}
                        </div>
                    ) : userInfo ? (
                        <div className="flex flex-col lg:flex-row lg:flex-nowrap justify-between items-start gap-4 lg:gap-10">
                            {/* User info table (comes first in DOM for mobile) */}
                            <div className="w-full lg:flex-1 min-w-0 overflow-x-auto">
                                <UserDetailsTable user={userInfo} />
                            </div>

                            {/* Action buttons column (stacks below on mobile) */}
                            <div className="w-full lg:w-48 lg:min-w-[12rem] flex flex-col gap-4">

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-warning-500/10 text-warning-500 hover:bg-warning-500/20"
                                    onClick={() =>
                                        userInfo &&
                                        handleEditUser({
                                            ...userInfo,
                                            created_at: new Date(userInfo.created_at),
                                        })
                                    }
                                    startIcon={<PencilIcon />}
                                >
                                    Edit User
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </>
            ),
        },
        {
            id: `Events By`,
            label: `Events By ${firstName}`,
            icon: <ClockIcon />,
            content: (
                <>
                    {eventsByError ? (
                        <div className="p-4 text-red-500 rounded-lg bg-red-50 dark:bg-red-900/20">
                            Error loading events: {(eventsByError as Error).message}
                        </div>
                    ) : (
                        <EventsTable
                            events={eventsByUser?.data || []}
                            isLoading={isEventsByLoading}
                        />
                    )}
                </>
            ),
        },
        {
            id: `Events On`,
            label: `Events On ${firstName}`,
            icon: <ClockIcon />,
            content: (
                <>
                    {eventsOnError ? (
                        <div className="p-4 text-red-500 rounded-lg bg-red-50 dark:bg-red-900/20">
                            Error loading events: {(eventsOnError as Error).message}
                        </div>
                    ) : (
                        <EventsTable
                            events={eventsOnUser?.data || []}
                            isLoading={isEventsOnLoading}
                        />
                    )}
                </>
            ),
        },
    ];

    const handlePageRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
        queryClient.invalidateQueries({ queryKey: ['eventsBy', userId] });
        queryClient.invalidateQueries({ queryKey: ['eventsOn', userId] });
        queryClient.invalidateQueries({ queryKey: ['users'] });

        // queryClient.refetchQueries({ queryKey: ['users'] });
        // queryClient.refetchQueries({ queryKey: ['user', userId] });
        // queryClient.refetchQueries({ queryKey: ['eventsBy', userId] });
        // queryClient.refetchQueries({ queryKey: ['eventsOn', userId] });
    };


    return (
        <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600 justify-around">
                    {tabData.map((tab) => (
                        <TabButton
                            key={tab.id}
                            {...tab}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </nav>
            </div>

            <div className="pt-4">
                {tabData.map((tab) => (
                    <TabContent key={tab.id} isActive={activeTab === tab.id}>
                        {tab.content}
                    </TabContent>
                ))}
            </div>

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handlePageRefresh}
                branches={branches}
                user={
                    selectedUser
                        ? {
                            id: selectedUser.id,
                            public_id: selectedUser.public_id,
                            name: selectedUser.name,
                            phone: selectedUser.phone,
                            national_id: (selectedUser as any).national_id ?? "",
                            branch: (selectedUser as any).branch,
                            email: selectedUser.email,
                            role: selectedUser.role,
                            status: selectedUser.status,
                        }
                        : null
                }
            />

            {/* Add Back link */}
            <div className="flex justify-center items-center mt-4">
                <Link
                    href="/users"
                    className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => router.push("/users")}
                >
                    <ArrowLeftIcon /> Back
                </Link>

            </div>
        </div>
    );
}