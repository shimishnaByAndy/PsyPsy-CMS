/**
 * Authentication Validation Schemas
 * Zod schemas for authentication forms with i18n message keys
 */

import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .min(1, { message: "auth.validation.username.required" })
    .min(3, { message: "auth.validation.username.minLength" })
    .max(50, { message: "auth.validation.username.maxLength" }),
  password: z.string()
    .min(1, { message: "auth.validation.password.required" })
    .min(6, { message: "auth.validation.password.minLength" }),
  rememberMe: z.boolean().default(false),
});

export const registrationSchema = z.object({
  username: z.string()
    .min(3, { message: "auth.validation.username.minLength" })
    .max(50, { message: "auth.validation.username.maxLength" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "auth.validation.username.format" }),
  email: z.string()
    .email({ message: "auth.validation.email.format" })
    .max(100, { message: "auth.validation.email.maxLength" }),
  password: z.string()
    .min(6, { message: "auth.validation.password.minLength" })
    .max(50, { message: "auth.validation.password.maxLength" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "auth.validation.password.strength" }),
  confirmPassword: z.string(),
  userType: z.enum([1, 2], { message: "auth.validation.userType.required" }), // 1: Professional, 2: Client
}).refine((data) => data.password === data.confirmPassword, {
  message: "auth.validation.password.mismatch",
  path: ["confirmPassword"],
});

export const passwordResetSchema = z.object({
  email: z.string()
    .email({ message: "auth.validation.email.format" })
    .max(100, { message: "auth.validation.email.maxLength" }),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, { message: "auth.validation.currentPassword.required" }),
  newPassword: z.string()
    .min(6, { message: "auth.validation.password.minLength" })
    .max(50, { message: "auth.validation.password.maxLength" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "auth.validation.password.strength" }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "auth.validation.password.mismatch",
  path: ["confirmNewPassword"],
});