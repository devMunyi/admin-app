import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import prisma from "./prisma"
import { ModifiedFields, SafeUser, StoreChangeLogParams } from "./types"
import { nowDatetimeObject, USER_EVENTS_WITH_ONLY_STATUS_UPDATE } from "./constants"
import { shared_status } from "@/generated/prisma"
import { createHash } from "crypto"
import { EnvType } from "./data/env/type"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}

export function capitalizeString(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function generateRandomString(
  length: number,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSpecialChars?: boolean;
  } = {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecialChars: true,
    }
): string {
  // Validate input
  if (length <= 0) {
    throw new Error("Length must be greater than 0");
  }

  // Define character sets
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Build the character pool based on options
  let characterPool = "";
  if (options.includeUppercase) characterPool += uppercaseChars;
  if (options.includeLowercase) characterPool += lowercaseChars;
  if (options.includeNumbers) characterPool += numberChars;
  if (options.includeSpecialChars) characterPool += specialChars;

  // Check at least one character set is included
  if (characterPool.length === 0) {
    throw new Error("At least one character type must be included");
  }

  // Generate the random string
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characterPool.length);
    result += characterPool[randomIndex];
  }

  return result;
}

export function getInitials(name?: string) {
  if (!name) return "CN";
  const parts = name.trim().split(/\s+/); // Split by spaces (handles multiple spaces)
  const firstInitial = parts[0]?.charAt(0).toUpperCase() || "";
  const secondInitial = parts[1]?.charAt(0).toUpperCase() || "";
  return firstInitial + secondInitial || "CN";
}

export function fullNameAsKeyValue(fullName: string) {
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");
  return { firstName, lastName };
}

export function getTodayDate() {
  return dayjs().format("YYYY-MM-DD");
}

export function getTodayDateTime() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
}

function identifyModifiedFields(
  original: { [key: string]: unknown },
  updated: { [key: string]: unknown },
  skipFields: string[]
): ModifiedFields {
  const modifiedFields: ModifiedFields = {};
  const skipMap = new Set(skipFields);

  for (const fieldName in original) {
    if (skipMap.has(fieldName)) {
      continue;
    }

    if (!Object.is(original[fieldName], updated[fieldName])) {

      if (original[fieldName] === undefined || original[fieldName] === undefined) {
        continue;
      }

      modifiedFields[fieldName] = {
        old: original[fieldName],
        new: updated[fieldName],
      };
    }
  }

  return modifiedFields;
}

function generateEventDetails(
  action: string,
  primaryAffectedEntity: string,
  modifiedFields: { [key: string]: { old: unknown; new: unknown } },
  user: SafeUser,
  otherDetails: string = ""
): string {
  const username = user.name ?? user.name ?? "";
  if (action === "update" && Object.keys(modifiedFields).length > 0) {
    const logMessages = Object.entries(modifiedFields).map(
      ([fieldName, values]) => {
        const { old, new: newVal } = values;
        return `${fieldName} from ${old} to ${newVal}`;
      }
    );

    return `${primaryAffectedEntity} ${action}d by [${username}(${user.email
      })]. Changes: ${logMessages.join(", ")}. ${otherDetails}`;
  } else if (USER_EVENTS_WITH_ONLY_STATUS_UPDATE.includes(action)) {
    return `${primaryAffectedEntity} ${action}d by [${username}(${user.email})]. ${otherDetails}`;
  }

  return `${primaryAffectedEntity} ${action} triggered by [${username}(${user.email})].${otherDetails?.trim()?.length
    ? ` ${otherDetails.trim()}`
    : ' No values were modified'
    }`;
}

export async function storeChangeLog({
  action,
  primaryAffectedEntity,
  primaryOrSecAffectedTable,
  primaryOrSecAffectedEntityID,
  originalData,
  newData,
  skipFields,
  loggedInUser,
  otherDetails = ""
}: StoreChangeLogParams): Promise<void> {
  const modifiedFields = identifyModifiedFields(
    originalData,
    newData,
    skipFields
  );
  const eventDetails = generateEventDetails(
    action,
    primaryAffectedEntity,
    modifiedFields,
    loggedInUser,
    otherDetails
  );

  await storeEvent(
    primaryOrSecAffectedTable,
    primaryOrSecAffectedEntityID,
    eventDetails,
    loggedInUser.id
  );
  return;
};

export const storeEvent = async (
  tbl: string,
  fld: number,
  event_details: string,
  event_by = 0,
  status = shared_status.ACTIVE
): Promise<void> => {

  await prisma.events_log.create({
    data: {
      tbl,
      fld,
      details: event_details,
      event_by,
      event_date: nowDatetimeObject(),
      status
    }
  })

  return;
};

export function hash256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export const castToIntegerNum = (
  value: unknown,
  defaultNum: number = 0
): number => {
  if (typeof value === "object" || Array.isArray(value)) {
    return defaultNum;
  }
  const parsedValue = parseInt(String(value), 10);
  return isNaN(parsedValue) ? defaultNum : parsedValue;
};

export const castToDecimalNum = (
  value: unknown,
  defaultNum: number = 0,
  decimals: number = 2
): number => {
  if (typeof value === "object" || Array.isArray(value)) {
    return defaultNum;
  }

  const parsedValue = parseFloat(String(value));
  return isNaN(parsedValue)
    ? defaultNum
    : parseFloat(parsedValue.toFixed(decimals));
};
export const castToString = (value: unknown, defaultStr: string = ""): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value == null) {
    return defaultStr; // Handle null and undefined explicitly
  }

  return String(value); // Convert numbers, objects, etc., to string
};

const getCountryCode = (envType: EnvType): string => {
  if (typeof window !== 'undefined' && envType === 'client') {
    return process.env.NEXT_PUBLIC_COUNTRY_CODE || '254'; // Default to Kenya if not set
  }
  return process.env.COUNTRY_CODE || '254'; // Server-side fallback
};

export const isPhoneValid = (phone: string, envType: EnvType): boolean => {
  const countryCode = getCountryCode(envType);

  // Check if the phone contains only digits
  const digitOnlyRegex = /^\d+$/;
  if (!digitOnlyRegex.test(phone)) {
    return false;
  }

  return phone.length === 12 && phone.startsWith(countryCode);
};

export const makePhoneValid = (phone: string, envType: EnvType = "server"): string => {
  const countryCode = getCountryCode(envType);
  let normalizedPhone = phone.trim().replace(/\s+/g, "").replace(/\+/g, "");

  // Already in correct format
  if (normalizedPhone.length === 12 && normalizedPhone.startsWith(countryCode)) {
    return normalizedPhone;
  }

  // Handle numbers starting with 0
  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = countryCode + normalizedPhone.slice(1);
    return normalizedPhone;
  }

  // Handle numbers without country code
  return countryCode + normalizedPhone;
};


export function getPositiveIntParam(params: URLSearchParams, key: string): number | undefined {
  const param = params.get(key);
  const num = param ? parseInt(param) : NaN;
  return num > 0 ? num : undefined;
}