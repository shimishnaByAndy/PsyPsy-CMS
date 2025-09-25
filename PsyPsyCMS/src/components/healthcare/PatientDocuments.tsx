import React, { useState, useRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Input,
  Select,
  SelectItem,
  Progress,
  Tooltip,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  Avatar,
  Spacer,
  Link,
  useDisclosure
} from '@nextui-org/react'
import {
  FileText,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  FileIcon,
  ImageIcon,
  VideoIcon,
  Archive,
  Trash2,
  Share2,
  Lock,
  Unlock,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { HealthcareCard, HealthcareButton } from '../ui/healthcare-components'

interface DocumentMetadata {
  id: string
  name: string
  type: DocumentType
  category: DocumentCategory
  mimeType: string
  size: number
  uploadedAt: string
  uploadedBy: {
    id: string
    name: string
    role: 'professional' | 'patient' | 'admin' | 'external'
  }
  lastModified: string
  version: number
  tags: string[]
  description?: string
  confidentialityLevel: 'public' | 'confidential' | 'restricted' | 'phi'
  retentionDate?: string
  encryptionStatus: 'encrypted' | 'not_encrypted' | 'pending'
  sharingPermissions: {
    patient: boolean
    professional: boolean
    emergency: boolean
    external: boolean
  }
  auditTrail: DocumentAuditEntry[]
  previewAvailable: boolean
  signatures?: DocumentSignature[]
}

interface DocumentAuditEntry {
  id: string
  action: 'upload' | 'view' | 'download' | 'share' | 'delete' | 'modify' | 'sign'
  userId: string
  userName: string
  timestamp: string
  ipAddress?: string
  reason?: string
  additionalData?: Record<string, any>
}

interface DocumentSignature {
  id: string
  signerId: string
  signerName: string
  signerRole: string
  signedAt: string
  signatureType: 'electronic' | 'digital' | 'witnessed'
  verified: boolean
}

type DocumentType =
  | 'medical_record'
  | 'test_result'
  | 'prescription'
  | 'insurance_claim'
  | 'consent_form'
  | 'treatment_plan'
  | 'referral'
  | 'image'
  | 'scan'
  | 'other'

type DocumentCategory =
  | 'clinical'
  | 'administrative'
  | 'legal'
  | 'billing'
  | 'personal'
  | 'emergency'

interface Patient {
  id: string
  firstName: string
  lastName: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

interface PatientDocumentsProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
  onDocumentView?: (documentId: string) => void
  onDocumentDownload?: (documentId: string) => void
  onDocumentUpload?: (file: File, metadata: Partial<DocumentMetadata>) => void
  onDocumentDelete?: (documentId: string) => void
  canManageDocuments?: boolean
  canViewConfidential?: boolean
}

// Mock documents data
const mockDocuments: DocumentMetadata[] = [
  {
    id: 'doc-1',
    name: 'Initial Assessment Report.pdf',
    type: 'medical_record',
    category: 'clinical',
    mimeType: 'application/pdf',
    size: 2048576,
    uploadedAt: '2024-12-15T10:30:00Z',
    uploadedBy: {
      id: 'prof-1',
      name: 'Dr. Sarah Wilson',
      role: 'professional'
    },
    lastModified: '2024-12-15T10:30:00Z',
    version: 1,
    tags: ['assessment', 'initial', 'intake'],
    description: 'Comprehensive initial psychological assessment',
    confidentialityLevel: 'phi',
    encryptionStatus: 'encrypted',
    sharingPermissions: {
      patient: true,
      professional: true,
      emergency: false,
      external: false
    },
    auditTrail: [
      {
        id: 'audit-1',
        action: 'upload',
        userId: 'prof-1',
        userName: 'Dr. Sarah Wilson',
        timestamp: '2024-12-15T10:30:00Z',
        reason: 'Initial patient assessment documentation'
      }
    ],
    previewAvailable: true,
    signatures: [
      {
        id: 'sig-1',
        signerId: 'prof-1',
        signerName: 'Dr. Sarah Wilson',
        signerRole: 'Clinical Psychologist',
        signedAt: '2024-12-15T10:45:00Z',
        signatureType: 'electronic',
        verified: true
      }
    ]
  },
  {
    id: 'doc-2',
    name: 'Treatment Consent Form.pdf',
    type: 'consent_form',
    category: 'legal',
    mimeType: 'application/pdf',
    size: 512000,
    uploadedAt: '2024-12-10T14:20:00Z',
    uploadedBy: {
      id: 'patient-1',
      name: 'John Doe',
      role: 'patient'
    },
    lastModified: '2024-12-10T14:20:00Z',
    version: 2,
    tags: ['consent', 'treatment', 'legal'],
    description: 'Signed consent for psychological treatment',
    confidentialityLevel: 'confidential',
    encryptionStatus: 'encrypted',
    sharingPermissions: {
      patient: true,
      professional: true,
      emergency: true,
      external: false
    },
    auditTrail: [
      {
        id: 'audit-2',
        action: 'upload',
        userId: 'patient-1',
        userName: 'John Doe',
        timestamp: '2024-12-10T14:20:00Z',
        reason: 'Patient uploaded signed consent form'
      }
    ],
    previewAvailable: true,
    signatures: [
      {
        id: 'sig-2',
        signerId: 'patient-1',
        signerName: 'John Doe',
        signerRole: 'Patient',
        signedAt: '2024-12-10T14:15:00Z',
        signatureType: 'electronic',
        verified: true
      }
    ]
  },
  {
    id: 'doc-3',
    name: 'Blood Work Results.pdf',
    type: 'test_result',
    category: 'clinical',
    mimeType: 'application/pdf',
    size: 1024000,
    uploadedAt: '2024-12-08T09:15:00Z',
    uploadedBy: {
      id: 'external-1',
      name: 'Quebec Health Lab',
      role: 'external'
    },
    lastModified: '2024-12-08T09:15:00Z',
    version: 1,
    tags: ['lab', 'blood', 'results'],
    description: 'Routine blood work analysis',
    confidentialityLevel: 'phi',
    encryptionStatus: 'encrypted',
    sharingPermissions: {
      patient: true,
      professional: true,
      emergency: true,
      external: false
    },
    auditTrail: [
      {
        id: 'audit-3',
        action: 'upload',
        userId: 'external-1',
        userName: 'Quebec Health Lab',
        timestamp: '2024-12-08T09:15:00Z',
        reason: 'Lab results electronically submitted'
      }
    ],
    previewAvailable: true
  }
]

const PatientDocuments: React.FC<PatientDocumentsProps> = ({
  patient,
  isOpen,
  onClose,
  onDocumentView,
  onDocumentDownload,
  onDocumentUpload,
  onDocumentDelete,
  canManageDocuments = false,
  canViewConfidential = false
}) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>(mockDocuments)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all')
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewModal = useDisclosure()
  const deleteModal = useDisclosure()
  const shareModal = useDisclosure()

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      // Apply confidentiality filtering
      if (doc.confidentialityLevel === 'phi' && !canViewConfidential) {
        return false
      }

      // Apply search filter
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false
      }

      // Apply category filter
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false
      }

      // Apply type filter
      if (selectedType !== 'all' && doc.type !== selectedType) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'size':
          comparison = a.size - b.size
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentIcon = (mimeType: string, type: DocumentType) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />
    if (mimeType.startsWith('video/')) return <VideoIcon className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getConfidentialityColor = (level: string) => {
    switch (level) {
      case 'public': return 'success'
      case 'confidential': return 'warning'
      case 'restricted': return 'danger'
      case 'phi': return 'secondary'
      default: return 'default'
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Mock upload completion
    setTimeout(() => {
      const newDocument: DocumentMetadata = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: 'other',
        category: 'personal',
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: {
          id: 'current-user',
          name: 'Current User',
          role: 'professional'
        },
        lastModified: new Date().toISOString(),
        version: 1,
        tags: [],
        confidentialityLevel: 'confidential',
        encryptionStatus: 'encrypted',
        sharingPermissions: {
          patient: true,
          professional: true,
          emergency: false,
          external: false
        },
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            action: 'upload',
            userId: 'current-user',
            userName: 'Current User',
            timestamp: new Date().toISOString(),
            reason: 'Document uploaded via patient portal'
          }
        ],
        previewAvailable: file.type.startsWith('image/') || file.type === 'application/pdf'
      }

      setDocuments(prev => [newDocument, ...prev])

      // Audit the upload
      console.log('Document uploaded:', {
        patientId: patient.id,
        documentId: newDocument.id,
        fileName: file.name,
        timestamp: new Date().toISOString()
      })

      clearInterval(progressInterval)
      setIsUploading(false)
      setUploadProgress(0)
    }, 2000)
  }

  const handleDocumentAction = (action: string, doc: DocumentMetadata) => {
    // Audit all document actions
    console.log(`Document ${action}:`, {
      patientId: patient.id,
      documentId: doc.id,
      documentName: doc.name,
      action,
      timestamp: new Date().toISOString()
    })

    switch (action) {
      case 'view':
        onDocumentView?.(doc.id)
        setSelectedDoc(doc)
        previewModal.onOpen()
        break
      case 'download':
        onDocumentDownload?.(doc.id)
        break
      case 'delete':
        setSelectedDoc(doc)
        deleteModal.onOpen()
        break
      case 'share':
        setSelectedDoc(doc)
        shareModal.onOpen()
        break
    }
  }

  const confirmDelete = () => {
    if (selectedDoc) {
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDoc.id))
      onDocumentDelete?.(selectedDoc.id)

      // Audit deletion
      console.log('Document deleted:', {
        patientId: patient.id,
        documentId: selectedDoc.id,
        documentName: selectedDoc.name,
        timestamp: new Date().toISOString()
      })
    }
    deleteModal.onClose()
    setSelectedDoc(null)
  }

  return (
    <>
      <Modal
        size="5xl"
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "p-0"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Documents</h2>
                  <p className="text-sm text-default-500">
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canManageDocuments && (
                  <HealthcareButton
                    color="primary"
                    startContent={<Upload className="w-4 h-4" />}
                    onPress={() => fileInputRef.current?.click()}
                    isDisabled={isUploading}
                  >
                    Upload
                  </HealthcareButton>
                )}
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="px-6">
            {/* Upload Progress */}
            {isUploading && (
              <Card className="mb-4">
                <CardBody className="py-3">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Uploading document...</p>
                      <Progress
                        value={uploadProgress}
                        className="mt-2"
                        color="primary"
                        size="sm"
                      />
                    </div>
                    <span className="text-sm text-default-500">{uploadProgress}%</span>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                clearable
              />

              <Select
                placeholder="Category"
                selectedKeys={selectedCategory === 'all' ? [] : [selectedCategory]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  setSelectedCategory(key as DocumentCategory || 'all')
                }}
              >
                <SelectItem key="all">All Categories</SelectItem>
                <SelectItem key="clinical">Clinical</SelectItem>
                <SelectItem key="administrative">Administrative</SelectItem>
                <SelectItem key="legal">Legal</SelectItem>
                <SelectItem key="billing">Billing</SelectItem>
                <SelectItem key="personal">Personal</SelectItem>
                <SelectItem key="emergency">Emergency</SelectItem>
              </Select>

              <Select
                placeholder="Type"
                selectedKeys={selectedType === 'all' ? [] : [selectedType]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  setSelectedType(key as DocumentType || 'all')
                }}
              >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="medical_record">Medical Record</SelectItem>
                <SelectItem key="test_result">Test Result</SelectItem>
                <SelectItem key="prescription">Prescription</SelectItem>
                <SelectItem key="consent_form">Consent Form</SelectItem>
                <SelectItem key="treatment_plan">Treatment Plan</SelectItem>
                <SelectItem key="referral">Referral</SelectItem>
                <SelectItem key="image">Image</SelectItem>
                <SelectItem key="other">Other</SelectItem>
              </Select>

              <Select
                placeholder="Sort by"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  setSortBy(key as 'name' | 'date' | 'type' | 'size')
                }}
              >
                <SelectItem key="date">Date</SelectItem>
                <SelectItem key="name">Name</SelectItem>
                <SelectItem key="type">Type</SelectItem>
                <SelectItem key="size">Size</SelectItem>
              </Select>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              {filteredDocuments.length === 0 ? (
                <Card>
                  <CardBody className="text-center py-8">
                    <FileText className="w-12 h-12 text-default-300 mx-auto mb-3" />
                    <p className="text-default-500">No documents found</p>
                    {searchQuery && (
                      <p className="text-sm text-default-400 mt-1">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </CardBody>
                </Card>
              ) : (
                filteredDocuments.map((doc) => (
                  <HealthcareCard key={doc.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getDocumentIcon(doc.mimeType, doc.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{doc.name}</h3>
                            <Chip
                              size="sm"
                              color={getConfidentialityColor(doc.confidentialityLevel)}
                              variant="flat"
                            >
                              {doc.confidentialityLevel.toUpperCase()}
                            </Chip>
                            {doc.encryptionStatus === 'encrypted' && (
                              <Tooltip content="Encrypted">
                                <Shield className="w-3 h-3 text-success" />
                              </Tooltip>
                            )}
                            {doc.signatures && doc.signatures.length > 0 && (
                              <Tooltip content="Signed document">
                                <CheckCircle className="w-3 h-3 text-success" />
                              </Tooltip>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-default-500 mb-2">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>{formatDate(doc.uploadedAt)}</span>
                            <span>by {doc.uploadedBy.name}</span>
                            <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                          </div>

                          {doc.description && (
                            <p className="text-sm text-default-600 mb-2">{doc.description}</p>
                          )}

                          {doc.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {doc.tags.map((tag, index) => (
                                <Chip key={index} size="sm" variant="flat" color="default">
                                  {tag}
                                </Chip>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.previewAvailable && (
                          <HealthcareButton
                            size="sm"
                            variant="flat"
                            isIconOnly
                            onPress={() => handleDocumentAction('view', doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </HealthcareButton>
                        )}

                        <HealthcareButton
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => handleDocumentAction('download', doc)}
                        >
                          <Download className="w-4 h-4" />
                        </HealthcareButton>

                        {canManageDocuments && (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                size="sm"
                                variant="flat"
                                isIconOnly
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key="share"
                                startContent={<Share2 className="w-4 h-4" />}
                                onPress={() => handleDocumentAction('share', doc)}
                              >
                                Share
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Trash2 className="w-4 h-4" />}
                                onPress={() => handleDocumentAction('delete', doc)}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    </div>
                  </HealthcareCard>
                ))
              )}
            </div>
          </ModalBody>

          <ModalFooter className="px-6 py-4">
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
        aria-label="Upload document"
      />

      {/* Document Preview Modal */}
      <Modal
        size="4xl"
        isOpen={previewModal.isOpen}
        onClose={previewModal.onClose}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">{selectedDoc?.name}</h3>
                <p className="text-sm text-default-500">Document Preview</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedDoc && (
              <div className="space-y-4">
                <Card>
                  <CardBody>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 capitalize">{selectedDoc.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2 capitalize">{selectedDoc.category}</span>
                      </div>
                      <div>
                        <span className="font-medium">Size:</span>
                        <span className="ml-2">{formatFileSize(selectedDoc.size)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Uploaded:</span>
                        <span className="ml-2">{formatDate(selectedDoc.uploadedAt)}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Signatures */}
                {selectedDoc.signatures && selectedDoc.signatures.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h4 className="font-medium">Digital Signatures</h4>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {selectedDoc.signatures.map((signature) => (
                          <div key={signature.id} className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${signature.verified ? 'bg-success' : 'bg-danger'}`} />
                              <div>
                                <p className="font-medium">{signature.signerName}</p>
                                <p className="text-sm text-default-500">{signature.signerRole}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatDate(signature.signedAt)}</p>
                              <p className="text-xs text-default-500 capitalize">{signature.signatureType}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Audit Trail */}
                <Card>
                  <CardHeader>
                    <h4 className="font-medium">Document History</h4>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {selectedDoc.auditTrail.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 p-3 bg-default-50 rounded-lg">
                          <div className="mt-1">
                            <Clock className="w-4 h-4 text-default-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">{entry.action}</span>
                              <span className="text-sm text-default-500">by {entry.userName}</span>
                            </div>
                            <p className="text-sm text-default-600">{formatDate(entry.timestamp)}</p>
                            {entry.reason && (
                              <p className="text-sm text-default-500 mt-1">{entry.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={previewModal.onClose}>
              Close
            </Button>
            {selectedDoc && (
              <HealthcareButton
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                onPress={() => handleDocumentAction('download', selectedDoc)}
              >
                Download
              </HealthcareButton>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <span>Delete Document</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete <strong>{selectedDoc?.name}</strong>?
            </p>
            <p className="text-sm text-danger">
              This action cannot be undone and will be logged for audit purposes.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={deleteModal.onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PatientDocuments