import { users, users_role, users_status } from "@/generated/prisma/client";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getBranches } from "../actions/util.action";

export type SafeUser = Omit<
  users,
  "created_at" | "updated_at" | "email_verified" | "password" | "salt"
> & {
  created_at: string;
  updated_at: string;
  email_verified: string | null;
};

export type PaginatedResponse = {
  data: SafeUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};


export type StoreChangeLogParams = {
  action: string;
  primaryAffectedEntity: string;
  primaryAffectedEntityID: number;
  primaryOrSecAffectedTable: string;
  primaryOrSecAffectedEntityID: number;
  originalData: Record<string, unknown>;
  newData: Record<string, unknown>;
  skipFields: string[];
  loggedInUser: SafeUser;
  otherDetails?: string;
}

export interface ModifiedFields {
  [key: string]: { old: unknown, new: unknown };
}

export type FormattedDate = {
  dateOnly: string;
  relative: string;
  datetimeFormat: string;
  formattedWithTZ: string;
  timeOnly: string;
  isoString: string;
  eatString: string;
}

// Extend dayjs with required plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);


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
  created_at: Date;
  password_expiry: Date | null;
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


export type SignInResponse = {
  success: boolean;
  user: UserInfo;
  error?: never;
} | {
  success?: never;
  user?: never;
  error: string;
};

// lib/url/types.ts
export type UrlParts = {
  pathname: string;
  search: string;
  hash: string;
  origin?: string;
};

export type CallbackUrlOptions = {
  includeOrigin?: boolean;
  encode?: boolean;
};


export type Branch = {
  id: number;
  name: string;
}

export type User = {
  role: users_role;
  status: users_status;
  phone: string;
  national_id: string;
  branch: Branch;
  name: string;
  id: number;
  public_id: string;
  email: string;
  image: string | null;
  created_at: Date;
}


export type UsersTableProps = {
  users: User[];
  onSucess?: () => void;
  branches: Awaited<ReturnType<typeof getBranches>>;
}

export type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branches: { id: number; name: string }[];
  user: {
    id: number;
    public_id: string;
    name: string;
    phone: string;
    national_id: string;
    branch: Branch;
    email: string;
    role: users_role;
    status: users_status;
  } | null;
}

export type FindUsersFilters = {
  page: number;
  rpp: number;
  branch?: string;
  role?: string;
  status?: string;
  search?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type FindUsersApiResponse = {
  data: User[];
  pagination: Pagination;
};


export type UsersClientPageProps = {
  initialBranches: Awaited<ReturnType<typeof getBranches>>;
}
