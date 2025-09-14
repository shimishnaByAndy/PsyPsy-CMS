import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Client, SupportedLanguage } from '@/types'
import { formatPhone } from '@/lib/utils'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Heart,
  AlertTriangle,
  Save,
  X
} from 'lucide-react'

// Validation schema using Zod
const patientFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  language: z.enum(['en', 'fr'] as const),
  
  // Address Information
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    country: z.string().default("USA")
  }),
  
  // Emergency Contact
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    phone: z.string().min(1, "Emergency contact phone is required"),
    email: z.string().email().optional().or(z.literal(""))
  }),
  
  // Medical Information
  medicalInfo: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    emergencyMedicalInfo: z.string().optional(),
    bloodType: z.string().optional()
  }).optional(),
  
  // Insurance Information
  insuranceInfo: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
    effectiveDate: z.string().optional()
  }).optional(),
  
  // Preferences and Consents
  consentToTreatment: z.boolean().refine(val => val === true, {
    message: "Consent to treatment is required"
  }),
  consentToDataSharing: z.boolean().optional(),
  communicationPreferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    phone: z.boolean().default(true)
  })
})

type PatientFormData = z.infer<typeof patientFormSchema>

interface PatientFormProps {
  initialData?: Partial<Client>
  onSubmit: (data: PatientFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit'
  className?: string
}

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create',
  className
}: PatientFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: initialData?.user?.profile?.firstName || '',
      lastName: initialData?.user?.profile?.lastName || '',
      email: initialData?.user?.email || '',
      phone: initialData?.user?.profile?.phone || '',
      dateOfBirth: initialData?.user?.profile?.dateOfBirth || '',
      language: (initialData?.user?.profile?.language || 'en') as SupportedLanguage,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      medicalInfo: {
        allergies: [],
        medications: [],
        medicalConditions: [],
        emergencyMedicalInfo: '',
        bloodType: ''
      },
      insuranceInfo: {
        provider: '',
        policyNumber: '',
        groupNumber: '',
        effectiveDate: ''
      },
      consentToTreatment: false,
      consentToDataSharing: false,
      communicationPreferences: {
        email: true,
        sms: false,
        phone: true
      }
    }
  })

  const handleFormSubmit = async (data: PatientFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={className}>
      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
              <Input
                label="Last Name"
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                {...register('email')}
                error={errors.email?.message}
                required
              />
              <Input
                label="Phone"
                type="tel"
                leftIcon={<Phone className="w-4 h-4" />}
                {...register('phone')}
                error={errors.phone?.message}
                hint="Format: (555) 123-4567"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                {...register('dateOfBirth')}
                error={errors.dateOfBirth?.message}
                required
              />
              <div>
                <Label>Preferred Language</Label>
                <Controller
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.language && (
                  <p className="healthcare-error">{errors.language.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Address Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address"
              {...register('address.street')}
              error={errors.address?.street?.message}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                {...register('address.city')}
                error={errors.address?.city?.message}
                required
              />
              <Input
                label="State"
                {...register('address.state')}
                error={errors.address?.state?.message}
                required
              />
              <Input
                label="ZIP Code"
                {...register('address.zipCode')}
                error={errors.address?.zipCode?.message}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Emergency Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                {...register('emergencyContact.name')}
                error={errors.emergencyContact?.name?.message}
                required
              />
              <Input
                label="Relationship"
                {...register('emergencyContact.relationship')}
                error={errors.emergencyContact?.relationship?.message}
                placeholder="e.g., Spouse, Parent, Sibling"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                leftIcon={<Phone className="w-4 h-4" />}
                {...register('emergencyContact.phone')}
                error={errors.emergencyContact?.phone?.message}
                required
              />
              <Input
                label="Email (Optional)"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                {...register('emergencyContact.email')}
                error={errors.emergencyContact?.email?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Medical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Known Allergies"
              placeholder="List any known allergies (separate with commas)"
              {...register('medicalInfo.allergies')}
              error={errors.medicalInfo?.allergies?.message}
              rows={2}
            />
            <Textarea
              label="Current Medications"
              placeholder="List current medications (separate with commas)"
              {...register('medicalInfo.medications')}
              error={errors.medicalInfo?.medications?.message}
              rows={2}
            />
            <Textarea
              label="Medical Conditions"
              placeholder="List any medical conditions (separate with commas)"
              {...register('medicalInfo.medicalConditions')}
              error={errors.medicalInfo?.medicalConditions?.message}
              rows={2}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Blood Type (Optional)"
                {...register('medicalInfo.bloodType')}
                placeholder="e.g., A+, O-, B+"
              />
              <Textarea
                label="Emergency Medical Information"
                placeholder="Any critical medical information for emergencies"
                {...register('medicalInfo.emergencyMedicalInfo')}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Consent and Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Consent and Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Controller
                control={control}
                name="consentToTreatment"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consentToTreatment"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="consentToTreatment" className="text-sm">
                      I consent to treatment and understand the treatment process *
                    </Label>
                  </div>
                )}
              />
              {errors.consentToTreatment && (
                <p className="healthcare-error">{errors.consentToTreatment.message}</p>
              )}

              <Controller
                control={control}
                name="consentToDataSharing"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consentToDataSharing"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="consentToDataSharing" className="text-sm">
                      I consent to sharing my data with healthcare providers as needed
                    </Label>
                  </div>
                )}
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="healthcare-label mb-3">Communication Preferences</h4>
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="communicationPreferences.email"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commEmail"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="commEmail" className="text-sm">
                        Email notifications and reminders
                      </Label>
                    </div>
                  )}
                />
                
                <Controller
                  control={control}
                  name="communicationPreferences.sms"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commSms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="commSms" className="text-sm">
                        SMS/text message reminders
                      </Label>
                    </div>
                  )}
                />
                
                <Controller
                  control={control}
                  name="communicationPreferences.phone"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commPhone"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="commPhone" className="text-sm">
                        Phone call reminders
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            variant="psypsy"
            loading={isSubmitting || loading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {mode === 'create' ? 'Create Patient' : 'Update Patient'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default PatientForm