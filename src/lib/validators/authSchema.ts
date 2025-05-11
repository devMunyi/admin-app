import { users_role, users_status } from "@/generated/prisma";
import { z } from "zod";
import { isPhoneValid, makePhoneValid } from "../utils";

// Runtime schema for validating the login form
export const signInFormSchema = z.object({
  email: z.string().trim().email({
    message: "Invalid email address",
  }),
  password: z.string().trim().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

// TypeScript type inferred from the login schema
export type signInFormInferSchema = z.infer<typeof signInFormSchema>;

// Runtime schema for validating the register form
export const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().trim().email({
      message: "Invalid email address.",
    }),

    role: z.enum(Object.values(users_role) as [string, ...string[]]),
    password: z
      .string()
      .trim()
      .min(6, {
        message: "Password must be at least 6 characters.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// TypeScript type inferred from the register schema
export type RegisterFormInferSchema = z.infer<typeof registerFormSchema>;

// Zod schema for form validation
const baseUserSchema = z.object({
  name: z.string().trim().min(1, "Full Name is required").refine(val => !/\s{2,}/.test(val), {
    message: 'Incorrect name spacing',
  }),
  phone: z.string().trim().refine(
    (value) => isPhoneValid(makePhoneValid(value, 'client'), 'client') === true,
    {
      message: "Provide a valid phone number"
    }
  ),
  national_id: z.string().trim().min(1, "National ID is required"),
  email: z.string().trim().email("Invalid email address"),
  role: z.nativeEnum(users_role, { errorMap: () => ({ message: "Invalid role" }) }),
  branch_id: z.coerce.number().min(1, "Branch ID is required"),
});

// Schema for creating user (password required)
export const createUserSchema = baseUserSchema.extend({
  password: z.string().trim().min(6, "Must be at least 6 characters long"),
});

// Schema for editing user (password truly optional)
export const editUserSchema = baseUserSchema.extend({
  status: z.nativeEnum(users_status, { errorMap: () => ({ message: "Invalid status" }) }),
  password: z.union([
    z.string().trim().min(6, "Must be at least 6 characters long"),
    z.literal(''),  // Allow empty string
  ]).optional().transform(e => e === '' ? undefined : e),

});

// Type definitions
export type CreateUserValues = z.infer<typeof createUserSchema>;
export type EditUserValues = z.infer<typeof editUserSchema>;
export type SeedUserData = Omit<CreateUserValues, "confirmPassword"> & {
  role: users_role;
};

