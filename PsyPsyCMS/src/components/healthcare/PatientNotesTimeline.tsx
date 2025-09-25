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
  Textarea,
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
  useDisclosure,
  Switch,
  RadioGroup,
  Radio
} from '@nextui-org/react'
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Save,
  X,
  Hash,
  Tag,
  Archive,
  Star,
  Flag,
  Paperclip,
  Download,
  Share2,
  Copy,
  BookOpen,
  Stethoscope,
  Brain,
  Heart,
  Activity
} from 'lucide-react'
import { HealthcareCard, HealthcareButton } from '../ui/healthcare-components'

interface ClinicalNote {
  id: string
  type: NoteType
  category: NoteCategory
  title: string
  content: string
  authorId: string
  authorName: string
  authorRole: string
  createdAt: string
  lastModified: string
  sessionId?: string
  sessionDate?: string
  sessionDuration?: number
  tags: string[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'completed' | 'reviewed' | 'signed' | 'amended'
  confidentialityLevel: 'standard' | 'confidential' | 'restricted'
  containsPHI: boolean
  linkedAppointmentId?: string
  attachments: NoteAttachment[]
  templateUsed?: string
  signatures: NoteSignature[]
  amendments: NoteAmendment[]
  reviewers: NoteReviewer[]
  sharePermissions: {
    patient: boolean
    careTeam: boolean
    supervisor: boolean
    external: boolean
  }
  auditTrail: NoteAuditEntry[]
  metadata: {
    wordCount: number
    readingTime: number
    complexity: 'simple' | 'moderate' | 'complex'
    requiresFollowUp: boolean
    followUpDate?: string
  }
}

interface NoteAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
}

interface NoteSignature {
  id: string
  signerId: string
  signerName: string
  signerRole: string
  signedAt: string
  signatureType: 'electronic' | 'digital'
  verified: boolean
}

interface NoteAmendment {
  id: string
  amendedBy: string
  amendedAt: string
  reason: string
  originalContent: string
  newContent: string
}

interface NoteReviewer {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerRole: string
  reviewedAt: string
  status: 'pending' | 'approved' | 'requires_changes'
  comments?: string
}

interface NoteAuditEntry {
  id: string
  action: 'create' | 'view' | 'edit' | 'sign' | 'amend' | 'share' | 'export'
  userId: string
  userName: string
  timestamp: string
  ipAddress?: string
  details?: string
}

type NoteType =
  | 'session_note'
  | 'assessment'
  | 'treatment_plan'
  | 'progress_note'
  | 'crisis_note'
  | 'consultation'
  | 'discharge_summary'
  | 'referral_note'
  | 'medication_note'
  | 'family_session'
  | 'group_session'
  | 'supervision_note'

type NoteCategory =
  | 'therapeutic'
  | 'diagnostic'
  | 'administrative'
  | 'emergency'
  | 'follow_up'
  | 'consultation'
  | 'supervision'

interface Patient {
  id: string
  firstName: string
  lastName: string
}

interface PatientNotesTimelineProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
  onNoteCreate?: (note: Partial<ClinicalNote>) => void
  onNoteEdit?: (noteId: string, updates: Partial<ClinicalNote>) => void
  onNoteSign?: (noteId: string) => void
  onNoteShare?: (noteId: string, permissions: any) => void
  canCreateNotes?: boolean
  canEditNotes?: boolean
  canSignNotes?: boolean
  canViewAllNotes?: boolean
  userRole?: 'professional' | 'supervisor' | 'admin'
}

// Quebec-specific note templates
const quebecNoteTemplates = {
  session_note: `SÉANCE THÉRAPEUTIQUE / THERAPEUTIC SESSION

Date: [DATE]
Durée: [DURATION]
Type de séance: [SESSION_TYPE]

OBJECTIFS DE LA SÉANCE / SESSION OBJECTIVES:
[OBJECTIVES]

CONTENU DE LA SÉANCE / SESSION CONTENT:
[CONTENT]

OBSERVATIONS CLINIQUES / CLINICAL OBSERVATIONS:
[OBSERVATIONS]

PLAN D'INTERVENTION / INTERVENTION PLAN:
[INTERVENTION_PLAN]

SUIVI REQUIS / FOLLOW-UP REQUIRED:
[FOLLOW_UP]

Signature: [SIGNATURE]
Date: [SIGNATURE_DATE]`,

  assessment: `ÉVALUATION CLINIQUE / CLINICAL ASSESSMENT

MOTIF DE CONSULTATION / REASON FOR CONSULTATION:
[REASON]

HISTOIRE PRÉSENTE / PRESENT HISTORY:
[PRESENT_HISTORY]

ANTÉCÉDENTS / BACKGROUND:
[BACKGROUND]

EXAMEN MENTAL / MENTAL STATUS EXAMINATION:
[MENTAL_STATUS]

DIAGNOSTIC PRÉLIMINAIRE / PRELIMINARY DIAGNOSIS:
[DIAGNOSIS]

RECOMMANDATIONS / RECOMMENDATIONS:
[RECOMMENDATIONS]

PLAN DE TRAITEMENT / TREATMENT PLAN:
[TREATMENT_PLAN]`
}

// Mock notes data
const mockNotes: ClinicalNote[] = [
  {
    id: 'note-1',
    type: 'session_note',
    category: 'therapeutic',
    title: 'Session thérapeutique individuelle #8',
    content: `SÉANCE THÉRAPEUTIQUE INDIVIDUELLE

Date: 15 décembre 2024
Durée: 50 minutes
Type: Thérapie cognitivo-comportementale

OBJECTIFS DE LA SÉANCE:
- Réviser les techniques de gestion de l'anxiété
- Discuter des progrès depuis la dernière séance
- Planifier les activités d'exposition graduée

CONTENU DE LA SÉANCE:
Le client a rapporté une amélioration significative dans la gestion de ses symptômes anxieux. Nous avons pratiqué les techniques de respiration profonde et de relaxation musculaire progressive. Discussion sur l'application pratique des stratégies cognitives dans les situations quotidiennes.

OBSERVATIONS CLINIQUES:
- Humeur stable et positive
- Diminution notable des symptômes d'anxiété
- Amélioration de la confiance en soi
- Engagement actif dans le processus thérapeutique

PLAN D'INTERVENTION:
- Continuer la pratique des techniques de relaxation
- Initier l'exposition graduée aux situations anxiogènes
- Travail sur la restructuration cognitive

SUIVI REQUIS:
Prochaine séance dans une semaine. Exercices à domicile: journal des pensées anxieuses et pratique quotidienne de relaxation.`,
    authorId: 'prof-1',
    authorName: 'Dr. Sarah Wilson',
    authorRole: 'Psychologue clinicienne',
    createdAt: '2024-12-15T14:30:00Z',
    lastModified: '2024-12-15T14:30:00Z',
    sessionId: 'session-8',
    sessionDate: '2024-12-15T14:00:00Z',
    sessionDuration: 50,
    tags: ['anxiété', 'TCC', 'progrès', 'techniques_relaxation'],
    priority: 'normal',
    status: 'signed',
    confidentialityLevel: 'confidential',
    containsPHI: true,
    linkedAppointmentId: 'appt-8',
    attachments: [],
    signatures: [
      {
        id: 'sig-1',
        signerId: 'prof-1',
        signerName: 'Dr. Sarah Wilson',
        signerRole: 'Psychologue clinicienne',
        signedAt: '2024-12-15T15:00:00Z',
        signatureType: 'electronic',
        verified: true
      }
    ],
    amendments: [],
    reviewers: [],
    sharePermissions: {
      patient: false,
      careTeam: true,
      supervisor: true,
      external: false
    },
    auditTrail: [
      {
        id: 'audit-1',
        action: 'create',
        userId: 'prof-1',
        userName: 'Dr. Sarah Wilson',
        timestamp: '2024-12-15T14:30:00Z',
        details: 'Note créée après la séance thérapeutique'
      }
    ],
    metadata: {
      wordCount: 245,
      readingTime: 2,
      complexity: 'moderate',
      requiresFollowUp: true,
      followUpDate: '2024-12-22T14:00:00Z'
    }
  },
  {
    id: 'note-2',
    type: 'assessment',
    category: 'diagnostic',
    title: 'Évaluation initiale complète',
    content: `ÉVALUATION CLINIQUE INITIALE

MOTIF DE CONSULTATION:
Le client consulte pour des symptômes d'anxiété généralisée qui interfèrent avec son fonctionnement quotidien et professionnel depuis environ 6 mois.

HISTOIRE PRÉSENTE:
Début graduel des symptômes d'anxiété il y a 6 mois, coïncidant avec un changement d'emploi. Symptômes incluent inquiétudes excessives, tension musculaire, fatigue, et difficultés de concentration.

ANTÉCÉDENTS:
- Aucun antécédent psychiatrique personnel
- Antécédents familiaux: anxiété chez la mère
- Aucune médication actuelle
- Bon support social

EXAMEN MENTAL:
- Présentation soignée, contact approprié
- Humeur anxieuse, affect congruent
- Pensée organisée, pas d'idées délirantes
- Aucune idéation suicidaire ou homicidaire
- Insight et jugement préservés

DIAGNOSTIC PRÉLIMINAIRE:
F41.1 - Trouble anxieux généralisé

RECOMMANDATIONS:
- Thérapie cognitivo-comportementale
- Techniques de gestion du stress
- Réévaluation dans 4 semaines

PLAN DE TRAITEMENT:
Séances hebdomadaires de TCC pendant 12-16 semaines avec focus sur la restructuration cognitive et techniques de relaxation.`,
    authorId: 'prof-1',
    authorName: 'Dr. Sarah Wilson',
    authorRole: 'Psychologue clinicienne',
    createdAt: '2024-11-01T10:00:00Z',
    lastModified: '2024-11-01T10:00:00Z',
    sessionId: 'session-1',
    sessionDate: '2024-11-01T09:00:00Z',
    sessionDuration: 90,
    tags: ['évaluation', 'anxiété', 'diagnostic', 'F41.1'],
    priority: 'high',
    status: 'signed',
    confidentialityLevel: 'confidential',
    containsPHI: true,
    linkedAppointmentId: 'appt-1',
    attachments: [],
    signatures: [
      {
        id: 'sig-2',
        signerId: 'prof-1',
        signerName: 'Dr. Sarah Wilson',
        signerRole: 'Psychologue clinicienne',
        signedAt: '2024-11-01T11:00:00Z',
        signatureType: 'electronic',
        verified: true
      }
    ],
    amendments: [],
    reviewers: [],
    sharePermissions: {
      patient: false,
      careTeam: true,
      supervisor: true,
      external: false
    },
    auditTrail: [
      {
        id: 'audit-2',
        action: 'create',
        userId: 'prof-1',
        userName: 'Dr. Sarah Wilson',
        timestamp: '2024-11-01T10:00:00Z',
        details: 'Évaluation initiale complétée'
      }
    ],
    metadata: {
      wordCount: 298,
      readingTime: 3,
      complexity: 'complex',
      requiresFollowUp: true,
      followUpDate: '2024-11-29T09:00:00Z'
    }
  },
  {
    id: 'note-3',
    type: 'progress_note',
    category: 'therapeutic',
    title: 'Note de progrès - Mi-traitement',
    content: `NOTE DE PROGRÈS - ÉVALUATION MI-TRAITEMENT

Séance #6 de 12-16 planifiées
Date: 6 décembre 2024

PROGRÈS OBSERVÉS:
Le client démontre des améliorations significatives dans plusieurs domaines:
- Réduction de 40% des symptômes d'anxiété (échelle GAD-7: 15 → 9)
- Amélioration du sommeil et de la concentration
- Application réussie des techniques de relaxation
- Meilleure gestion des situations stressantes au travail

OBJECTIFS ATTEINTS:
✓ Acquisition des techniques de respiration profonde
✓ Identification des pensées automatiques négatives
✓ Développement de stratégies d'adaptation
✓ Amélioration de la confiance en soi

OBJECTIFS EN COURS:
- Consolidation des acquis
- Exposition graduée aux situations anxiogènes
- Prévention de la rechute

RECOMMANDATIONS:
Continuer le traitement tel que planifié. Excellente progression, pronostic favorable.

PROCHAINES ÉTAPES:
- Sessions 7-12: Consolidation et prévention rechute
- Espacement graduel des séances
- Plan de maintien post-traitement`,
    authorId: 'prof-1',
    authorName: 'Dr. Sarah Wilson',
    authorRole: 'Psychologue clinicienne',
    createdAt: '2024-12-06T15:30:00Z',
    lastModified: '2024-12-06T15:30:00Z',
    sessionId: 'session-6',
    sessionDate: '2024-12-06T14:00:00Z',
    sessionDuration: 50,
    tags: ['progrès', 'mi-traitement', 'amélioration', 'GAD-7'],
    priority: 'normal',
    status: 'signed',
    confidentialityLevel: 'confidential',
    containsPHI: true,
    linkedAppointmentId: 'appt-6',
    attachments: [],
    signatures: [
      {
        id: 'sig-3',
        signerId: 'prof-1',
        signerName: 'Dr. Sarah Wilson',
        signerRole: 'Psychologue clinicienne',
        signedAt: '2024-12-06T16:00:00Z',
        signatureType: 'electronic',
        verified: true
      }
    ],
    amendments: [],
    reviewers: [
      {
        id: 'rev-1',
        reviewerId: 'supervisor-1',
        reviewerName: 'Dr. Michel Tremblay',
        reviewerRole: 'Superviseur clinique',
        reviewedAt: '2024-12-07T09:00:00Z',
        status: 'approved',
        comments: 'Excellent progrès documenté. Approche thérapeutique appropriée.'
      }
    ],
    sharePermissions: {
      patient: false,
      careTeam: true,
      supervisor: true,
      external: false
    },
    auditTrail: [
      {
        id: 'audit-3',
        action: 'create',
        userId: 'prof-1',
        userName: 'Dr. Sarah Wilson',
        timestamp: '2024-12-06T15:30:00Z',
        details: 'Note de progrès mi-traitement'
      }
    ],
    metadata: {
      wordCount: 198,
      readingTime: 2,
      complexity: 'moderate',
      requiresFollowUp: true,
      followUpDate: '2024-12-13T14:00:00Z'
    }
  }
]

const PatientNotesTimeline: React.FC<PatientNotesTimelineProps> = ({
  patient,
  isOpen,
  onClose,
  onNoteCreate,
  onNoteEdit,
  onNoteSign,
  onNoteShare,
  canCreateNotes = false,
  canEditNotes = false,
  canSignNotes = false,
  canViewAllNotes = false,
  userRole = 'professional'
}) => {
  const [notes, setNotes] = useState<ClinicalNote[]>(mockNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all')
  const [selectedType, setSelectedType] = useState<NoteType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ClinicalNote['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status' | 'priority'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'cards'>('timeline')
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [newNote, setNewNote] = useState<Partial<ClinicalNote>>({
    type: 'session_note',
    category: 'therapeutic',
    title: '',
    content: '',
    tags: [],
    priority: 'normal',
    confidentialityLevel: 'confidential',
    containsPHI: true
  })

  const noteModal = useDisclosure()
  const createModal = useDisclosure()
  const previewModal = useDisclosure()

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      // Apply search filter
      if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !note.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false
      }

      // Apply category filter
      if (selectedCategory !== 'all' && note.category !== selectedCategory) {
        return false
      }

      // Apply type filter
      if (selectedType !== 'all' && note.type !== selectedType) {
        return false
      }

      // Apply status filter
      if (selectedStatus !== 'all' && note.status !== selectedStatus) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'priority':
          const priorityOrder = { low: 0, normal: 1, high: 2, urgent: 3 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNoteTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'session_note': return <MessageSquare className="w-4 h-4" />
      case 'assessment': return <Stethoscope className="w-4 h-4" />
      case 'treatment_plan': return <BookOpen className="w-4 h-4" />
      case 'progress_note': return <Activity className="w-4 h-4" />
      case 'crisis_note': return <AlertTriangle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'default'
      case 'normal': return 'primary'
      case 'high': return 'warning'
      case 'urgent': return 'danger'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default'
      case 'completed': return 'success'
      case 'reviewed': return 'primary'
      case 'signed': return 'success'
      case 'amended': return 'warning'
      default: return 'default'
    }
  }

  const handleNoteAction = (action: string, note: ClinicalNote) => {
    // Audit all note actions
    console.log(`Note ${action}:`, {
      patientId: patient.id,
      noteId: note.id,
      noteTitle: note.title,
      action,
      timestamp: new Date().toISOString()
    })

    switch (action) {
      case 'view':
        setSelectedNote(note)
        previewModal.onOpen()
        break
      case 'edit':
        setSelectedNote(note)
        setNewNote(note)
        createModal.onOpen()
        break
      case 'sign':
        onNoteSign?.(note.id)
        // Update note status
        setNotes(prev => prev.map(n =>
          n.id === note.id
            ? { ...n, status: 'signed' as const }
            : n
        ))
        break
      case 'share':
        onNoteShare?.(note.id, note.sharePermissions)
        break
    }
  }

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) return

    const noteToCreate: ClinicalNote = {
      id: `note-${Date.now()}`,
      type: newNote.type || 'session_note',
      category: newNote.category || 'therapeutic',
      title: newNote.title,
      content: newNote.content,
      authorId: 'current-user',
      authorName: 'Current User',
      authorRole: userRole === 'professional' ? 'Psychologue' : 'Superviseur',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: newNote.tags || [],
      priority: newNote.priority || 'normal',
      status: 'draft',
      confidentialityLevel: newNote.confidentialityLevel || 'confidential',
      containsPHI: newNote.containsPHI || true,
      attachments: [],
      signatures: [],
      amendments: [],
      reviewers: [],
      sharePermissions: {
        patient: false,
        careTeam: true,
        supervisor: true,
        external: false
      },
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          action: 'create',
          userId: 'current-user',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
          details: 'Note clinique créée'
        }
      ],
      metadata: {
        wordCount: newNote.content?.split(' ').length || 0,
        readingTime: Math.ceil((newNote.content?.split(' ').length || 0) / 200),
        complexity: 'moderate',
        requiresFollowUp: false
      }
    }

    setNotes(prev => [noteToCreate, ...prev])
    onNoteCreate?.(noteToCreate)

    // Reset form
    setNewNote({
      type: 'session_note',
      category: 'therapeutic',
      title: '',
      content: '',
      tags: [],
      priority: 'normal',
      confidentialityLevel: 'confidential',
      containsPHI: true
    })

    createModal.onClose()

    // Audit note creation
    console.log('Clinical note created:', {
      patientId: patient.id,
      noteId: noteToCreate.id,
      noteType: noteToCreate.type,
      timestamp: new Date().toISOString()
    })
  }

  const useTemplate = (templateType: keyof typeof quebecNoteTemplates) => {
    const template = quebecNoteTemplates[templateType]
    setNewNote(prev => ({
      ...prev,
      content: template,
      type: templateType as NoteType
    }))
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
                  <h2 className="text-xl font-semibold">Notes cliniques</h2>
                  <p className="text-sm text-default-500">
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canCreateNotes && (
                  <HealthcareButton
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={createModal.onOpen}
                  >
                    Nouvelle note
                  </HealthcareButton>
                )}
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="px-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Input
                placeholder="Rechercher dans les notes..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                clearable
                className="md:col-span-2"
              />

              <Select
                placeholder="Catégorie"
                selectedKeys={selectedCategory === 'all' ? [] : [selectedCategory]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  setSelectedCategory(key as NoteCategory || 'all')
                }}
              >
                <SelectItem key="all">Toutes</SelectItem>
                <SelectItem key="therapeutic">Thérapeutique</SelectItem>
                <SelectItem key="diagnostic">Diagnostique</SelectItem>
                <SelectItem key="administrative">Administrative</SelectItem>
                <SelectItem key="emergency">Urgence</SelectItem>
                <SelectItem key="follow_up">Suivi</SelectItem>
              </Select>

              <Select
                placeholder="Type"
                selectedKeys={selectedType === 'all' ? [] : [selectedType]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  setSelectedType(key as NoteType || 'all')
                }}
              >
                <SelectItem key="all">Tous</SelectItem>
                <SelectItem key="session_note">Note de séance</SelectItem>
                <SelectItem key="assessment">Évaluation</SelectItem>
                <SelectItem key="treatment_plan">Plan de traitement</SelectItem>
                <SelectItem key="progress_note">Note de progrès</SelectItem>
                <SelectItem key="crisis_note">Note de crise</SelectItem>
              </Select>

              <Select
                placeholder="Statut"
                selectedKeys={selectedStatus === 'all' ? [] : [selectedStatus]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string
                  setSelectedStatus(key as ClinicalNote['status'] || 'all')
                }}
              >
                <SelectItem key="all">Tous</SelectItem>
                <SelectItem key="draft">Brouillon</SelectItem>
                <SelectItem key="completed">Complétée</SelectItem>
                <SelectItem key="reviewed">Révisée</SelectItem>
                <SelectItem key="signed">Signée</SelectItem>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-end mb-4">
              <Tabs
                selectedKey={viewMode}
                onSelectionChange={(key) => setViewMode(key as 'timeline' | 'list' | 'cards')}
                size="sm"
              >
                <Tab key="timeline" title="Chronologie" />
                <Tab key="list" title="Liste" />
                <Tab key="cards" title="Cartes" />
              </Tabs>
            </div>

            {/* Notes Display */}
            {filteredNotes.length === 0 ? (
              <Card>
                <CardBody className="text-center py-8">
                  <FileText className="w-12 h-12 text-default-300 mx-auto mb-3" />
                  <p className="text-default-500">Aucune note trouvée</p>
                  {searchQuery && (
                    <p className="text-sm text-default-400 mt-1">
                      Essayez d'ajuster vos critères de recherche
                    </p>
                  )}
                </CardBody>
              </Card>
            ) : viewMode === 'timeline' ? (
              <div className="space-y-6">
                {filteredNotes.map((note, index) => (
                  <div key={note.id} className="flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        note.priority === 'urgent' ? 'bg-danger-100 text-danger' :
                        note.priority === 'high' ? 'bg-warning-100 text-warning' :
                        'bg-primary-100 text-primary'
                      }`}>
                        {getNoteTypeIcon(note.type)}
                      </div>
                      {index < filteredNotes.length - 1 && (
                        <div className="w-0.5 h-16 bg-default-200 mt-2" />
                      )}
                    </div>

                    {/* Note Content */}
                    <HealthcareCard className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{note.title}</h3>
                            <Chip
                              size="sm"
                              color={getStatusColor(note.status)}
                              variant="flat"
                            >
                              {note.status}
                            </Chip>
                            <Chip
                              size="sm"
                              color={getPriorityColor(note.priority)}
                              variant="flat"
                            >
                              {note.priority}
                            </Chip>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-default-500 mb-2">
                            <span>{formatDate(note.createdAt)}</span>
                            <span>par {note.authorName}</span>
                            <span className="capitalize">{note.type.replace('_', ' ')}</span>
                            {note.sessionDuration && (
                              <span>{note.sessionDuration} min</span>
                            )}
                          </div>

                          {note.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap mb-3">
                              {note.tags.map((tag, tagIndex) => (
                                <Chip key={tagIndex} size="sm" variant="flat" color="default">
                                  {tag}
                                </Chip>
                              ))}
                            </div>
                          )}

                          <p className="text-default-600 line-clamp-3">
                            {note.content.substring(0, 200)}...
                          </p>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <HealthcareButton
                            size="sm"
                            variant="flat"
                            isIconOnly
                            onPress={() => handleNoteAction('view', note)}
                          >
                            <Eye className="w-4 h-4" />
                          </HealthcareButton>

                          {canEditNotes && note.status === 'draft' && (
                            <HealthcareButton
                              size="sm"
                              variant="flat"
                              isIconOnly
                              onPress={() => handleNoteAction('edit', note)}
                            >
                              <Edit className="w-4 h-4" />
                            </HealthcareButton>
                          )}

                          {canSignNotes && note.status === 'completed' && (
                            <HealthcareButton
                              size="sm"
                              color="primary"
                              isIconOnly
                              onPress={() => handleNoteAction('sign', note)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </HealthcareButton>
                          )}

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
                                onPress={() => handleNoteAction('share', note)}
                              >
                                Partager
                              </DropdownItem>
                              <DropdownItem
                                key="export"
                                startContent={<Download className="w-4 h-4" />}
                              >
                                Exporter
                              </DropdownItem>
                              <DropdownItem
                                key="copy"
                                startContent={<Copy className="w-4 h-4" />}
                              >
                                Copier
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>

                      {/* Note Metadata */}
                      <div className="flex items-center justify-between text-xs text-default-400 pt-3 border-t border-default-100">
                        <div className="flex items-center gap-4">
                          <span>{note.metadata.wordCount} mots</span>
                          <span>{note.metadata.readingTime} min lecture</span>
                          {note.containsPHI && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              <span>RPS</span>
                            </div>
                          )}
                        </div>
                        {note.signatures.length > 0 && (
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle className="w-3 h-3" />
                            <span>Signée</span>
                          </div>
                        )}
                      </div>
                    </HealthcareCard>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <HealthcareCard key={note.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getNoteTypeIcon(note.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{note.title}</h3>
                            <Chip
                              size="sm"
                              color={getStatusColor(note.status)}
                              variant="flat"
                            >
                              {note.status}
                            </Chip>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-default-500 mb-2">
                            <span>{formatShortDate(note.createdAt)}</span>
                            <span>{note.authorName}</span>
                            <span className="capitalize">{note.type.replace('_', ' ')}</span>
                          </div>

                          <p className="text-sm text-default-600 line-clamp-2">
                            {note.content.substring(0, 150)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <HealthcareButton
                          size="sm"
                          variant="flat"
                          isIconOnly
                          onPress={() => handleNoteAction('view', note)}
                        >
                          <Eye className="w-4 h-4" />
                        </HealthcareButton>
                      </div>
                    </div>
                  </HealthcareCard>
                ))}
              </div>
            )}
          </ModalBody>

          <ModalFooter className="px-6 py-4">
            <Button variant="light" onPress={onClose}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create/Edit Note Modal */}
      <Modal
        size="4xl"
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5" />
              <span>{selectedNote ? 'Modifier la note' : 'Nouvelle note clinique'}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Template Selection */}
              {!selectedNote && (
                <Card>
                  <CardHeader>
                    <h4 className="font-medium">Modèles Québec</h4>
                  </CardHeader>
                  <CardBody>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => useTemplate('session_note')}
                      >
                        Séance thérapeutique
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => useTemplate('assessment')}
                      >
                        Évaluation clinique
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type de note"
                  selectedKeys={newNote.type ? [newNote.type] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string
                    setNewNote(prev => ({ ...prev, type: key as NoteType }))
                  }}
                >
                  <SelectItem key="session_note">Note de séance</SelectItem>
                  <SelectItem key="assessment">Évaluation</SelectItem>
                  <SelectItem key="treatment_plan">Plan de traitement</SelectItem>
                  <SelectItem key="progress_note">Note de progrès</SelectItem>
                  <SelectItem key="crisis_note">Note de crise</SelectItem>
                </Select>

                <Select
                  label="Catégorie"
                  selectedKeys={newNote.category ? [newNote.category] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string
                    setNewNote(prev => ({ ...prev, category: key as NoteCategory }))
                  }}
                >
                  <SelectItem key="therapeutic">Thérapeutique</SelectItem>
                  <SelectItem key="diagnostic">Diagnostique</SelectItem>
                  <SelectItem key="administrative">Administrative</SelectItem>
                  <SelectItem key="emergency">Urgence</SelectItem>
                </Select>
              </div>

              <Input
                label="Titre de la note"
                placeholder="Ex: Séance thérapeutique #8"
                value={newNote.title || ''}
                onValueChange={(value) => setNewNote(prev => ({ ...prev, title: value }))}
                required
              />

              <Textarea
                label="Contenu"
                placeholder="Saisir le contenu de la note clinique..."
                value={newNote.content || ''}
                onValueChange={(value) => setNewNote(prev => ({ ...prev, content: value }))}
                minRows={15}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Priorité"
                  selectedKeys={newNote.priority ? [newNote.priority] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string
                    setNewNote(prev => ({ ...prev, priority: key as 'low' | 'normal' | 'high' | 'urgent' }))
                  }}
                >
                  <SelectItem key="low">Faible</SelectItem>
                  <SelectItem key="normal">Normale</SelectItem>
                  <SelectItem key="high">Élevée</SelectItem>
                  <SelectItem key="urgent">Urgente</SelectItem>
                </Select>

                <Select
                  label="Confidentialité"
                  selectedKeys={newNote.confidentialityLevel ? [newNote.confidentialityLevel] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string
                    setNewNote(prev => ({ ...prev, confidentialityLevel: key as 'standard' | 'confidential' | 'restricted' }))
                  }}
                >
                  <SelectItem key="standard">Standard</SelectItem>
                  <SelectItem key="confidential">Confidentiel</SelectItem>
                  <SelectItem key="restricted">Restreint</SelectItem>
                </Select>
              </div>

              <Input
                label="Étiquettes"
                placeholder="anxiété, TCC, progrès (séparées par des virgules)"
                value={newNote.tags?.join(', ') || ''}
                onValueChange={(value) => {
                  const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
                  setNewNote(prev => ({ ...prev, tags }))
                }}
              />

              <div className="flex items-center gap-4">
                <Switch
                  isSelected={newNote.containsPHI}
                  onValueChange={(selected) => setNewNote(prev => ({ ...prev, containsPHI: selected }))}
                >
                  Contient des RPS (Renseignements Personnels de Santé)
                </Switch>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={createModal.onClose}>
              Annuler
            </Button>
            <HealthcareButton
              color="primary"
              onPress={handleCreateNote}
              isDisabled={!newNote.title || !newNote.content}
            >
              {selectedNote ? 'Sauvegarder' : 'Créer la note'}
            </HealthcareButton>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Note Preview Modal */}
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
                <h3 className="font-semibold">{selectedNote?.title}</h3>
                <p className="text-sm text-default-500">Note clinique</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedNote && (
              <div className="space-y-6">
                {/* Note Metadata */}
                <Card>
                  <CardBody>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 capitalize">{selectedNote.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Catégorie:</span>
                        <span className="ml-2 capitalize">{selectedNote.category}</span>
                      </div>
                      <div>
                        <span className="font-medium">Statut:</span>
                        <span className="ml-2">{selectedNote.status}</span>
                      </div>
                      <div>
                        <span className="font-medium">Priorité:</span>
                        <span className="ml-2">{selectedNote.priority}</span>
                      </div>
                      <div>
                        <span className="font-medium">Créée:</span>
                        <span className="ml-2">{formatDate(selectedNote.createdAt)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Auteur:</span>
                        <span className="ml-2">{selectedNote.authorName}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Note Content */}
                <Card>
                  <CardHeader>
                    <h4 className="font-medium">Contenu</h4>
                  </CardHeader>
                  <CardBody>
                    <div className="whitespace-pre-wrap text-sm font-mono bg-default-50 p-4 rounded-lg">
                      {selectedNote.content}
                    </div>
                  </CardBody>
                </Card>

                {/* Signatures */}
                {selectedNote.signatures.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h4 className="font-medium">Signatures</h4>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        {selectedNote.signatures.map((signature) => (
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
                    <h4 className="font-medium">Historique</h4>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {selectedNote.auditTrail.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 p-3 bg-default-50 rounded-lg">
                          <div className="mt-1">
                            <Clock className="w-4 h-4 text-default-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">{entry.action}</span>
                              <span className="text-sm text-default-500">par {entry.userName}</span>
                            </div>
                            <p className="text-sm text-default-600">{formatDate(entry.timestamp)}</p>
                            {entry.details && (
                              <p className="text-sm text-default-500 mt-1">{entry.details}</p>
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
              Fermer
            </Button>
            {selectedNote && canEditNotes && selectedNote.status === 'draft' && (
              <HealthcareButton
                color="primary"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => {
                  previewModal.onClose()
                  handleNoteAction('edit', selectedNote)
                }}
              >
                Modifier
              </HealthcareButton>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PatientNotesTimeline