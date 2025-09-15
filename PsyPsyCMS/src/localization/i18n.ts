/**
 * Internationalization setup for PsyPsy CMS
 * Supports English (en) and French (fr) with healthcare-specific translations
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// English translations
const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    required: 'Required',
    optional: 'Optional',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    name: 'Name',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    type: 'Type',
    description: 'Description',
    notes: 'Notes',
    actions: 'Actions'
  },

  auth: {
    login: 'Login',
    logout: 'Logout',
    email: 'Email Address',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    invalidCredentials: 'Invalid email or password',
    sessionExpired: 'Your session has expired. Please log in again.',
    loginSuccess: 'Welcome back!',
    logoutSuccess: 'You have been logged out successfully.'
  },

  navigation: {
    dashboard: 'Dashboard',
    clients: 'Clients',
    professionals: 'Professionals',
    appointments: 'Appointments',
    calendar: 'Calendar',
    notes: 'Notes & Files',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    help: 'Help'
  },

  dashboard: {
    title: 'Dashboard',
    overview: 'Overview',
    statistics: 'Statistics',
    recentActivity: 'Recent Activity',
    upcomingAppointments: 'Upcoming Appointments',
    clientStats: 'Client Statistics',
    appointmentStats: 'Appointment Statistics',
    totalClients: 'Total Clients',
    activeClients: 'Active Clients',
    newClients: 'New Clients',
    appointmentsToday: 'Appointments Today',
    appointmentsWeek: 'This Week',
    appointmentsMonth: 'This Month',
    revenue: 'Revenue',
    utilization: 'Utilization Rate',
    satisfaction: 'Client Satisfaction',
    noDataAvailable: 'No data available',
    loadingStats: 'Loading statistics...'
  },

  clients: {
    title: 'Clients',
    client: 'Client',
    clientInfo: 'Client Information',
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    medicalInfo: 'Medical Information',
    emergencyContact: 'Emergency Contact',
    insuranceInfo: 'Insurance Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    dateOfBirth: 'Date of Birth',
    age: 'Age',
    gender: 'Gender',
    language: 'Preferred Language',
    streetAddress: 'Street Address',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP Code',
    country: 'Country',
    mobilePhone: 'Mobile Phone',
    homePhone: 'Home Phone',
    workPhone: 'Work Phone',
    allergies: 'Allergies',
    medications: 'Current Medications',
    medicalConditions: 'Medical Conditions',
    bloodType: 'Blood Type',
    emergencyMedicalInfo: 'Emergency Medical Information',
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactRelationship: 'Relationship',
    emergencyContactPhone: 'Emergency Contact Phone',
    insuranceProvider: 'Insurance Provider',
    policyNumber: 'Policy Number',
    groupNumber: 'Group Number',
    effectiveDate: 'Effective Date',
    addClient: 'Add New Client',
    editClient: 'Edit Client',
    deleteClient: 'Delete Client',
    clientCreated: 'Client created successfully',
    clientUpdated: 'Client updated successfully',
    clientDeleted: 'Client deleted successfully',
    searchClients: 'Search clients...',
    noClients: 'No clients found',
    activeStatus: 'Active',
    inactiveStatus: 'Inactive',
    pendingStatus: 'Pending',
    patientSince: 'Patient since',
    assignedProfessionals: 'Care Team',
    medicalAlerts: 'Medical Alerts',
    nextAppointment: 'Next Appointment',
    viewDetails: 'View Details',
    scheduleAppointment: 'Schedule Appointment',
    sendMessage: 'Send Message',
    consentToTreatment: 'I consent to treatment and understand the treatment process',
    consentToDataSharing: 'I consent to sharing my data with healthcare providers as needed',
    communicationPreferences: 'Communication Preferences',
    emailNotifications: 'Email notifications and reminders',
    smsNotifications: 'SMS/text message reminders',
    phoneReminders: 'Phone call reminders'
  },

  professionals: {
    title: 'Professionals',
    professional: 'Professional',
    professionalInfo: 'Professional Information',
    license: 'License',
    specializations: 'Specializations',
    qualifications: 'Education & Qualifications',
    availability: 'Availability',
    schedule: 'Schedule',
    licenseNumber: 'License Number',
    licenseType: 'License Type',
    licenseStatus: 'License Status',
    licenseExpiry: 'License Expiration',
    issuingAuthority: 'Issuing Authority',
    yearsOfExperience: 'Years of Experience',
    degree: 'Degree',
    institution: 'Institution',
    graduationYear: 'Graduation Year',
    fieldOfStudy: 'Field of Study',
    psychologist: 'Psychologist',
    therapist: 'Therapist',
    psychiatrist: 'Psychiatrist',
    counselor: 'Counselor',
    socialWorker: 'Social Worker',
    activeClients: 'Active Clients',
    sessionLength: 'Session Length',
    todaysAvailability: 'Today\'s Availability',
    nextAvailable: 'Next available',
    slotsRemaining: 'slots remaining',
    noAvailabilityToday: 'No availability today',
    nextSlotTomorrow: 'Next available slot tomorrow',
    addProfessional: 'Add Professional',
    editProfessional: 'Edit Professional',
    deleteProfessional: 'Delete Professional',
    viewProfile: 'View Profile',
    licenseActive: 'Active',
    licenseExpired: 'Expired',
    licenseSuspended: 'Suspended',
    licensePending: 'Pending',
    licenseExpiringSoon: 'Expires in less than 90 days',
    licenseIssue: 'License issue'
  },

  appointments: {
    title: 'Appointments',
    appointment: 'Appointment',
    appointmentInfo: 'Appointment Information',
    scheduledDate: 'Scheduled Date',
    scheduledTime: 'Scheduled Time',
    duration: 'Duration',
    location: 'Location',
    appointmentType: 'Appointment Type',
    appointmentStatus: 'Status',
    client: 'Client',
    professional: 'Professional',
    provider: 'Provider',
    patient: 'Patient',
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noShow: 'No Show',
    rescheduled: 'Rescheduled',
    initialConsultation: 'Initial Consultation',
    therapySession: 'Therapy Session',
    assessment: 'Assessment',
    followUp: 'Follow-up',
    groupSession: 'Group Session',
    emergency: 'Emergency',
    inPerson: 'In Person',
    videoCall: 'Video Call',
    phoneCall: 'Phone Call',
    startSession: 'Start Session',
    completeSession: 'Complete Session',
    reschedule: 'Reschedule',
    today: 'Today',
    sessionCompleted: 'Session Completed',
    keyTopics: 'Key Topics',
    amount: 'Amount',
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
    addAppointment: 'Schedule Appointment',
    editAppointment: 'Edit Appointment',
    cancelAppointment: 'Cancel Appointment',
    appointmentCreated: 'Appointment scheduled successfully',
    appointmentUpdated: 'Appointment updated successfully',
    appointmentCancelled: 'Appointment cancelled successfully',
    appointmentStarted: 'Appointment session started',
    appointmentCompleted: 'Appointment completed successfully',
    upcomingAppointments: 'Upcoming Appointments',
    todaysAppointments: 'Today\'s Appointments',
    thisWeekAppointments: 'This Week\'s Appointments',
    emergencyAppointment: 'Emergency appointment',
    sessionSummary: 'Session Summary',
    objectives: 'Session Objectives',
    interventions: 'Interventions',
    clientProgress: 'Client Progress',
    nextSteps: 'Next Steps',
    homeworkAssigned: 'Homework Assigned',
    professionalNotes: 'Professional Notes'
  },

  calendar: {
    title: 'Calendar',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    today: 'Today',
    previous: 'Previous',
    next: 'Next',
    noEvents: 'No appointments scheduled',
    viewAppointment: 'View Appointment',
    scheduleNew: 'Schedule New',
    availability: 'Availability',
    busy: 'Busy',
    available: 'Available',
    unavailable: 'Unavailable'
  },

  notes: {
    title: 'Notes & Files',
    note: 'Note',
    document: 'Document',
    sessionNotes: 'Session Notes',
    progressNotes: 'Progress Notes',
    assessmentNotes: 'Assessment Notes',
    treatmentPlan: 'Treatment Plan',
    generalNotes: 'General Notes',
    addNote: 'Add Note',
    editNote: 'Edit Note',
    deleteNote: 'Delete Note',
    uploadDocument: 'Upload Document',
    downloadDocument: 'Download Document',
    noteContent: 'Note Content',
    noteType: 'Note Type',
    tags: 'Tags',
    isPrivate: 'Private Note',
    attachments: 'Attachments',
    createdBy: 'Created by',
    lastModified: 'Last Modified',
    fileSize: 'File Size',
    fileName: 'File Name',
    fileType: 'File Type',
    noNotes: 'No notes found',
    noDocuments: 'No documents found',
    searchNotes: 'Search notes...'
  },

  settings: {
    title: 'Settings',
    userSettings: 'User Settings',
    systemSettings: 'System Settings',
    profile: 'Profile Settings',
    notifications: 'Notification Settings',
    privacy: 'Privacy Settings',
    security: 'Security Settings',
    appearance: 'Appearance',
    language: 'Language',
    timezone: 'Timezone',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemMode: 'System Default',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    smsNotifications: 'SMS Notifications',
    appointmentReminders: 'Appointment Reminders',
    systemUpdates: 'System Updates',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordChanged: 'Password changed successfully',
    settingsUpdated: 'Settings updated successfully'
  },

  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsDontMatch: 'Passwords do not match',
    invalidDate: 'Please enter a valid date',
    invalidNumber: 'Please enter a valid number',
    fileTooBig: 'File size is too large',
    invalidFileType: 'Invalid file type',
    consentRequired: 'Consent is required to proceed'
  },

  errors: {
    generic: 'An unexpected error occurred',
    networkError: 'Network connection issue. Please check your internet connection.',
    unauthorized: 'Your session has expired. Please log in again.',
    forbidden: 'You do not have permission to perform this action.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
    validationError: 'Please correct the errors and try again.',
    tryAgain: 'Please try again',
    contactSupport: 'If the problem persists, please contact support.'
  },

  success: {
    saved: 'Changes saved successfully',
    created: 'Created successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    uploaded: 'File uploaded successfully',
    sent: 'Message sent successfully'
  }
}

// French translations
const fr = {
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    update: 'Mettre à jour',
    view: 'Voir',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
    yes: 'Oui',
    no: 'Non',
    confirm: 'Confirmer',
    required: 'Obligatoire',
    optional: 'Optionnel',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    open: 'Ouvrir',
    refresh: 'Actualiser',
    export: 'Exporter',
    import: 'Importer',
    print: 'Imprimer',
    email: 'E-mail',
    phone: 'Téléphone',
    address: 'Adresse',
    name: 'Nom',
    date: 'Date',
    time: 'Heure',
    status: 'Statut',
    type: 'Type',
    description: 'Description',
    notes: 'Notes',
    actions: 'Actions'
  },

  auth: {
    login: 'Connexion',
    logout: 'Déconnexion',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    rememberMe: 'Se souvenir de moi',
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    invalidCredentials: 'E-mail ou mot de passe invalide',
    sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
    loginSuccess: 'Bon retour !',
    logoutSuccess: 'Vous avez été déconnecté avec succès.'
  },

  navigation: {
    dashboard: 'Tableau de bord',
    clients: 'Clients',
    professionals: 'Professionnels',
    appointments: 'Rendez-vous',
    calendar: 'Calendrier',
    notes: 'Notes et fichiers',
    reports: 'Rapports',
    settings: 'Paramètres',
    profile: 'Profil',
    help: 'Aide'
  },

  dashboard: {
    title: 'Tableau de bord',
    overview: 'Aperçu',
    statistics: 'Statistiques',
    recentActivity: 'Activité récente',
    upcomingAppointments: 'Prochains rendez-vous',
    clientStats: 'Statistiques des clients',
    appointmentStats: 'Statistiques des rendez-vous',
    totalClients: 'Total des clients',
    activeClients: 'Clients actifs',
    newClients: 'Nouveaux clients',
    appointmentsToday: 'Rendez-vous aujourd\'hui',
    appointmentsWeek: 'Cette semaine',
    appointmentsMonth: 'Ce mois',
    revenue: 'Revenus',
    utilization: 'Taux d\'utilisation',
    satisfaction: 'Satisfaction client',
    noDataAvailable: 'Aucune donnée disponible',
    loadingStats: 'Chargement des statistiques...'
  },

  clients: {
    title: 'Clients',
    client: 'Client',
    clientInfo: 'Informations client',
    personalInfo: 'Informations personnelles',
    contactInfo: 'Informations de contact',
    medicalInfo: 'Informations médicales',
    emergencyContact: 'Contact d\'urgence',
    insuranceInfo: 'Informations d\'assurance',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    fullName: 'Nom complet',
    dateOfBirth: 'Date de naissance',
    age: 'Âge',
    gender: 'Sexe',
    language: 'Langue préférée',
    streetAddress: 'Adresse de rue',
    city: 'Ville',
    state: 'Province/État',
    zipCode: 'Code postal',
    country: 'Pays',
    mobilePhone: 'Téléphone mobile',
    homePhone: 'Téléphone domicile',
    workPhone: 'Téléphone travail',
    allergies: 'Allergies',
    medications: 'Médicaments actuels',
    medicalConditions: 'Conditions médicales',
    bloodType: 'Type sanguin',
    emergencyMedicalInfo: 'Informations médicales d\'urgence',
    emergencyContactName: 'Nom du contact d\'urgence',
    emergencyContactRelationship: 'Relation',
    emergencyContactPhone: 'Téléphone du contact d\'urgence',
    insuranceProvider: 'Assureur',
    policyNumber: 'Numéro de police',
    groupNumber: 'Numéro de groupe',
    effectiveDate: 'Date d\'entrée en vigueur',
    addClient: 'Ajouter un client',
    editClient: 'Modifier le client',
    deleteClient: 'Supprimer le client',
    clientCreated: 'Client créé avec succès',
    clientUpdated: 'Client mis à jour avec succès',
    clientDeleted: 'Client supprimé avec succès',
    searchClients: 'Rechercher des clients...',
    noClients: 'Aucun client trouvé',
    activeStatus: 'Actif',
    inactiveStatus: 'Inactif',
    pendingStatus: 'En attente',
    patientSince: 'Patient depuis',
    assignedProfessionals: 'Équipe de soins',
    medicalAlerts: 'Alertes médicales',
    nextAppointment: 'Prochain rendez-vous',
    viewDetails: 'Voir les détails',
    scheduleAppointment: 'Planifier un rendez-vous',
    sendMessage: 'Envoyer un message',
    consentToTreatment: 'Je consens au traitement et comprends le processus de traitement',
    consentToDataSharing: 'Je consens au partage de mes données avec les fournisseurs de soins de santé si nécessaire',
    communicationPreferences: 'Préférences de communication',
    emailNotifications: 'Notifications et rappels par e-mail',
    smsNotifications: 'Rappels par SMS/texto',
    phoneReminders: 'Rappels téléphoniques'
  },

  // Continue with other sections...
  professionals: {
    title: 'Professionnels',
    // ... French translations for professionals
  },

  appointments: {
    title: 'Rendez-vous',
    // ... French translations for appointments
  },

  // ... other sections

  validation: {
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Veuillez saisir une adresse e-mail valide',
    invalidPhone: 'Veuillez saisir un numéro de téléphone valide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    invalidDate: 'Veuillez saisir une date valide',
    invalidNumber: 'Veuillez saisir un nombre valide',
    fileTooBig: 'La taille du fichier est trop importante',
    invalidFileType: 'Type de fichier invalide',
    consentRequired: 'Le consentement est requis pour continuer'
  },

  errors: {
    generic: 'Une erreur inattendue s\'est produite',
    networkError: 'Problème de connexion réseau. Veuillez vérifier votre connexion Internet.',
    unauthorized: 'Votre session a expiré. Veuillez vous reconnecter.',
    forbidden: 'Vous n\'avez pas l\'autorisation d\'effectuer cette action.',
    notFound: 'La ressource demandée n\'a pas été trouvée.',
    serverError: 'Erreur du serveur. Veuillez réessayer plus tard.',
    validationError: 'Veuillez corriger les erreurs et réessayer.',
    tryAgain: 'Veuillez réessayer',
    contactSupport: 'Si le problème persiste, veuillez contacter le support.'
  }
}

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr }
    },
    
    lng: 'en', // Default language
    fallbackLng: 'en',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'psypsy-language',
    },
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    // Development options
    debug: process.env.NODE_ENV === 'development',
    
    // Key separator (use nested keys)
    keySeparator: '.',
    
    // Namespace separator
    nsSeparator: ':',
    
    // Return empty string for missing keys in production
    returnEmptyString: process.env.NODE_ENV === 'production',
    
    // React specific options
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    }
  })

export default i18n

// Export utility functions
export const changeLanguage = (lng: 'en' | 'fr') => {
  i18n.changeLanguage(lng)
}

export const getCurrentLanguage = (): 'en' | 'fr' => {
  return i18n.language as 'en' | 'fr'
}

export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ]
}