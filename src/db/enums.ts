export const UserRoles = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    AGENT: 'AGENT',
    ACCOUNTANT: 'ACCOUNTANT',
} as const;

export type UserRole = keyof typeof UserRoles;

export const UserStatuses = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
    SUSPENDED: 'SUSPENDED',
}

export type UserStatus = keyof typeof UserStatuses;