# Firebase Emulator Setup Guide
**Last Updated**: September 29, 2025  
**Audience**: Developers, DevOps Engineers  
**Prerequisites**: Node.js 18+, Firebase CLI, Project setup  
**Categories**: Setup, Development Environment, Firebase  
**Topics**: Firebase Emulators, Local Development, Configuration, Testing  

## Overview

This guide provides step-by-step instructions for setting up and configuring Firebase emulators for local development of the PsyPsy CMS application.

### Related Documentation
- [Architecture Guide](../development/architecture.md) - System architecture and Firebase integration
- [Security Rules](../security/FIRESTORE_SECURITY_DOCUMENTATION.md) - Firestore security configuration
- [Testing Strategy](../testing/TESTING_STRATEGY.md) - Integration testing with emulators
- [Compliance Overview](../compliance/overview.md) - Data protection requirements

## Table of Contents

- [Quick Start](#quick-start)
- [Emulator Configuration](#emulator-configuration)
- [API Endpoints](#api-endpoints)
- [Testing Integration](#testing-integration)
- [Troubleshooting](#troubleshooting)

## Quick Start

Your Firebase emulator integration is now ready! Follow these steps to test the connection:

### 1. Ensure Your Emulators Are Running

Make sure your Firebase emulators are running with these endpoints:
- **Firebase Emulator URL**: http://localhost:8780/psypsy-dev-local/us-east4
- **Firestore Emulator**: http://localhost:9881
- **Auth Emulator**: http://localhost:9880
- **Emulator UI**: http://localhost:8782

### 2. Available API Endpoints

Your backend should have these endpoints available:
- `POST /helloWorld` - Test connection
- `POST /createUserProfile` - Create user profiles
- `POST /getUserProfile` - Get user data
- `POST /createAppointment` - Create appointments

### 3. Test Accounts Ready

The system is configured with these test accounts:
- **Admin**: admin@psypsy.test (password: testpassword123)
- **Professional 1**: prof1@psypsy.test (Dr. Sarah Wilson)
- **Professional 2**: prof2@psypsy.test (Dr. Michael Chen)
- **Client 1**: client1@psypsy.test (John Doe)
- **Client 2**: client2@psypsy.test (Jane Smith)

### 4. Start the Development Server

```bash
npm run dev
# or
npm run tauri:dev  # If you want the Tauri desktop app
```

### 5. Access the Admin Dashboard

Navigate to: **http://localhost:5177/admin**

This will show the complete admin dashboard with:
- 🔗 Connection testing to your Firebase emulators
- 👥 User management tables
- 👩‍⚕️ Professional verification tables
- 📅 Appointment management tables
- 🇨🇦 Quebec Law 25 & PIPEDA compliance monitoring

### 6. Test the Connection

1. Go to the **Connection Test** tab in the admin dashboard
2. Click "Run Connection Tests"
3. This will test:
   - ✅ Hello World endpoint connection
   - ✅ Authentication with test accounts
   - ✅ User profile creation
   - ✅ Data fetching operations

## 📋 What's Included

### ✅ Firebase Configuration
- **File**: `src/firebase/firebase-config.ts`
- Configured for your emulator ports (9880, 9881)
- Canadian region (us-east4) for Quebec Law 25 compliance
- Automatic emulator connection in development

### ✅ API Service Layer
- **File**: `src/services/firebase-api.ts`
- Type-safe Firebase Functions calls
- Built-in Quebec compliance audit logging
- Error handling and retry logic
- Test accounts integration

### ✅ Enhanced Table System
- **Files**: `src/components/tables/`
- TanStack Table v8 with server-side operations
- Real-time data integration with Firebase
- Export functionality (CSV, Excel, JSON)
- Quebec Law 25 compliant audit trails

### ✅ Admin Dashboard
- **File**: `src/components/AdminDashboard.tsx`
- Complete CMS interface
- User, Professional, and Appointment management
- Connection testing tools
- Compliance monitoring dashboard

### ✅ Tauri Configuration
- **File**: `src-tauri/tauri.conf.json`
- Updated for Quebec compliance
- Localhost connections enabled
- Canadian healthcare branding

## 🧪 Testing Features

### Connection Testing
- Automated testing of all Firebase services
- Real-time connection status monitoring
- Detailed error reporting and debugging

### Authentication Testing
- Sign in/out with test accounts
- Role-based access testing
- Session management validation

### Data Operations Testing
- CRUD operations on all entities
- Server-side filtering and sorting
- Pagination and search functionality
- Export operations

### Compliance Testing
- Quebec Law 25 audit logging
- PIPEDA compliance validation
- Data residency verification
- Personal information access tracking

## 🛠️ Next Steps

1. **Start Your Emulators**: Ensure all Firebase emulators are running
2. **Run the App**: `npm run tauri:dev` or `npm run dev`
3. **Test Connection**: Navigate to `/admin` and use the Connection Test tab
4. **Explore Tables**: Test user, professional, and appointment management
5. **Verify Compliance**: Check the Compliance tab for Quebec Law 25 status

## 🚨 Troubleshooting

### Connection Issues
- Verify emulator ports match your setup (9880, 9881)
- Check that emulators are running and accessible
- Look for CORS issues in browser console

### Authentication Issues
- Confirm test accounts exist in your Auth emulator
- Check email/password combinations
- Verify emulator auth settings

### Data Issues
- Ensure Firestore emulator has proper collections
- Check security rules allow admin access
- Verify function endpoints are deployed

## 🇨🇦 Quebec Compliance Features

- ✅ **Data Residency**: Canadian region (us-east4)
- ✅ **Audit Logging**: All personal information access tracked
- ✅ **Retention Policies**: 7-year audit trail storage
- ✅ **Right to Erasure**: Complete data deletion capabilities
- ✅ **Breach Notification**: 72-hour reporting procedures
- ✅ **Consent Management**: Explicit consent tracking

---

**Ready to test!** 🎉 Your PsyPsy CMS is now fully configured with Firebase emulator integration and Quebec Law 25 compliance.