import { users_role, users_status } from "@/generated/prisma";

export type UserEvent = {
    id: number;
    details: string;
    event_date: string;
}

export type TabContentProps = {
    children: React.ReactNode;
    isActive: boolean;
}


export type UserInfo = {
    id: number;
    public_id: string;
    name: string;
    email: string;
    phone: string;
    national_id: string;
    branch: {
        id: number;
        name: string;
    }
    image: string | null;
    role: users_role;
    status: users_status;
    created_at: string;
}

export type EventsResponse = {
    data: UserEvent[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type TabData = {
    id: string;
    label: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

export interface TabButtonProps extends TabData {
    isActive: boolean;
    onClick: () => void;
}
