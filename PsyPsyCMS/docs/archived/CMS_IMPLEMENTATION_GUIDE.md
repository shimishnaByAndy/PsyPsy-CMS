# PsyPsy CMS Implementation Guide
## Tauri/Rust + TanStack Query + React Frontend

This document provides complete specifications for implementing the PsyPsy admin CMS frontend to manage the Firebase backend structure.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React + TypeScript + TanStack Query
- **Desktop Framework**: Tauri (Rust backend)
- **Styling**: Tailwind CSS or Material-UI
- **State Management**: TanStack Query + React Context
- **Backend**: Firebase (Firestore + Cloud Functions + Auth)

### Project Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Main dashboard
│   ├── users/          # User management
│   ├── professionals/  # Professional management
│   ├── clients/        # Client management
│   ├── appointments/   # Appointment management
│   ├── notifications/  # Notification system
│   └── common/         # Reusable components
├── hooks/              # Custom React hooks
├── services/           # Firebase integration
├── types/              # TypeScript interfaces
├── utils/              # Utility functions
└── stores/             # Context/state management
```

## 🔐 Authentication & Authorization

### User Roles & Permissions
```typescript
enum UserType {
  ADMIN = 0,
  PROFESSIONAL = 1,
  CLIENT = 2
}

interface AuthUser {
  uid: string;
  email: string;
  userType: UserType;
  role: 'admin' | 'professional' | 'client';
  isBlocked: boolean;
  onboardingComplete: boolean;
  customClaims: {
    userType: number;
    role: string;
    isBlocked: boolean;
    onboardingComplete: boolean;
  };
}
```

### Firebase Auth Configuration
```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  // Development (Local Emulator)
  projectId: 'psypsy-dev-local',
  // Production will use actual Canadian project
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9880');
  connectFirestoreEmulator(db, 'localhost', 9881);
  connectFunctionsEmulator(functions, 'localhost', 8780);
}
```

## 📊 Database Schema & TypeScript Interfaces

### Core User Interface
```typescript
// src/types/user.ts
export interface User {
  uid: string;
  email: string;
  userType: UserType;
  role: 'admin' | 'professional' | 'client';
  isActive: boolean;
  isBlocked: boolean;
  onboardingComplete: boolean;
  lastLogin: Date;
  deviceTokens: string[];
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Professional Interface
```typescript
// src/types/professional.ts
export interface Professional {
  id: string; // Same as user UID
  userId: string;

  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 0 | 1 | 2 | 3; // Male, Female, Other, PreferNotToSay
    motherTongue: string;
    phoneNumber: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };

  professionalInfo: {
    type: number; // Professional type code
    licenseNumber: string;
    licenseExpiry: Date;
    isVerified: boolean;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationDate: Date;
    orderMembership: {
      orderName: string;
      membershipNumber: string;
      isActive: boolean;
      expiryDate: Date;
    };
    education: {
      institution: string;
      degree: string;
      graduationYear: number;
      additionalCertifications: string[];
    };
  };

  businessInfo: {
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    businessAddress: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
      coordinates: { lat: number; lng: number };
    };
    taxInfo: {
      gstNumber: string;
      qstNumber: string;
      businessNumber: string;
    };
  };

  services: {
    offeredServices: number[];
    specialties: string[];
    subSpecialties: string[];
    clientGroups: string[];
    sessionTypes: string[];
    languages: string[];
    meetingTypes: string[];
    thirdPartyPayers: string[];
  };

  availability: {
    workingHours: {
      [key: string]: { start: string; end: string; available: boolean };
    };
    timeZone: string;
    sessionDuration: number;
    bufferTime: number;
    advanceBooking: number;
    maxDailyAppointments: number;
    acceptingNewClients: boolean;
  };

  pricing: {
    hourlyRate: number;
    sessionRate: number;
    currency: string;
    slidingScale: boolean;
    minRate?: number;
    maxRate?: number;
    acceptsInsurance: boolean;
  };

  profile: {
    bio: string;
    approach: string;
    profilePhoto?: string;
    credentials: string[];
    experience: number;
    languages: string[];
    website?: string;
    linkedIn?: string;
  };

  metrics: {
    rating: number;
    reviewCount: number;
    responseTime: number;
    acceptanceRate: number;
    completionRate: number;
    totalSessions: number;
    joinDate: Date;
  };

  status: {
    isOnline: boolean;
    lastSeen: Date;
    currentlyAcceptingClients: boolean;
    vacationMode: boolean;
    vacationUntil?: Date;
    statusMessage?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### Client Interface
```typescript
// src/types/client.ts
export interface Client {
  id: string; // Same as user UID
  userId: string;

  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    age: number;
    gender: 0 | 1 | 2 | 3;
    phoneNumber: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };

  location: {
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
      coordinates: { lat: number; lng: number };
    };
    searchRadius: number;
    preferredLocations: string[];
  };

  preferences: {
    languages: string[];
    genderPreference: number;
    agePreference: string;
    meetingType: 'in-person' | 'online' | 'either';
    sessionType: string;
    timePreferences: {
      preferredDays: string[];
      preferredTimes: string[];
      timezone: string;
    };
    specialRequirements: string[];
  };

  wellness: {
    concerns: string[];
    previousTherapy: boolean;
    medications: boolean;
    emergencyContacts: string[];
    allergies: string[];
    medicalConditions: string[];
  };

  insurance: {
    hasInsurance: boolean;
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    preferredPaymentMethod: string;
    maxBudget: number;
  };

  consent: {
    dataProcessing: boolean;
    communication: boolean;
    marketing: boolean;
    shareWithProfessional: boolean;
    consentDate: Date;
  };

  metrics: {
    totalSessions: number;
    totalAppointments: number;
    averageRating: number;
    lastAppointment?: Date;
    joinDate: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### Appointment Interface
```typescript
// src/types/appointment.ts
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  professionalId?: string;
  professionalName?: string;

  details: {
    type: 'consultation' | 'therapy' | 'evaluation';
    sessionType: 'individual' | 'couple' | 'family';
    duration: number;
    meetingType: 'in-person' | 'online';
    concerns: string[];
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    isForSelf: boolean;
    dependentInfo?: {
      name: string;
      age: number;
      relationship: string;
      concerns: string[];
    };
  };

  scheduling: {
    preferredDates: Date[];
    preferredTimes: string[];
    earliestDate: Date;
    latestDate: Date;
    flexibility: 'flexible' | 'somewhat-flexible' | 'strict';
    scheduledDateTime?: Date;
    duration: number;
    timezone: string;
  };

  professionalPreferences: {
    genderPreference: number;
    agePreference: string;
    experienceLevel: string;
    specialties: string[];
    languages: string[];
    excludeProfessionals: string[];
  };

  location: {
    type: 'client-address' | 'professional-office' | 'online';
    address?: any;
    coordinates?: { lat: number; lng: number };
    maxDistance: number;
  };

  budget: {
    maxAmount: number;
    currency: string;
    paymentMethod: string;
    useInsurance: boolean;
    insuranceProvider?: string;
  };

  status: 'draft' | 'submitted' | 'matching' | 'offers-received' | 'confirmed' | 'completed' | 'cancelled';

  workflow: {
    submittedAt?: Date;
    matchingStartedAt?: Date;
    firstOfferAt?: Date;
    confirmedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
  };

  offers: {
    count: number;
    received: string[];
    viewed: string[];
    accepted?: string;
    declined: string[];
  };

  communication: {
    lastClientMessage?: Date;
    lastProfessionalMessage?: Date;
    unreadMessages: number;
    clientNotes?: string;
    professionalNotes?: string;
  };

  metadata: {
    source: string;
    version: string;
    referralSource?: string;
    marketingCampaign?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### Offer Interface
```typescript
// src/types/offer.ts
export interface Offer {
  id: string;
  appointmentId: string;
  professionalId: string;
  clientId: string;

  professional: {
    name: string;
    photo?: string;
    rating: number;
    experience: number;
    specialties: string[];
    credentials: string;
    bio: string;
  };

  timeSlots: Array<{
    start: Date;
    end: Date;
    timezone: string;
    available: boolean;
  }>;

  service: {
    type: string;
    duration: number;
    rate: number;
    currency: string;
    meetingType: string;
    location?: any;
    preparations: string;
    policies: {
      cancellation: string;
      lateness: string;
      noShow: string;
    };
  };

  message: {
    greeting: string;
    approach: string;
    questions: string[];
    instructions: string;
  };

  status: 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired' | 'withdrawn';

  timing: {
    sentAt: Date;
    viewedAt?: Date;
    respondedAt?: Date;
    expiresAt: Date;
    responseTime?: number;
  };

  pricing: {
    sessionRate: number;
    totalCost: number;
    currency: string;
    acceptsInsurance: boolean;
    paymentTerms: string;
    cancellationPolicy: string;
  };

  analytics: {
    viewCount: number;
    timeToView?: number;
    competingOffers: number;
    rank: number;
  };

  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Interface
```typescript
// src/types/notification.ts
export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'offer' | 'reminder' | 'system';
  category: 'booking' | 'message' | 'payment' | 'promotional';

  content: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    actionUrl?: string;
    data?: Record<string, any>;
  };

  delivery: {
    channels: ('push' | 'email' | 'sms' | 'in-app')[];
    priority: 'low' | 'normal' | 'high' | 'critical';
    scheduled?: Date;
    sent: boolean;
    sentAt?: Date;
    delivered: boolean;
    deliveredAt?: Date;
    read: boolean;
    readAt?: Date;
    clicked: boolean;
    clickedAt?: Date;
  };

  metadata: {
    relatedAppointment?: string;
    relatedOffer?: string;
    source: string;
    campaignId?: string;
  };

  createdAt: Date;
  expiresAt?: Date;
}
```

## 🔌 TanStack Query Integration

### Query Client Setup
```typescript
// src/services/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### User Management Queries
```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { User } from '../types/user';

// Get all users
export const useUsers = (filters?: { userType?: number; isActive?: boolean }) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      let q = query(collection(db, 'users'));

      if (filters?.userType !== undefined) {
        q = query(q, where('userType', '==', filters.userType));
      }
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
    },
  });
};

// Get single user
export const useUser = (uid: string) => {
  return useQuery({
    queryKey: ['users', uid],
    queryFn: async () => {
      const docRef = doc(db, 'users', uid);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } as User : null;
    },
    enabled: !!uid,
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, data }: { uid: string; data: Partial<User> }) => {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { ...data, updatedAt: new Date() });
    },
    onSuccess: (_, { uid }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', uid] });
    },
  });
};

// Block/Unblock user
export const useToggleUserBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, isBlocked }: { uid: string; isBlocked: boolean }) => {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        isBlocked,
        updatedAt: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### Professional Management Queries
```typescript
// src/hooks/useProfessionals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Professional } from '../types/professional';

export const useProfessionals = (filters?: {
  verificationStatus?: string;
  currentlyAccepting?: boolean;
  specialty?: string;
}) => {
  return useQuery({
    queryKey: ['professionals', filters],
    queryFn: async () => {
      let q = query(collection(db, 'professionals'));

      if (filters?.verificationStatus) {
        q = query(q, where('professionalInfo.verificationStatus', '==', filters.verificationStatus));
      }
      if (filters?.currentlyAccepting !== undefined) {
        q = query(q, where('status.currentlyAcceptingClients', '==', filters.currentlyAccepting));
      }
      if (filters?.specialty) {
        q = query(q, where('services.specialties', 'array-contains', filters.specialty));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Professional[];
    },
  });
};

export const useProfessional = (id: string) => {
  return useQuery({
    queryKey: ['professionals', id],
    queryFn: async () => {
      const docRef = doc(db, 'professionals', id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Professional : null;
    },
    enabled: !!id,
  });
};

export const useUpdateProfessionalVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes
    }: {
      id: string;
      status: 'verified' | 'rejected';
      notes?: string;
    }) => {
      const docRef = doc(db, 'professionals', id);
      await updateDoc(docRef, {
        'professionalInfo.verificationStatus': status,
        'professionalInfo.verificationDate': new Date(),
        'professionalInfo.verificationNotes': notes,
        'professionalInfo.isVerified': status === 'verified',
        updatedAt: new Date()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });
};
```

### Appointment Management Queries
```typescript
// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Appointment } from '../types/appointment';

export const useAppointments = (filters?: {
  status?: string;
  urgency?: string;
  clientId?: string;
  professionalId?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      let q = query(collection(db, 'appointments'));

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.urgency) {
        q = query(q, where('details.urgency', '==', filters.urgency));
      }
      if (filters?.clientId) {
        q = query(q, where('clientId', '==', filters.clientId));
      }
      if (filters?.professionalId) {
        q = query(q, where('professionalId', '==', filters.professionalId));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes
    }: {
      id: string;
      status: Appointment['status'];
      notes?: string;
    }) => {
      const docRef = doc(db, 'appointments', id);
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      // Update workflow timestamps
      if (status === 'confirmed') {
        updateData['workflow.confirmedAt'] = new Date();
      } else if (status === 'completed') {
        updateData['workflow.completedAt'] = new Date();
      } else if (status === 'cancelled') {
        updateData['workflow.cancelledAt'] = new Date();
        if (notes) {
          updateData['workflow.cancellationReason'] = notes;
        }
      }

      await updateDoc(docRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

## 🎨 Component Implementation Examples

### Dashboard Overview Component
```typescript
// src/components/dashboard/DashboardOverview.tsx
import React from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useProfessionals } from '../../hooks/useProfessionals';
import { useAppointments } from '../../hooks/useAppointments';

export const DashboardOverview: React.FC = () => {
  const { data: users } = useUsers();
  const { data: professionals } = useProfessionals();
  const { data: pendingAppointments } = useAppointments({ status: 'submitted' });
  const { data: urgentAppointments } = useAppointments({ urgency: 'high' });

  const stats = {
    totalUsers: users?.length || 0,
    totalProfessionals: professionals?.length || 0,
    pendingVerifications: professionals?.filter(p => p.professionalInfo.verificationStatus === 'pending').length || 0,
    pendingAppointments: pendingAppointments?.length || 0,
    urgentAppointments: urgentAppointments?.length || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon="👥"
        trend="+12%"
        trendColor="green"
      />
      <StatCard
        title="Professionals"
        value={stats.totalProfessionals}
        icon="👨‍⚕️"
        trend="+5%"
        trendColor="green"
      />
      <StatCard
        title="Pending Verifications"
        value={stats.pendingVerifications}
        icon="⏳"
        trend={stats.pendingVerifications > 0 ? "Requires attention" : "All clear"}
        trendColor={stats.pendingVerifications > 0 ? "red" : "green"}
      />
      <StatCard
        title="Urgent Appointments"
        value={stats.urgentAppointments}
        icon="🚨"
        trend={stats.urgentAppointments > 0 ? "Immediate action" : "No urgent cases"}
        trendColor={stats.urgentAppointments > 0 ? "red" : "green"}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  trend: string;
  trendColor: 'green' | 'red' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendColor }) => {
  const trendColorClass = {
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  }[trendColor];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${trendColorClass}`}>
          {trend}
        </span>
      </div>
    </div>
  );
};
```

### Professional Management Component
```typescript
// src/components/professionals/ProfessionalManagement.tsx
import React, { useState } from 'react';
import { useProfessionals, useUpdateProfessionalVerification } from '../../hooks/useProfessionals';
import { Professional } from '../../types/professional';

export const ProfessionalManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const { data: professionals, isLoading } = useProfessionals(
    filter !== 'all' ? { verificationStatus: filter } : undefined
  );
  const updateVerification = useUpdateProfessionalVerification();

  const handleVerification = async (id: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      await updateVerification.mutateAsync({ id, status, notes });
    } catch (error) {
      console.error('Failed to update verification:', error);
    }
  };

  if (isLoading) return <div>Loading professionals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Professional Management</h1>
        <div className="flex space-x-2">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {professionals?.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onVerification={handleVerification}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

interface ProfessionalCardProps {
  professional: Professional;
  onVerification: (id: string, status: 'verified' | 'rejected', notes?: string) => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onVerification }) => {
  const [notes, setNotes] = useState('');

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }[professional.professionalInfo.verificationStatus];

  return (
    <li className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                {professional.personalInfo.firstName.charAt(0)}
                {professional.personalInfo.lastName.charAt(0)}
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Dr. {professional.personalInfo.firstName} {professional.personalInfo.lastName}
                </h3>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {professional.professionalInfo.verificationStatus}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {professional.businessInfo.businessName} • {professional.services.specialties.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                License: {professional.professionalInfo.licenseNumber} •
                Order: {professional.professionalInfo.orderMembership.membershipNumber}
              </p>
              <p className="text-sm text-gray-500">
                📍 {professional.businessInfo.businessAddress.city}, {professional.businessInfo.businessAddress.province}
              </p>
            </div>
          </div>
        </div>

        {professional.professionalInfo.verificationStatus === 'pending' && (
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={() => onVerification(professional.id, 'verified', notes)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Verify
              </button>
              <button
                onClick={() => onVerification(professional.id, 'rejected', notes)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
            </div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            />
          </div>
        )}
      </div>
    </li>
  );
};
```

### Appointment Management Component
```typescript
// src/components/appointments/AppointmentManagement.tsx
import React, { useState } from 'react';
import { useAppointments, useUpdateAppointmentStatus } from '../../hooks/useAppointments';
import { Appointment } from '../../types/appointment';

export const AppointmentManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  const { data: appointments, isLoading } = useAppointments(
    statusFilter !== 'all' || urgencyFilter !== 'all'
      ? {
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(urgencyFilter !== 'all' && { urgency: urgencyFilter })
        }
      : undefined
  );

  const updateStatus = useUpdateAppointmentStatus();

  const handleStatusUpdate = async (id: string, status: Appointment['status'], notes?: string) => {
    try {
      await updateStatus.mutateAsync({ id, status, notes });
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  if (isLoading) return <div>Loading appointments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="matching">Matching</option>
            <option value="offers-received">Offers Received</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {appointments?.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusUpdate: (id: string, status: Appointment['status'], notes?: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onStatusUpdate }) => {
  const [notes, setNotes] = useState('');

  const urgencyColor = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800'
  }[appointment.details.urgency];

  const statusColor = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    matching: 'bg-purple-100 text-purple-800',
    'offers-received': 'bg-indigo-100 text-indigo-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800'
  }[appointment.status];

  return (
    <li className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {appointment.clientName}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {appointment.status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColor}`}>
                  {appointment.details.urgency}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {appointment.details.type} • {appointment.details.sessionType} • {appointment.details.duration} min
              </p>
              <p className="text-sm text-gray-500">
                Concerns: {appointment.details.concerns.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                📅 Preferred: {appointment.scheduling.preferredDates[0]?.toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                💰 Budget: ${appointment.budget.maxAmount} {appointment.budget.currency}
              </p>
              {appointment.professionalId && (
                <p className="text-sm text-gray-500">
                  👨‍⚕️ Professional: {appointment.professionalName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            {appointment.status === 'submitted' && (
              <>
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'matching')}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Start Matching
                </button>
                <button
                  onClick={() => onStatusUpdate(appointment.id, 'cancelled', notes)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Cancel
                </button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <button
                onClick={() => onStatusUpdate(appointment.id, 'completed')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Mark Complete
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          />
        </div>
      </div>
    </li>
  );
};
```

## 🚀 Tauri Integration

### Tauri Configuration
```toml
# src-tauri/Cargo.toml
[package]
name = "psypsy-cms"
version = "1.0.0"
description = "PsyPsy Admin CMS"
authors = ["PsyPsy Team"]
license = "MIT"
repository = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.0", features = [] }

[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
tauri = { version = "1.0", features = ["api-all"] }

[features]
custom-protocol = ["tauri/custom-protocol"]
```

```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "PsyPsy CMS",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "window": {
        "all": false,
        "close": true,
        "hide": true,
        "maximize": true,
        "minimize": true,
        "unmaximize": true,
        "unminimize": true,
        "show": true,
        "startDragging": true,
        "print": true
      },
      "notification": {
        "all": true
      },
      "dialog": {
        "all": false,
        "ask": true,
        "confirm": true,
        "message": true,
        "open": true,
        "save": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.psypsy.cms",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 900,
        "resizable": true,
        "title": "PsyPsy CMS",
        "width": 1400,
        "center": true,
        "minHeight": 600,
        "minWidth": 800
      }
    ]
  }
}
```

### Custom Tauri Commands (Optional)
```rust
// src-tauri/src/main.rs
use tauri::Manager;

#[tauri::command]
fn show_notification(title: &str, body: &str) {
    // Custom notification logic
    println!("Notification: {} - {}", title, body);
}

#[tauri::command]
async fn export_data(data: String) -> Result<String, String> {
    // Export functionality
    Ok("Export completed".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            show_notification,
            export_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 📱 Responsive Design & Styling

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

## 🔧 Development Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "firebase:emulators": "firebase emulators:start",
    "firebase:seed": "node scripts/seed-data.js"
  }
}
```

## 🧪 Testing Strategy

### React Query Testing
```typescript
// src/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

## 📊 Performance Optimizations

### Query Optimization
- Use `select` option to transform data
- Implement proper caching strategies
- Use `useInfiniteQuery` for large datasets
- Implement optimistic updates for better UX

### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const ProfessionalManagement = lazy(() => import('./components/professionals/ProfessionalManagement'));
const AppointmentManagement = lazy(() => import('./components/appointments/AppointmentManagement'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <ProfessionalManagement />
</Suspense>
```

## 🔐 Security Considerations

### Firebase Security Rules Testing
```bash
# Test security rules locally
firebase emulators:exec --only firestore "npm run test:rules"
```

### Input Validation
```typescript
// Use Zod for runtime validation
import { z } from 'zod';

const ProfessionalSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
  }),
  professionalInfo: z.object({
    licenseNumber: z.string().min(5),
    licenseExpiry: z.date().min(new Date()),
  }),
});

type Professional = z.infer<typeof ProfessionalSchema>;
```

## 🚀 Deployment

### Build Configuration
```bash
# Development build
npm run tauri:dev

# Production build
npm run tauri:build

# Create installer
npm run tauri:build -- --bundles all
```

This comprehensive guide provides everything needed to implement a robust CMS for managing the PsyPsy Firebase backend with Canadian compliance and Montreal-specific features.