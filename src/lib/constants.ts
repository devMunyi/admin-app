import { bookings_status, invoices_status, notifications_type, payments_payment_method, quotes_status, rate_cards_meal_plan, rate_cards_room_category, transportation_status, transportation_type } from "@/generated/prisma/client";
import { capitalizeString } from "./utils";
import { UserRoles, UserStatuses } from "@/db/enums";
import dayjs from "dayjs";

export const APP_NAME = "TourSync";
export const CURRENCY_SYMBOL = "$";
export const DEFAULT_PAGE_SIZE = 7;


export const userRoles = ["admin", "user"] as const;
export const USER_ROLES = Object.entries(UserRoles).map(([key, value]) => ({
  label: capitalizeString(key),
  value,
}));

export const USER_STATUSES = Object.entries(UserStatuses).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
    color: {
      PENDING: "text-yellow-600 dark:text-yellow-400",
      ACTIVE: "text-green-600 dark:text-green-400",
      ARCHIVED: "text-gray-600 dark:text-gray-400",
      SUSPENDED: "text-red-600 dark:text-red-400",
    }[key],
  })
);

export const QUOTE_STATUSES = Object.entries(quotes_status).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
    color: {
      ACTIVE: "text-blue-600 dark:text-blue-400",
      CONVERTED: "text-green-600 dark:text-green-400",
      EXPIRED: "text-gray-600 dark:text-gray-400",
    }[key],
  })
);

export const BOOKING_STATUSES = Object.entries(bookings_status).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
    color: {
      PENDING: "text-yellow-600 dark:text-yellow-400",
      CONFIRMED: "text-green-600 dark:text-green-400",
      CANCELLED: "text-red-600 dark:text-red-400",
      COMPLETED: "text-blue-600 dark:text-blue-400",
    }[key],
  })
);


export const INVOICE_STATUSES = Object.entries(invoices_status).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
    color: {
      UNPAID: "text-red-600 dark:text-red-400",
      PARTIALLY_PAID: "text-yellow-600 dark:text-yellow-400",
      PAID: "text-green-600 dark:text-green-400",
      CANCELLED: "text-gray-600 dark:text-gray-400",
      REFUNDED: "text-blue-600 dark:text-blue-400",
    }[key],
  })
);

export const PAYMENT_METHODS = Object.entries(payments_payment_method).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
  })
);

export const TRANSPORT_TYPES = Object.entries(transportation_type).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
  })
);

export const TRANSPORT_STATUSES = Object.entries(transportation_status).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
    color: {
      PENDING: "text-yellow-600 dark:text-yellow-400",
      CONFIRMED: "text-green-600 dark:text-green-400",
      CANCELLED: "text-red-600 dark:text-red-400",
      COMPLETED: "text-blue-600 dark:text-blue-400",
    }[key],
  })
);

export const NOTIFICATION_TYPES = Object.entries(notifications_type).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
  })
);

export const MEAL_PLANS = Object.entries(rate_cards_meal_plan).map(([key, value]) => ({
  label: capitalizeString(key),
  value,
}));

export const ROOM_CATEGORIES = Object.entries(rate_cards_room_category).map(
  ([key, value]) => ({
    label: capitalizeString(key),
    value,
  })
);


export const PERMISSION_COLUMNS = [
  "general",
  "create",
  "read",
  "update",
  "delete",
];

export const ALLOWED_ACTIONS = [
  "general",
  "create",
  "read",
  "update",
  "delete",
  "BLOCK",
  "UNBLOCK",
  "REJECT",
  "APPROVE",
  "RESEND",
  "CANCEL",
  "SHARP_INCREMENT",
  "DISABLE_2FA",
  "ENABLE_2FA",
  "DELETE_PASSKEY",
];

export const USER_EVENTS_WITH_ONLY_STATUS_UPDATE = ["remove", "delete"]


export function nowDatetimeObject() {
  return dayjs().toDate();
}
