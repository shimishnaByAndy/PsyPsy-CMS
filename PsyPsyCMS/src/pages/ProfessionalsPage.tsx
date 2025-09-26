import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  MoreVertical,
  UserPlus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Shield,
  Award,
  Building2,
  GraduationCap,
  BadgeCheck,
  AlertTriangle,
  Grid3X3,
  List,
  ExternalLink,
  X,
  Save,
  UserCheck,
  Briefcase,
  GraduationCap as GradIcon,
  Eye,
  Upload,
  XCircle
} from 'lucide-react'
import { Professional } from '@/types/professional'
import { ProfessionalGrid, GridLayout } from '@/components/ui/ProfessionalGrid'
import { ModernProfessionalCard } from '@/components/healthcare/ModernProfessionalCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const ProfessionalsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'modern' | 'table'>('modern')
  const [gridLayout, setGridLayout] = useState<GridLayout>('grid')
  const [showProfessionalModal, setShowProfessionalModal] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  // Handler for professional actions from modern cards
  const handleProfessionalAction = (professional: Professional, action: string) => {
    switch (action) {
      case 'view':
        handleViewDetails(professional)
        break
      case 'schedule':
        // TODO: Implement scheduling functionality
        toast({
          title: "Schedule Appointment",
          description: `Scheduling with ${professional.profile?.firstName} ${professional.profile?.lastName}`,
        })
        break
      case 'message':
        // TODO: Implement messaging functionality
        toast({
          title: "Send Message",
          description: `Sending message to ${professional.profile?.firstName} ${professional.profile?.lastName}`,
        })
        break
      case 'favorite':
        // TODO: Implement favorites functionality
        toast({
          title: "Added to Favorites",
          description: `${professional.profile?.firstName} ${professional.profile?.lastName} added to favorites`,
        })
        break
      case 'share':
        // TODO: Implement sharing functionality
        toast({
          title: "Share Professional",
          description: `Sharing ${professional.profile?.firstName} ${professional.profile?.lastName}`,
        })
        break
      default:
        console.log('Unknown action:', action, professional)
    }
  }

  // Mock professional data for development (moved here to fix temporal dead zone)
  const mockProfessionals: Professional[] = [
    {
      objectId: 'prof_1',
      userId: 'user_1',
      profile: {
        firstName: 'Dr. Sarah',
        lastName: 'Thompson',
        dateOfBirth: '1980-05-15',
        gender: 2, // female
        profilePicture: undefined,
        bio: undefined,
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isActive: true
      },
      addressObj: {
        street: '1234 Sherbrooke St',
        city: 'Montreal',
        state: 'QC',
        zipCode: 'H3A 1A1',
        country: 'Canada'
      },
      geoPt: undefined,
      phoneNb: {
        countryCode: '+1',
        number: '(514) 555-0101',
        formatted: '+1 (514) 555-0101'
      },
      bussEmail: 'sarah.thompson@psypsy.ca',
      businessName: 'Thompson Psychology Clinic',
      profType: 1,
      eduInstitute: 1,
      motherTongue: 1,
      offeredLangArr: [1, 2],
      expertises: [
        {
          category: 1,
          subcategories: [1, 2, 3],
          experience: 12,
          certification: 'Quebec Order of Psychologists',
          description: 'Clinical Psychology - Anxiety, Depression, Trauma'
        }
      ],
      servOfferedArr: [1, 2, 3],
      servOfferedObj: {
        1: { name: 'Individual Therapy', description: 'One-on-one therapy sessions', duration: 50, price: 150, currency: 'CAD' },
        2: { name: 'Group Therapy', description: 'Group therapy sessions', duration: 90, price: 75, currency: 'CAD' }
      },
      servedClientele: [1, 2, 3],
      availability: [1, 2, 3, 4, 5],
      meetType: 'Both',
      thirdPartyPayers: [1, 2],
      partOfOrder: undefined,
      status: 'active',
      verification: {
        isVerified: true,
        verificationDate: '2023-01-15T10:00:00Z',
        verifiedBy: 'admin',
        verificationDocuments: [
          { documentType: 'license', fileUrl: '/docs/license.pdf', uploadedAt: '2023-01-15T10:00:00Z', isVerified: true },
          { documentType: 'education', fileUrl: '/docs/education.pdf', uploadedAt: '2023-01-15T10:00:00Z', isVerified: true }
        ]
      },
      licenseInfo: {
        licenseNumber: 'QC-PSY-2023-001',
        licenseType: 'psychologist',
        issuingState: 'QC',
        issueDate: '2011-06-15',
        expiryDate: '2024-06-15',
        isActive: true
      },
      rating: {
        averageRating: 4.8,
        totalReviews: 156,
        ratingDistribution: { 5: 120, 4: 30, 3: 4, 2: 1, 1: 1 }
      },
      totalClients: 89,
      activeClients: 45,
      totalAppointments: 1250,
      completedAppointments: 1180,
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ]

  // Load professionals on component mount
  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call Tauri backend API
      const apiResponse = await invoke('get_professionals', {
        page: 1,
        limit: 50
      })

      console.log('API Response:', apiResponse)

      // Handle the ApiResponse<PaginatedResponse<Professional>> structure
      if (apiResponse && apiResponse.success && apiResponse.data) {
        const professionals = apiResponse.data.data || []

        // Transform backend professionals to frontend format (matching aligned interface)
        const transformedProfessionals = professionals.map((backendProf: any) => ({
          objectId: backendProf.object_id || backendProf.id,
          userId: backendProf.user_id,
          profile: {
            firstName: backendProf.profile?.first_name || backendProf.first_name || '',
            lastName: backendProf.profile?.last_name || backendProf.last_name || '',
            dateOfBirth: backendProf.profile?.date_of_birth || undefined,
            gender: backendProf.profile?.gender || undefined,
            profilePicture: backendProf.profile?.profile_picture || undefined,
            bio: backendProf.profile?.bio || undefined,
            createdAt: backendProf.profile?.created_at || backendProf.created_at || new Date().toISOString(),
            updatedAt: backendProf.profile?.updated_at || backendProf.updated_at || new Date().toISOString(),
            isActive: backendProf.profile?.is_active ?? true
          },
          addressObj: {
            street: backendProf.address_obj?.street || '',
            city: backendProf.address_obj?.city || '',
            state: backendProf.address_obj?.state || 'QC',
            zipCode: backendProf.address_obj?.zip_code || '',
            country: backendProf.address_obj?.country || 'Canada'
          },
          geoPt: backendProf.geo_pt,
          phoneNb: {
            countryCode: backendProf.phone_nb?.country_code || '+1',
            number: backendProf.phone_nb?.number || '',
            formatted: backendProf.phone_nb?.formatted
          },
          bussEmail: backendProf.buss_email || '',
          businessName: backendProf.business_name || '',
          profType: backendProf.prof_type || 1,
          eduInstitute: backendProf.edu_institute || 0,
          motherTongue: backendProf.mother_tongue || 1,
          offeredLangArr: backendProf.offered_lang_arr || [1],
          expertises: backendProf.expertises || [],
          servOfferedArr: backendProf.serv_offered_arr || [],
          servOfferedObj: backendProf.serv_offered_obj || {},
          servedClientele: backendProf.served_clientele || [],
          availability: backendProf.availability || [],
          meetType: backendProf.meet_type || 'Both',
          thirdPartyPayers: backendProf.third_party_payers || [],
          partOfOrder: backendProf.part_of_order,
          status: backendProf.status || 'pending',
          verification: {
            isVerified: backendProf.verification?.is_verified || false,
            verificationDate: backendProf.verification?.verification_date,
            verifiedBy: backendProf.verification?.verified_by,
            verificationDocuments: backendProf.verification?.verification_documents || []
          },
          licenseInfo: backendProf.license_info || {
            licenseNumber: '',
            licenseType: '',
            issuingState: 'QC',
            issueDate: '',
            expiryDate: '',
            isActive: true
          },
          rating: {
            averageRating: backendProf.rating?.average_rating || 0,
            totalReviews: backendProf.rating?.total_reviews || 0,
            ratingDistribution: backendProf.rating?.rating_distribution || {}
          },
          totalClients: backendProf.total_clients || 0,
          activeClients: backendProf.active_clients || 0,
          totalAppointments: backendProf.total_appointments || 0,
          completedAppointments: backendProf.completed_appointments || 0,
          createdAt: backendProf.created_at || new Date().toISOString(),
          updatedAt: backendProf.updated_at || new Date().toISOString()
        }))

        setProfessionals(transformedProfessionals)
      } else {
        console.warn('Unexpected API response format, using mock data')
        setProfessionals(mockProfessionals)
      }
    } catch (error) {
      console.error('Failed to load professionals:', error)
      setError('Failed to load professionals. Please try again.')
      // Use mock data for development
      setProfessionals(mockProfessionals)
    } finally {
      setIsLoading(false)
    }
  }

  // Early returns for loading and error states with proper landmarks
  if (isLoading) {
    return (
      <main role="main" aria-label="Professionals management - loading">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" role="status" aria-label="Loading professionals"></div>
            <p className="mt-4 text-gray-600">Loading professionals...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main role="main" aria-label="Professionals management - error">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" aria-hidden="true" />
          <h1 className="mt-2 text-sm font-medium text-gray-900">Error loading professionals</h1>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={loadProfessionals}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Retry loading professionals"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }


  const filteredProfessionals = professionals.filter(professional => {
    const fullName = `${professional.profile.firstName} ${professional.profile.lastName}`
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         professional.bussEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         professional.expertises.some(expertise =>
                           expertise.certification?.toLowerCase().includes(searchQuery.toLowerCase())
                         )
    const matchesStatus = filterStatus === 'all' || professional.status === filterStatus
    const matchesSpecialty = filterSpecialty === 'all' ||
                            professional.expertises.some(expertise =>
                              expertise.certification?.includes(filterSpecialty)
                            )
    return matchesSearch && matchesStatus && matchesSpecialty
  })

  const handleSelectProfessional = (professionalId: string) => {
    setSelectedProfessionals(prev =>
      prev.includes(professionalId)
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProfessionals.length === filteredProfessionals.length) {
      setSelectedProfessionals([])
    } else {
      setSelectedProfessionals(filteredProfessionals.map(professional => professional.objectId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-900 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-900 border-gray-200'
      case 'pending_verification': return 'bg-yellow-100 text-yellow-900 border-yellow-200'
      case 'suspended': return 'bg-red-100 text-red-900 border-red-200'
      default: return 'bg-gray-100 text-gray-900 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'inactive': return <Clock className="w-4 h-4" />
      case 'pending_verification': return <AlertTriangle className="w-4 h-4" />
      case 'suspended': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getVerificationIcon = (professional: Professional) => {
    if (professional.verification.isVerified) {
      return <BadgeCheck className="w-5 h-5 text-green-600" />
    } else {
      return <Shield className="w-5 h-5 text-yellow-600" />
    }
  }

  const handleAddProfessional = () => {
    setEditingProfessional(null)
    setShowProfessionalModal(true)
  }

  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional)
    setShowProfessionalModal(true)
  }

  const handleViewDetails = (professional: Professional) => {
    setSelectedProfessional(professional)
    setShowDetailsModal(true)
  }

  const handleVerifyProfessional = (professional: Professional) => {
    setSelectedProfessional(professional)
    setShowVerificationDialog(true)
  }

  // Professional Card Component (moved here to fix temporal dead zone)
  const ProfessionalCard = ({ professional }: { professional: Professional }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedProfessionals.includes(professional.objectId)}
            onChange={() => handleSelectProfessional(professional.objectId)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-label={`Select ${professional.firstName} ${professional.lastName}`}
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{professional.profile.firstName} {professional.profile.lastName}</h3>
              {getVerificationIcon(professional)}
            </div>
            <p className="text-sm text-gray-600">Healthcare Professional</p>
            <p className="text-xs text-gray-500">ID: {professional.objectId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(professional.status)}`}>
            {getStatusIcon(professional.status)}
            <span className="ml-1">{professional.status.replace('_', ' ')}</span>
          </span>
          <button
            className="text-gray-600 hover:text-gray-800"
            aria-label="More options for professional"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span>{professional.bussEmail}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{professional.phoneNb.formatted || `+${professional.phoneNb.countryCode} ${professional.phoneNb.number}`}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Building2 className="w-4 h-4 mr-2" />
            <span>{professional.businessName}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>{Math.max(...professional.expertises.map(e => e.experience), 0)} years experience</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="w-4 h-4 mr-2" />
            <span>{professional.rating.averageRating}/5 ({professional.rating.totalReviews} reviews)</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award className="w-4 h-4 mr-2" />
            <span>{professional.availability.length > 0 ? 'Available' : 'Not available'}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">Specializations:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {professional.expertises.map((expertise, index) => (
              <span key={`card-expertise-${professional.objectId}-${index}`} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                {`Category ${expertise.category}`}
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <strong>Verification:</strong> {professional.verification.isVerified ? 'Verified' : 'Pending'}
          {professional.verification.verificationDate && (
            <span> • {new Date(professional.verification.verificationDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <button
          key="details"
          onClick={() => handleViewDetails(professional)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 mr-1" />
          Details
        </button>
        <button key="schedule" className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          <Calendar className="w-4 h-4 mr-1" />
          Schedule
        </button>
        <button
          key="edit"
          onClick={() => handleEditProfessional(professional)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
        >
          <Edit3 className="w-4 h-4 mr-1" />
          Edit
        </button>
        <button
          key="verify"
          onClick={() => handleVerifyProfessional(professional)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
        >
          <Shield className="w-4 h-4 mr-1" />
          Verify
        </button>
      </div>
    </div>
  )

  const handleUpdateVerification = async (verified: boolean) => {
    if (!selectedProfessional) return

    setIsVerifying(true)
    try {
      await invoke('update_professional_verification', {
        professionalId: selectedProfessional.objectId,
        verified,
        verificationNotes: verificationNotes || null
      })

      // Update the professional in our local state
      setProfessionals(professionals.map(p =>
        p.objectId === selectedProfessional.objectId
          ? {
              ...p,
              verification: {
                ...p.verification,
                isVerified: verified,
                verificationDate: verified ? new Date().toISOString() : undefined
              }
            }
          : p
      ))

      setShowVerificationDialog(false)
      setVerificationNotes('')
      setSelectedProfessional(null)

      toast({
        title: 'Success',
        description: verified ? 'Professional verified successfully' : 'Professional verification removed',
      })
    } catch (error) {
      console.error('Failed to update verification:', error)
      toast({
        title: 'Error',
        description: `Failed to update verification: ${error}`,
        variant: 'destructive'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCloseModal = () => {
    setShowProfessionalModal(false)
    setEditingProfessional(null)
  }

  const handleSubmitProfessional = async (formData: Partial<Professional>) => {
    setIsSubmitting(true)
    try {
      if (editingProfessional) {
        // Update existing professional
        console.log('Updating professional:', editingProfessional.id, formData)

        // Transform frontend data to backend UpdateProfessionalRequest format
        const updateRequest = {
          first_name: formData.personalInfo?.firstName,
          last_name: formData.personalInfo?.lastName,
          buss_email: formData.personalInfo?.email,
          phone: formData.personalInfo?.phoneNumber ? {
            number: formData.profile.firstName, // This needs to be updated in actual implementation
            country_code: '+1'
          } : undefined,
          address: formData.personalInfo?.address ? {
            street: formData.addressObj.street,
            city: formData.addressObj.city,
            state: formData.addressObj.state,
            zip_code: formData.addressObj.zipCode,
            country: formData.addressObj.country || 'Canada'
          } : undefined,
          business_name: formData.businessInfo?.businessName,
          prof_type: 1, // Default psychologist type
          license_info: {
            license_number: 'TEMP-LICENSE',
            license_type: 'psychologist',
            issuing_state: formData.personalInfo?.address?.province || 'QC',
            issue_date: '2020-01-01',
            expiry_date: '2025-12-31',
            is_active: true
          },
          expertises: [{
            category: 'therapy',
            subcategory: 'general',
            years_of_experience: formData.professionalInfo?.yearsOfExperience || 0,
            description: formData.professionalInfo?.specializations.join(', ') || ''
          }],
          status: formData.status === 'active' ? 'Active' :
                 formData.status === 'inactive' ? 'Inactive' :
                 formData.status === 'suspended' ? 'Suspended' : 'Pending'
        }

        const result = await invoke('update_professional', {
          id: editingProfessional.id,
          request: updateRequest
        })

        console.log('Professional updated successfully:', result)
        alert('Professional updated successfully!')

        // Update local state with the updated professional
        const updatedProfessional = { ...editingProfessional, ...formData, updatedAt: new Date().toISOString() }
        setProfessionals(prev =>
          prev.map(p => p.id === editingProfessional.id ? updatedProfessional : p)
        )

      } else {
        // Create new professional
        console.log('Creating professional:', formData)

        // Transform frontend data to backend CreateProfessionalRequest format
        const createRequest = {
          user_id: 'temp-user-id', // TODO: Get from current user context
          first_name: formData.personalInfo?.firstName || '',
          last_name: formData.personalInfo?.lastName || '',
          buss_email: formData.personalInfo?.email || '',
          phone: {
            number: formData.personalInfo?.phoneNumber || '',
            country_code: '+1'
          },
          address: {
            street: formData.personalInfo?.address?.street || '',
            city: formData.personalInfo?.address?.city || '',
            state: formData.personalInfo?.address?.province || 'QC',
            zip_code: formData.personalInfo?.address?.postalCode || '',
            country: formData.personalInfo?.address?.country || 'Canada'
          },
          business_name: formData.businessInfo?.businessName || '',
          prof_type: 1, // Default psychologist type
          license_info: {
            license_number: 'TEMP-LICENSE',
            license_type: 'psychologist',
            issuing_state: formData.personalInfo?.address?.province || 'QC',
            issue_date: '2020-01-01',
            expiry_date: '2025-12-31',
            is_active: true
          },
          expertises: [{
            category: 'therapy',
            subcategory: 'general',
            years_of_experience: formData.professionalInfo?.yearsOfExperience || 0,
            description: formData.professionalInfo?.specializations.join(', ') || ''
          }],
          services: {}
        }

        const result = await invoke('create_professional', {
          request: createRequest
        })

        console.log('Professional created successfully:', result)
        alert('Professional created successfully!')

        // Add new professional to local state
        const newProfessional: Professional = {
          id: `prof_${Date.now()}`,
          userId: `user_${Date.now()}`,
          ...formData as Professional,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setProfessionals(prev => [...prev, newProfessional])
      }

      handleCloseModal()

    } catch (error) {
      console.error('Failed to save professional:', error)
      alert(`Error: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Main component return with proper semantic structure
  return (
    <div className="professionals-page" aria-label="Professionals management">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Healthcare Professionals</h1>
            <p className="text-sm text-gray-600 mt-1">Manage professional credentials and verification status</p>
          </div>
          <button
            onClick={handleAddProfessional}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Add new professional"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Professional
          </button>
        </div>

        {/* Search and Filter Section */}
        <section className="mt-6 space-y-4" aria-label="Search and filter controls">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search professionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search professionals by name, email, or specialization"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by status"
              >
                <option key="all" value="all">All Status</option>
                <option key="active" value="active">Active</option>
                <option key="inactive" value="inactive">Inactive</option>
                <option key="pending_verification" value="pending_verification">Pending Verification</option>
                <option key="suspended" value="suspended">Suspended</option>
              </select>
              <button
                onClick={() => setViewMode(viewMode === 'modern' ? 'table' : 'modern')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label={`Switch to ${viewMode === 'modern' ? 'table' : 'modern'} view`}
              >
                {viewMode === 'modern' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Results Section */}
      <section aria-label="Professionals list" className="space-y-6">
        {filteredProfessionals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-600" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-medium text-gray-900">No professionals found</h2>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first professional.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredProfessionals.length} of {professionals.length} professionals
              </p>
              {selectedProfessionals.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedProfessionals.length} selected</span>
                  <button
                    onClick={() => setSelectedProfessionals([])}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    aria-label="Clear selection"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Professionals Display */}
            {viewMode === 'modern' ? (
              <ProfessionalGrid
                professionals={filteredProfessionals}
                layout={gridLayout}
                onLayoutChange={setGridLayout}
                onProfessionalAction={handleProfessionalAction}
                showLayoutControls={true}
                enableSwipe={true}
                prioritizeAvailable={true}
                showFeatured={true}
                className="mt-6"
              />
            ) : (
              <ProfessionalsTable />
            )}
          </>
        )}
      </section>
    </div>
  )


  const ProfessionalsTable = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedProfessionals.length === filteredProfessionals.length && filteredProfessionals.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-label="Select all professionals"
              />
            </TableHead>
            <TableHead>Professional</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Specializations</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfessionals.map(professional => (
            <TableRow key={professional.objectId}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedProfessionals.includes(professional.objectId)}
                  onChange={() => handleSelectProfessional(professional.objectId)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-label={`Select ${professional.profile.firstName} ${professional.profile.lastName}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{professional.profile.firstName} {professional.profile.lastName}</p>
                      {getVerificationIcon(professional)}
                    </div>
                    <p className="text-sm text-gray-600">Healthcare Professional</p>
                    <p className="text-xs text-gray-500">{professional.businessName}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-40">{professional.bussEmail}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{professional.phoneNb.formatted || `+${professional.phoneNb.countryCode} ${professional.phoneNb.number}`}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-48">
                  {professional.expertises.slice(0, 2).map((expertise, index) => (
                    <span key={`expertise-${professional.objectId}-${index}`} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      {`Category ${expertise.category}`}
                    </span>
                  ))}
                  {professional.expertises.length > 2 && (
                    <span key={`expertise-more-${professional.objectId}`} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700">
                      +{professional.expertises.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  <span>{Math.max(...professional.expertises.map(e => e.experience), 0)} years</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                  <span>{professional.rating.averageRating}/5</span>
                  <span className="text-xs text-gray-500 ml-1">({professional.rating.totalReviews})</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(professional.status)}`}>
                  {getStatusIcon(professional.status)}
                  <span className="ml-1">{professional.status.replace('_', ' ')}</span>
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {professional.verification.isVerified ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <button
                    key={`table-details-${professional.objectId}`}
                    onClick={() => handleViewDetails(professional)}
                    className="inline-flex items-center p-1.5 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50"
                    aria-label="View professional details"
                  >
                    <Eye className="w-4 h-4" title="View Details" />
                  </button>
                  <button
                    key={`table-schedule-${professional.objectId}`}
                    className="inline-flex items-center p-1.5 text-gray-600 hover:text-green-600 rounded-md hover:bg-green-50"
                    aria-label="Schedule appointment with professional"
                  >
                    <Calendar className="w-4 h-4" title="Schedule" />
                  </button>
                  <button
                    key={`table-edit-${professional.objectId}`}
                    onClick={() => handleEditProfessional(professional)}
                    className="inline-flex items-center p-1.5 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50"
                    aria-label="Edit professional information"
                  >
                    <Edit3 className="w-4 h-4" title="Edit" />
                  </button>
                  <button
                    key={`table-verify-${professional.objectId}`}
                    onClick={() => handleVerifyProfessional(professional)}
                    className="inline-flex items-center p-1.5 text-gray-600 hover:text-purple-600 rounded-md hover:bg-purple-50"
                    aria-label="Verify professional credentials"
                  >
                    <Shield className="w-4 h-4" title="Verify" />
                  </button>
                  <button
                    key={`table-more-${professional.objectId}`}
                    className="inline-flex items-center p-1.5 text-gray-600 hover:text-gray-600 rounded-md hover:bg-gray-50"
                    aria-label="More options for professional"
                  >
                    <MoreVertical className="w-4 h-4" title="More options" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredProfessionals.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No professionals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterSpecialty !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first professional.'
            }
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddProfessional}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Professional
            </button>
          </div>
        </div>
      )}

      {/* Modals and dialogs */}
      <ProfessionalFormModal
        editingProfessional={editingProfessional}
        isOpen={showProfessionalModal}
        onSubmit={handleSubmitProfessional}
        onClose={handleCloseModal}
      />
      <ProfessionalDetailsModal />
      <VerificationDialog />
    </div>
  )

// Helper Components

interface ProfessionalFormModalProps {
  editingProfessional: Professional | null
  isOpen: boolean
  onSubmit: (data: Partial<Professional>) => void
  onClose: () => void
}

const ProfessionalFormModal = ({ editingProfessional, isOpen, onSubmit, onClose }: ProfessionalFormModalProps) => {
    const [formData, setFormData] = useState(() => ({
      // Personal Information
      firstName: editingProfessional?.profile?.firstName || '',
      lastName: editingProfessional?.profile?.lastName || '',
      email: editingProfessional?.bussEmail || '',
      phoneNumber: editingProfessional?.phoneNb?.number || '',
      dateOfBirth: editingProfessional?.profile?.dateOfBirth || '',
      gender: editingProfessional?.profile?.gender?.toString() || '0',
      // Address
      street: editingProfessional?.addressObj?.street || '',
      city: editingProfessional?.addressObj?.city || '',
      province: editingProfessional?.addressObj?.state || 'QC',
      postalCode: editingProfessional?.addressObj?.zipCode || '',
      country: editingProfessional?.addressObj?.country || 'Canada',
      // Business Information
      businessName: editingProfessional?.businessName || '',
      businessRegistrationNumber: '',
      taxNumber: '',
      website: '',
      // Professional Information
      title: 'Healthcare Professional',
      specializations: editingProfessional?.expertises?.map(e => `Category ${e.category}`).join(', ') || '',
      yearsOfExperience: Math.max(...(editingProfessional?.expertises?.map(e => e.experience) || [0])) || 0,
      // Status
      status: editingProfessional?.status || 'pending_verification'
    }))

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      const professionalData: Partial<Professional> = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: parseInt(formData.gender) || 0,
          profilePicture: editingProfessional?.profile.profilePicture,
          bio: editingProfessional?.profile.bio,
          createdAt: editingProfessional?.profile.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true
        },
        addressObj: {
          street: formData.street,
          city: formData.city,
          state: formData.province,
          zipCode: formData.postalCode,
          country: formData.country
        },
        phoneNb: {
          countryCode: '1',
          number: formData.phoneNumber,
          formatted: `+1 ${formData.phoneNumber}`
        },
        bussEmail: formData.email,
        businessName: formData.businessName,
        expertises: formData.specializations.split(',').map((s, index) => ({
          category: index + 1,
          subcategories: [],
          experience: formData.yearsOfExperience,
          certification: s.trim()
        })).filter(e => e.certification),
        verification: editingProfessional?.verification || {
          isVerified: false,
          verificationDate: undefined,
          verifiedBy: undefined,
          verificationDocuments: []
        },
        rating: editingProfessional?.rating || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {}
        },
        status: formData.status as Professional['status']
      }

      onSubmit(professionalData)
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProfessional ? 'Edit Professional' : 'Add New Professional'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <form id="professional-form" onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({...prev, phoneNumber: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({...prev, dateOfBirth: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option key="male" value="male">Male</option>
                      <option key="female" value="female">Female</option>
                      <option key="other" value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({...prev, street: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData(prev => ({...prev, province: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option key="QC" value="QC">Quebec</option>
                      <option key="ON" value="ON">Ontario</option>
                      <option key="BC" value="BC">British Columbia</option>
                      <option key="AB" value="AB">Alberta</option>
                      <option key="MB" value="MB">Manitoba</option>
                      <option key="SK" value="SK">Saskatchewan</option>
                      <option key="NS" value="NS">Nova Scotia</option>
                      <option key="NB" value="NB">New Brunswick</option>
                      <option key="NL" value="NL">Newfoundland and Labrador</option>
                      <option key="PE" value="PE">Prince Edward Island</option>
                      <option key="NT" value="NT">Northwest Territories</option>
                      <option key="NU" value="NU">Nunavut</option>
                      <option key="YT" value="YT">Yukon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({...prev, postalCode: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({...prev, country: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({...prev, businessName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      value={formData.businessRegistrationNumber}
                      onChange={(e) => setFormData(prev => ({...prev, businessRegistrationNumber: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData(prev => ({...prev, taxNumber: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <GradIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                      placeholder="e.g. Clinical Psychologist, Licensed Therapist"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData(prev => ({...prev, yearsOfExperience: parseInt(e.target.value) || 0}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
                    <input
                      type="text"
                      value={formData.specializations}
                      onChange={(e) => setFormData(prev => ({...prev, specializations: e.target.value}))}
                      placeholder="e.g. Anxiety Disorders, Depression, Trauma Therapy (comma-separated)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option key="pending_verification" value="pending_verification">Pending Verification</option>
                      <option key="active" value="active">Active</option>
                      <option key="inactive" value="inactive">Inactive</option>
                      <option key="suspended" value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="professional-form"
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault()
                const form = document.querySelector('#professional-form') as HTMLFormElement
                if (form) {
                  form.requestSubmit()
                } else {
                  handleSubmit(e as any)
                }
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingProfessional ? 'Update Professional' : 'Create Professional'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ProfessionalsPage
