/**
 * Client Validation Schemas
 * Zod schemas for client registration and profile forms
 */

import { z } from 'zod';
import { registrationSchema } from './authSchemas';

export const clientProfileSchema = z.object({
  firstName: z.string()
    .min(1, { message: "client.validation.firstName.required" })
    .max(50, { message: "client.validation.firstName.maxLength" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "client.validation.firstName.format" }),
  lastName: z.string()
    .min(1, { message: "client.validation.lastName.required" })
    .max(50, { message: "client.validation.lastName.maxLength" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "client.validation.lastName.format" }),
  dob: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "client.validation.dateOfBirth.format" })
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16; // Minimum age for mental health services
    }, { message: "client.validation.dateOfBirth.minimumAge" }),
  gender: z.enum([1, 2, 3, 4], { message: "client.validation.gender.required" }), // 1: Woman, 2: Man, 3: Other, 4: Prefer not to say
  phoneNb: z.string()
    .regex(/^\+1[0-9]{10}$/, { message: "client.validation.phone.format" }),
  emergencyContact: z.object({
    name: z.string().min(1, { message: "client.validation.emergencyContact.name.required" }),
    relationship: z.string().min(1, { message: "client.validation.emergencyContact.relationship.required" }),
    phoneNb: z.string().regex(/^\+1[0-9]{10}$/, { message: "client.validation.emergencyContact.phone.format" }),
    email: z.string().email({ message: "client.validation.emergencyContact.email.format" }).optional(),
  }),
  addressObj: z.object({
    street: z.string().min(1, { message: "client.validation.address.street.required" }),
    city: z.string().min(1, { message: "client.validation.address.city.required" }),
    province: z.string().min(1, { message: "client.validation.address.province.required" }),
    postalCode: z.string()
      .regex(/^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/, { message: "client.validation.address.postalCode.format" }),
    country: z.string().default('Canada'),
  }),
  spokenLangArr: z.array(z.string()).min(1, { message: "client.validation.languages.required" }),
  healthCard: z.object({
    number: z.string().min(1, { message: "client.validation.healthCard.number.required" }),
    province: z.string().min(1, { message: "client.validation.healthCard.province.required" }),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "client.validation.healthCard.expiry.format" }),
  }).optional(),
  preferences: z.object({
    communicationMethod: z.enum(['email', 'phone', 'sms'], { message: "client.validation.preferences.communication.required" }),
    appointmentReminders: z.boolean().default(true),
    dataSharing: z.boolean().default(false),
    marketingEmails: z.boolean().default(false),
  }),
  mentalHealthHistory: z.object({
    previousTherapy: z.boolean(),
    currentMedication: z.boolean(),
    diagnosedConditions: z.array(z.string()).optional(),
    currentSymptoms: z.array(z.string()).optional(),
    notes: z.string().max(500, { message: "client.validation.mentalHealth.notes.maxLength" }).optional(),
  }).optional(),
});

export const clientRegistrationSchema = registrationSchema.merge(
  z.object({
    clientProfile: clientProfileSchema,
    consentForms: z.object({
      treatmentConsent: z.boolean().refine(val => val === true, {
        message: "client.validation.consent.treatment.required"
      }),
      privacyConsent: z.boolean().refine(val => val === true, {
        message: "client.validation.consent.privacy.required"
      }),
      communicationConsent: z.boolean().refine(val => val === true, {
        message: "client.validation.consent.communication.required"
      }),
      dataRetentionConsent: z.boolean().default(false),
      researchParticipation: z.boolean().default(false),
    }),
    termsAccepted: z.boolean().refine(val => val === true, {
      message: "client.validation.terms.required"
    }),
  })
);

export const clientIntakeSchema = z.object({
  reasonForSeeking: z.string()
    .min(10, { message: "client.validation.intake.reason.minLength" })
    .max(1000, { message: "client.validation.intake.reason.maxLength" }),
  currentStressors: z.array(z.enum([
    'work', 'relationships', 'family', 'finances', 'health', 'education', 
    'trauma', 'grief', 'anxiety', 'depression', 'other'
  ])).min(1, { message: "client.validation.intake.stressors.required" }),
  goals: z.array(z.string().min(5, { message: "client.validation.intake.goal.minLength" }))
    .min(1, { message: "client.validation.intake.goals.required" })
    .max(5, { message: "client.validation.intake.goals.maxCount" }),
  preferredTherapistType: z.object({
    gender: z.enum(['any', 'woman', 'man', 'non-binary']).default('any'),
    ageRange: z.enum(['any', 'younger', 'similar', 'older']).default('any'),
    experience: z.array(z.string()).optional(),
    culturalBackground: z.string().optional(),
  }),
  availabilityPreferences: z.object({
    daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
      .min(1, { message: "client.validation.availability.days.required" }),
    timeSlots: z.array(z.enum(['morning', 'afternoon', 'evening']))
      .min(1, { message: "client.validation.availability.times.required" }),
    frequency: z.enum(['weekly', 'biweekly', 'monthly', 'as-needed'], {
      message: "client.validation.availability.frequency.required"
    }),
  }),
  budgetRange: z.object({
    minAmount: z.number().min(0, { message: "client.validation.budget.min.invalid" }),
    maxAmount: z.number().min(0, { message: "client.validation.budget.max.invalid" }),
    currency: z.string().default('CAD'),
    paymentMethod: z.enum(['insurance', 'out-of-pocket', 'employee-benefits', 'sliding-scale'])
      .optional(),
  }),
});

export const clientOnboardingSchema = clientRegistrationSchema.merge(
  z.object({
    intakeForm: clientIntakeSchema,
  })
);