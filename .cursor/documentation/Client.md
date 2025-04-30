# Client Class

## Overview
The `Client` class represents a client profile in the system. It stores personal, contact, and location information used for onboarding, matching, and communication.

## Fields
| Field           | Type      | Description                                                                                   |
|-----------------|-----------|----------------------------------------------------------------------------------------------|
| objectId        | String    | Unique identifier for the client profile (managed by Parse, not user-facing).                 |
| createdAt       | Date      | Date and time the profile was created (system-managed).                                       |
| updatedAt       | Date      | Date and time the profile was last updated (system-managed).                                  |
| ACL             | ACL       | Access control list for profile data (system-managed, controls who can read/write the record).|
| userPtr         | Pointer   | Reference to the associated user account (system-managed).                                    |
| dob             | Date      | Date of birth – Used to verify age and adapt the onboarding experience.                       |
| gender          | Number    | Gender – Used for personalized matching and filtering.                                        |
| spokenLangArr   | Array     | Languages spoken – List of language codes the client is comfortable communicating in.         |
| phoneNb         | String    | Mobile phone number – Used for notifications and, in rare cases, last-minute contact.         |
| firstName       | String    | First name – The client's given name, used for personalization and communication.             |
| lastName        | String    | Last name – The client's family name, used for personalization and communication.             |
| geoPt           | GeoPoint  | Location coordinates – Latitude and longitude for location-based matching.                    |
| addressObj      | Object    | Address – Structured address (street, city, etc.) for location-based services.               |
| searchRadius    | Number    | Search radius – The distance (in km) within which to search for professionals.                |

## User-Facing Field Descriptions
- **Date of birth (dob):**
  > Your date of birth. Used to verify your age and tailor your experience.
- **Gender (gender):**
  > Please select your gender. This helps us personalize your matches and respect your preferences.
- **Languages spoken (spokenLangArr):**
  > Which languages do you speak comfortably? Select all that apply to help us match you with the right professional.
- **Mobile phone number (phoneNb):**
  > Your mobile phone number. We'll use this for important notifications or in case of last-minute changes. Your number is never shared without your consent.
- **First name (firstName):**
  > Your first name. Used for communication and personalization.
- **Last name (lastName):**
  > Your last name. Used for communication and personalization.
- **Location coordinates (geoPt):**
  > Your location (automatically detected or entered). Used to find professionals near you.
- **Address (addressObj):**
  > Your address (street, city, etc.). Helps us suggest in-person services in your area.
- **Search radius (searchRadius):**
  > How far are you willing to travel for appointments? Set your preferred search area in kilometers.

> **Note:** System fields (`objectId`, `createdAt`, `updatedAt`, `ACL`, `userPtr`) are not shown to users but are essential for backend management and security.

## Permissions

### Class Level Permissions (CLP)
| Operation   | Public | Description                                 |
|-------------|--------|---------------------------------------------|
| Get         | ❌     | Not allowed for public                      |
| Find        | ❌     | Not allowed for public                      |
| Create      | ✅     | Allowed for public (required for sign-up)   |
| Update      | ❌     | Not allowed for public                      |
| Delete      | ❌     | Not allowed for public                      |
| Add field   | ❌     | Not allowed for public                      |

- **Create** is enabled to allow client onboarding.

## Raw Structure
```js
Client: {
  objectId: { type: 'String' },
  createdAt: { type: 'Date' },
  updatedAt: { type: 'Date' },
  ACL: { type: 'ACL' },
  userPtr: { type: 'Pointer', targetClass: '_User' },
  dob: { type: 'Date' },
  gender: { type: 'Number' },
  spokenLangArr: { type: 'Array' },
  phoneNb: { type: 'String' },
  firstName: { type: 'String' },
  lastName: { type: 'String' },
  geoPt: { type: 'GeoPoint' },
  addressObj: { type: 'Object' },
  searchRadius: { type: 'Number' }
} 