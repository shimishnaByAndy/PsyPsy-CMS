/**
 * Mock Data Service for PsyPsy CMS
 * Provides sample data when Parse Server is not available
 */

// Mock user data for testing
export const mockUsers = [
  {
    objectId: "client001",
    username: "client_user",
    email: "client@example.com",
    userType: 2, // Client
    emailVerified: true,
    isBlocked: false,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
    roleNames: ["Client"],
    client: {
      firstName: "Sarah",
      lastName: "Johnson",
      dob: "1990-05-15T00:00:00.000Z",
      gender: 1, // Female
      phoneNb: "(555) 123-4567",
      spokenLangArr: [0, 1], // English, French
      searchRadius: 25,
      addressObj: {
        street: "123 Main Street",
        city: "Montreal",
        province: "QC",
        postalCode: "H3A 1A1",
        country: "Canada"
      },
      geoPt: {
        latitude: 45.5017,
        longitude: -73.5673
      }
    },
    userInfo: {
      ios: {
        appV: "1.2.3",
        devMod: "iPhone 14 Pro",
        os: "iOS",
        osV: "17.1"
      }
    }
  },
  {
    objectId: "prof001",
    username: "dr_smith",
    email: "dr.smith@psypsy.com",
    userType: 1, // Professional
    emailVerified: true,
    isBlocked: false,
    createdAt: "2024-01-10T09:15:00.000Z",
    updatedAt: "2024-01-22T16:20:00.000Z",
    roleNames: ["Professional", "Verified"],
    professional: {
      firstName: "Dr. Michael",
      lastName: "Smith",
      dob: "1985-03-20T00:00:00.000Z",
      gender: 0, // Male
      motherTongue: 0, // English
      profType: 0, // Psychologist
      businessName: "Smith Psychology Clinic",
      meetType: 2, // Both in-person and online
      eduInstitute: 0, // McGill University
      bussEmail: "contact@smithpsychology.com",
      bussPhoneNb: "(514) 555-0123",
      phoneNb: {
        number: "(514) 555-0123",
        shareWithClients: true
      },
      servOfferedArr: [0, 2, 4], // Individual therapy, couples therapy, assessment
      offeredLangArr: [0, 1], // English, French
      expertises: [0, 1, 2], // Anxiety, Depression, Trauma
      servedClientele: [0, 1], // Adults, Adolescents
      thirdPartyPayers: [0, 4], // CNESST, Private Insurance
      addressObj: {
        street: "456 Psychology Ave",
        city: "Montreal",
        province: "QC",
        postalCode: "H3B 2B2",
        country: "Canada"
      },
      taxInfo: {
        gstNumber: "123456789RT0001",
        qstNumber: "1234567890TQ0001",
        businessNumber: "123456789"
      },
      partOfOrder: {
        orderName: "Ordre des psychologues du Québec",
        memberNumber: "12345",
        validUntil: "2025-12-31T23:59:59.000Z",
        status: "Active"
      },
      availability: [
        { day: 1, startTime: "09:00", endTime: "17:00" }, // Monday
        { day: 2, startTime: "09:00", endTime: "17:00" }, // Tuesday
        { day: 3, startTime: "09:00", endTime: "17:00" }, // Wednesday
        { day: 4, startTime: "09:00", endTime: "17:00" }, // Thursday
        { day: 5, startTime: "09:00", endTime: "15:00" }  // Friday
      ],
      allSubcategsArr: ["Cognitive Behavioral Therapy", "Mindfulness", "EMDR"]
    },
    userInfo: {
      web: {
        appV: "1.0.0",
        devMod: "MacBook Pro",
        os: "macOS",
        osV: "14.1"
      }
    }
  },
  {
    objectId: "admin001",
    username: "admin_user",
    email: "admin@psypsy.com",
    userType: 0, // Admin
    emailVerified: true,
    isBlocked: false,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-23T12:30:00.000Z",
    roleNames: ["Admin", "SuperUser"],
    userInfo: {
      web: {
        appV: "1.0.0",
        devMod: "iMac",
        os: "macOS",
        osV: "14.1"
      }
    }
  }
];

// Mock service functions
export const mockParseService = {
  // Get all users
  getUsers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUsers);
      }, 500); // Simulate network delay
    });
  },

  // Get user by ID
  getUserById: async (objectId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.objectId === objectId);
        resolve(user || null);
      }, 300);
    });
  },

  // Check if Parse Server is available
  isParseServerAvailable: async () => {
    try {
      const response = await fetch('http://localhost:1337/parse/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

export default mockParseService;

// Mock appointments data based on Appointment class structure
export const mockAppointments = [
  {
    objectId: "apt001",
    createdAt: "2024-01-20T10:30:00.000Z",
    updatedAt: "2024-01-22T14:45:00.000Z",
    title: "Individual Therapy Session",
    description: "Seeking help with anxiety and stress management",
    status: "confirmed",
    serviceType: 0, // Individual Therapy
    meetPref: 2, // Either
    genderPref: 1, // Female preferred
    clientAgeGroup: 3, // Adult
    maxBudget: 150,
    searchRadius: 25,
    isForClient: true,
    afterDate: new Date("2024-01-25").getTime(),
    clientName: "Sarah Johnson",
    clientEmail: "sarah.johnson@email.com",
    scheduledTimestamp: new Date("2024-01-28T14:00:00.000Z").getTime(),
    applicationCount: 5,
    consultReasonsArr: [0, 1], // Anxiety, Depression
    expertisesIndArr: [0, 11], // Anxiety Disorders, Stress Management
    langPref: [0, 1], // English, French
    thirdPartyPayer: null,
    clientNoteMsg: "Preferably someone with experience in cognitive behavioral therapy",
    tppObj: null,
    availArr: [
      { day: 1, periods: ["14:00-16:00", "18:00-20:00"] },
      { day: 3, periods: ["10:00-12:00", "14:00-16:00"] },
      { day: 5, periods: ["16:00-18:00"] }
    ],
    appliedProfIds: ["prof001", "prof002", "prof003"],
    clientAddress: {
      street: "123 Main Street",
      city: "Montreal",
      province: "QC",
      postalCode: "H3A 1A1"
    }
  },
  {
    objectId: "apt002",
    createdAt: "2024-01-19T09:15:00.000Z",
    updatedAt: "2024-01-19T09:15:00.000Z",
    title: "Couples Therapy Request",
    description: "Looking for help with relationship communication issues",
    status: "requested",
    serviceType: 2, // Couples Therapy
    meetPref: 1, // Online
    genderPref: 2, // No preference
    clientAgeGroup: 3, // Adult
    maxBudget: 200,
    searchRadius: 50,
    isForClient: false,
    afterDate: new Date("2024-02-01").getTime(),
    clientName: "Michael and Emma Thompson",
    clientEmail: "michael.thompson@email.com",
    scheduledTimestamp: null,
    applicationCount: 2,
    consultReasonsArr: [10], // Relationship Issues
    expertisesIndArr: [10], // Relationship Issues
    langPref: [0], // English
    thirdPartyPayer: null,
    clientNoteMsg: "We need evening appointments due to work schedules",
    tppObj: null,
    availArr: [
      { day: 2, periods: ["19:00-21:00"] },
      { day: 4, periods: ["19:00-21:00"] },
      { day: 6, periods: ["10:00-12:00", "14:00-16:00"] }
    ],
    appliedProfIds: ["prof002"],
    clientAddress: null // Online only
  },
  {
    objectId: "apt003",
    createdAt: "2024-01-18T16:20:00.000Z",
    updatedAt: "2024-01-21T11:30:00.000Z",
    title: "Child Psychology Assessment",
    description: "Assessment for 8-year-old with ADHD symptoms",
    status: "matched",
    serviceType: 4, // Psychological Assessment
    meetPref: 0, // In-Person
    genderPref: 2, // No preference
    clientAgeGroup: 0, // Child
    maxBudget: 500,
    searchRadius: 30,
    isForClient: false,
    afterDate: new Date("2024-01-30").getTime(),
    clientName: "Lisa Chen (for Alex Chen)",
    clientEmail: "lisa.chen@email.com",
    scheduledTimestamp: new Date("2024-02-05T10:00:00.000Z").getTime(),
    applicationCount: 3,
    consultReasonsArr: [6], // ADHD
    expertisesIndArr: [6, 7], // ADHD, Autism Spectrum Disorders
    langPref: [0, 3], // English, Mandarin
    thirdPartyPayer: 4, // Private Insurance
    clientNoteMsg: "Child is 8 years old, having difficulty focusing in school",
    tppObj: {
      providerName: "Green Shield Canada",
      policyNumber: "GSC123456789",
      coverageType: "Extended Health"
    },
    availArr: [
      { day: 1, periods: ["09:00-11:00"] },
      { day: 3, periods: ["09:00-11:00", "13:00-15:00"] },
      { day: 5, periods: ["09:00-11:00"] }
    ],
    appliedProfIds: ["prof003", "prof004"],
    clientAddress: {
      street: "456 Oak Avenue",
      city: "Toronto",
      province: "ON",
      postalCode: "M4B 2C3"
    },
    concernedPers: {
      firstName: "Alex",
      lastName: "Chen",
      dob: "2015-08-15T00:00:00.000Z",
      relationship: "child"
    }
  },
  {
    objectId: "apt004",
    createdAt: "2024-01-17T13:45:00.000Z",
    updatedAt: "2024-01-23T16:20:00.000Z",
    title: "Trauma Therapy Session",
    description: "PTSD treatment following recent accident",
    status: "completed",
    serviceType: 0, // Individual Therapy
    meetPref: 2, // Either
    genderPref: 1, // Female preferred
    clientAgeGroup: 3, // Adult
    maxBudget: 180,
    searchRadius: 40,
    isForClient: true,
    afterDate: new Date("2024-01-20").getTime(),
    clientName: "David Rodriguez",
    clientEmail: "david.rodriguez@email.com",
    scheduledTimestamp: new Date("2024-01-23T11:00:00.000Z").getTime(),
    applicationCount: 4,
    consultReasonsArr: [2], // Trauma
    expertisesIndArr: [2], // Trauma and PTSD
    langPref: [0, 2], // English, Spanish
    thirdPartyPayer: 1, // SAAQ
    clientNoteMsg: "Experienced trauma from car accident, need specialized PTSD treatment",
    tppObj: {
      providerName: "SAAQ",
      claimNumber: "SAAQ-2024-001234",
      approvalCode: "APP789"
    },
    availArr: [
      { day: 1, periods: ["11:00-13:00"] },
      { day: 2, periods: ["11:00-13:00", "15:00-17:00"] },
      { day: 4, periods: ["11:00-13:00"] }
    ],
    appliedProfIds: ["prof001", "prof005"],
    clientAddress: {
      street: "789 Pine Road",
      city: "Quebec City",
      province: "QC",
      postalCode: "G1K 3H4"
    }
  },
  {
    objectId: "apt005",
    createdAt: "2024-01-16T11:30:00.000Z",
    updatedAt: "2024-01-20T09:15:00.000Z",
    title: "Career Counseling Session",
    description: "Career transition guidance and planning",
    status: "cancelled",
    serviceType: 6, // Career Counseling
    meetPref: 1, // Online
    genderPref: 2, // No preference
    clientAgeGroup: 2, // Young Adult
    maxBudget: 120,
    searchRadius: null, // Online only
    isForClient: true,
    afterDate: new Date("2024-01-22").getTime(),
    clientName: "Jennifer Wu",
    clientEmail: "jennifer.wu@email.com",
    scheduledTimestamp: null,
    applicationCount: 1,
    consultReasonsArr: [6], // Career guidance
    expertisesIndArr: [15], // Life Transitions
    langPref: [0], // English
    thirdPartyPayer: null,
    clientNoteMsg: "Recent graduate looking for career direction in tech field",
    tppObj: null,
    availArr: [
      { day: 2, periods: ["14:00-16:00", "18:00-20:00"] },
      { day: 4, periods: ["14:00-16:00", "18:00-20:00"] },
      { day: 6, periods: ["10:00-12:00"] }
    ],
    appliedProfIds: ["prof006"],
    clientAddress: null,
    clientCancelled: {
      reason: "Found employment",
      cancelledAt: "2024-01-20T09:15:00.000Z",
      cancelledBy: "client"
    }
  },
  {
    objectId: "apt006",
    createdAt: "2024-01-21T15:20:00.000Z",
    updatedAt: "2024-01-21T15:20:00.000Z",
    title: "Family Therapy Request",
    description: "Family conflict resolution and communication improvement",
    status: "requested",
    serviceType: 3, // Family Therapy
    meetPref: 0, // In-Person
    genderPref: 2, // No preference
    clientAgeGroup: 3, // Adult
    maxBudget: 250,
    searchRadius: 20,
    isForClient: false,
    afterDate: new Date("2024-02-05").getTime(),
    clientName: "Robert and Maria Silva",
    clientEmail: "robert.silva@email.com",
    scheduledTimestamp: null,
    applicationCount: 0,
    consultReasonsArr: [10], // Relationship/Family Issues
    expertisesIndArr: [10], // Relationship Issues
    langPref: [0, 5], // English, Portuguese
    thirdPartyPayer: null,
    clientNoteMsg: "Need help with teenage children communication and family dynamics",
    tppObj: null,
    availArr: [
      { day: 6, periods: ["10:00-12:00", "14:00-16:00"] },
      { day: 0, periods: ["14:00-16:00"] }
    ],
    appliedProfIds: [],
    clientAddress: {
      street: "321 Maple Street",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6B 1A2"
    }
  }
]; 