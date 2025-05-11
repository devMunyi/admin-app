import { users } from "@/generated/prisma/client";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export type SafeUser = Omit<
  users,
  "createdAt" | "updatedAt" | "emailVerified" | "password" | "salt"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
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
