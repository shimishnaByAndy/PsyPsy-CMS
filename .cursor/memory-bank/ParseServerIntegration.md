# Parse Server Integration

## Overview
The PsyPsy CMS integrates with Parse Server 3.6.0 hosted on Sashido's cloud platform. This document outlines the integration patterns, data models, and best practices for working with Parse Server in this project.

## Connection Configuration

### Parse Initialization
Parse Server is initialized in `src/index.js` with the following configuration:

```javascript
// Initialize Parse
Parse.initialize(
  process.env.REACT_APP_PARSE_APP_ID,
  process.env.REACT_APP_PARSE_JS_KEY
);
Parse.serverURL = process.env.REACT_APP_PARSE_SERVER_URL;
```

Environment variables are stored in `.env` files with different configurations for development, staging, and production environments.

## Authentication Patterns

### User Authentication
The `ParseAuth` service (`src/services/ParseAuth.js`) handles authentication operations:

```javascript
// Login method
async login(username, password) {
  try {
    const user = await Parse.User.logIn(username, password);
    return user;
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

// Check authentication status
isAuthenticated() {
  return Parse.User.current() !== null;
}
```

### Admin Authentication
Administrative operations may require Master Key usage, which should be handled only in secure Cloud Code functions:

```javascript
// NEVER use the Master Key in client code
// Instead, call Cloud Functions for admin operations
Parse.Cloud.run("adminFunction", { userId: "xyz" });
```

## Data Models

### Core Classes

| Class Name | Description | Key Fields |
|------------|-------------|------------|
| _User | Parse authentication user | username, email, password |
| Client | Client profile | user (pointer to _User), bio, preferences |
| Professional | Professional profile | user (pointer to _User), credentials, specialties |
| Appointment | Service appointment | client, professional, status, scheduledTime |
| TimeSlotOffer | Time slot proposals | professional, availability, duration |

### Relationships
- One-to-one between _User and Client/Professional
- Many-to-many between Client and Professional via Appointment
- One-to-many between Professional and TimeSlotOffer

## Query Patterns

### Fetching User Data
```javascript
// Get current user profile
const userQuery = new Parse.Query(Parse.User);
userQuery.include("profile"); // Include related profile
const currentUser = await userQuery.get(Parse.User.current().id);
```

### Fetching Related Objects
```javascript
// Get appointments for a professional
const appointmentQuery = new Parse.Query("Appointment");
appointmentQuery.equalTo("professional", professionalObj);
appointmentQuery.include("client"); // Include client data
appointmentQuery.include("client.user"); // Include nested user data
const appointments = await appointmentQuery.find();
```

### Pagination
```javascript
// Paginated query
const query = new Parse.Query("ClassName");
query.limit(10); // Items per page
query.skip(page * 10); // Skip based on page number
query.descending("createdAt"); // Sort order
const results = await query.find();
```

## Cloud Functions

### Calling Cloud Functions
```javascript
// Basic cloud function call
const result = await Parse.Cloud.run("functionName", { param1: "value" });

// With error handling
try {
  const result = await Parse.Cloud.run("functionName", { param1: "value" });
  return result;
} catch (error) {
  console.error("Cloud function error:", error);
  throw new Error(`Operation failed: ${error.message}`);
}
```

### Administrative Functions
Cloud functions requiring the Master Key should be well-documented and limited to administrative operations:

```javascript
// Server-side cloud function definition (not in client code)
Parse.Cloud.define("adminVerifyProfessional", async (request) => {
  if (!request.user || !request.user.get("isAdmin")) {
    throw new Error("Unauthorized");
  }
  
  const { professionalId, verificationStatus } = request.params;
  const professional = await new Parse.Query("Professional").get(professionalId, { useMasterKey: true });
  professional.set("isVerified", verificationStatus);
  await professional.save(null, { useMasterKey: true });
  
  return { success: true };
});
```

## Live Queries

For real-time updates, especially in appointment monitoring:

```javascript
// Subscribe to live updates
const query = new Parse.Query("Appointment");
query.equalTo("status", "pending");

const subscription = await query.subscribe();
subscription.on("create", (appointment) => {
  console.log("New pending appointment:", appointment);
  // Update UI
});

// Unsubscribe when component unmounts
subscription.unsubscribe();
```

## Error Handling

Always implement proper error handling for Parse operations:

```javascript
try {
  // Parse operation
} catch (error) {
  if (error.code === Parse.Error.OBJECT_NOT_FOUND) {
    // Handle not found
  } else if (error.code === Parse.Error.INVALID_SESSION_TOKEN) {
    // Handle invalid session
    // Force logout and redirect to login
    await Parse.User.logOut();
    window.location.href = "/login";
  } else {
    // Handle other errors
    console.error("Parse error:", error);
  }
}
```

## Security Best Practices

1. Never store the Master Key in client-side code
2. Use ACLs for all objects to control access
3. Validate all input on both client and server sides
4. Implement rate limiting for authentication attempts
5. Use Cloud Functions for sensitive operations
6. Keep Parse JavaScript SDK updated to latest compatible version 