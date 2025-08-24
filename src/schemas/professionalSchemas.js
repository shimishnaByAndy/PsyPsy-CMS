/**
 * Professional Validation Schemas
 * Zod schemas for professional registration and profile forms
 */

import { z } from 'zod';
import { registrationSchema } from './authSchemas';

export const professionalProfileSchema = z.object({
  firstName: z.string()
    .min(1, { message: "professional.validation.firstName.required" })
    .max(50, { message: "professional.validation.firstName.maxLength" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "professional.validation.firstName.format" }),
  lastName: z.string()
    .min(1, { message: "professional.validation.lastName.required" })
    .max(50, { message: "professional.validation.lastName.maxLength" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "professional.validation.lastName.format" }),
  profType: z.enum(['Psychologist', 'Therapist', 'Counselor', 'Psychiatrist'], {
    message: "professional.validation.profType.required"
  }),
  businessName: z.string()
    .max(100, { message: "professional.validation.businessName.maxLength" })
    .optional()
    .or(z.literal('')),
  licenseNumber: z.string()
    .regex(/^[A-Z0-9]{6,15}$/, { message: "professional.validation.licenseNumber.format" })
    .optional()
    .or(z.literal('')),
  bussEmail: z.string()
    .email({ message: "professional.validation.businessEmail.format" }),
  bussPhoneNb: z.string()
    .regex(/^\+1[0-9]{10}$/, { message: "professional.validation.phone.format" }),
  servOfferedArr: z.array(z.string()).min(1, { message: "professional.validation.services.required" }),
  offeredLangArr: z.array(z.string()).min(1, { message: "professional.validation.languages.required" }),
  meetType: z.enum(['online', 'in-person', 'both'], {
    message: "professional.validation.meetingType.required"
  }),
  expertises: z.array(z.string()).min(1, { message: "professional.validation.expertises.required" }),
  dob: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "professional.validation.dateOfBirth.format" }),
  gender: z.enum([1, 2, 3, 4], { message: "professional.validation.gender.required" }), // 1: Woman, 2: Man, 3: Other, 4: Prefer not to say
  addressObj: z.object({
    street: z.string().min(1, { message: "professional.validation.address.street.required" }),
    city: z.string().min(1, { message: "professional.validation.address.city.required" }),
    province: z.string().min(1, { message: "professional.validation.address.province.required" }),
    postalCode: z.string()
      .regex(/^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/, { message: "professional.validation.address.postalCode.format" }),
    country: z.string().default('Canada'),
  }),
  profileImg: z.string().url({ message: "professional.validation.profileImage.format" }).optional(),
  bio: z.string()
    .max(1000, { message: "professional.validation.bio.maxLength" })
    .optional()
    .or(z.literal('')),
  websiteUrl: z.string()
    .url({ message: "professional.validation.website.format" })
    .optional()
    .or(z.literal('')),
  socialMedia: z.object({
    linkedin: z.string().url({ message: "professional.validation.linkedin.format" }).optional(),
    twitter: z.string().url({ message: "professional.validation.twitter.format" }).optional(),
    facebook: z.string().url({ message: "professional.validation.facebook.format" }).optional(),
  }).optional(),
});

export const professionalRegistrationSchema = registrationSchema.merge(
  z.object({
    professionalProfile: professionalProfileSchema,
    termsAccepted: z.boolean().refine(val => val === true, {
      message: "professional.validation.terms.required"
    }),
    privacyAccepted: z.boolean().refine(val => val === true, {
      message: "professional.validation.privacy.required"
    }),
  })
);

export const professionalVerificationSchema = z.object({
  credentials: z.array(z.object({
    type: z.enum(['license', 'diploma', 'certificate']),
    name: z.string().min(1, { message: "professional.validation.credential.name.required" }),
    issuingOrganization: z.string().min(1, { message: "professional.validation.credential.issuer.required" }),
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "professional.validation.credential.date.format" }),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "professional.validation.credential.expiry.format" }).optional(),
    fileUrl: z.string().url({ message: "professional.validation.credential.file.required" }),
  })).min(1, { message: "professional.validation.credentials.required" }),
  backgroundCheck: z.object({
    completed: z.boolean(),
    completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    fileUrl: z.string().url().optional(),
  }),
  professionalReferences: z.array(z.object({
    name: z.string().min(1, { message: "professional.validation.reference.name.required" }),
    organization: z.string().min(1, { message: "professional.validation.reference.organization.required" }),
    email: z.string().email({ message: "professional.validation.reference.email.format" }),
    phone: z.string().regex(/^\+1[0-9]{10}$/, { message: "professional.validation.reference.phone.format" }),
    relationship: z.string().min(1, { message: "professional.validation.reference.relationship.required" }),
  })).min(2, { message: "professional.validation.references.minimum" }),
});