import { isPhoneValid, makePhoneValid } from "@/lib/utils";

export const usePhoneUtils = () => {
  const validatePhone = (phone: string) => isPhoneValid(phone, 'client');
  const normalizePhone = (phone: string) => makePhoneValid(phone, 'client');

  return {
    isPhoneValid: validatePhone,
    makePhoneValid: normalizePhone,
    countryCode: process.env.NEXT_PUBLIC_COUNTRY_CODE || '254'
  };
};