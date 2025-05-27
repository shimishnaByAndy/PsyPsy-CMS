# User Class

## Overview
The `User` class represents the core user entity in the system. It is based on Parse Server's built-in `_User` class and is extended to support application-specific fields and behaviors.

## Fields
| Field            | Type      | Description                                                                 |
|------------------|-----------|-----------------------------------------------------------------------------|
| objectId         | String    | Unique identifier for the user.                                             |
| createdAt        | Date      | When the user was created.                                                  |
| updatedAt        | Date      | When the user was last updated.                                             |
| ACL              | ACL       | Access control list for the user object.                                    |
| username         | String    | The user's login name (unique).                                             |
| password         | String    | The user's password (hashed and never returned in queries).                 |
| email            | String    | The user's email address (unique, optional).                                |
| emailVerified    | Boolean   | Whether the user's email has been verified.                                 |
| authData         | Object    | Authentication data for third-party providers.                              |
| userType         | Number    | Numeric code representing the user type (see User Types Mapping below).     |
| roleNames        | Array     | List of role names assigned to the user.                                    |
| clientPtr        | Pointer   | Pointer to the associated Client object (if user is a client).              |
| professionalPtr  | Pointer   | Pointer to the associated Professional object (if user is a professional).  |
| adminPtr         | Pointer   | Pointer to the associated Admin object (if user is an admin).               |
| userInfo         | Object    | Device and session info (see userInfo structure below).                     |
| isBlocked        | Boolean   | Whether the user is blocked from accessing the system.                      |

## Raw Structure
```js
_User: {
  objectId: { type: 'String' },
  createdAt: { type: 'Date' },
  updatedAt: { type: 'Date' },
  ACL: { type: 'ACL' },
  username: { type: 'String' },
  password: { type: 'String' },
  email: { type: 'String' },
  emailVerified: { type: 'Boolean' },
  authData: { type: 'Object' },
  userType: { type: 'Number' },
  roleNames: { type: 'Array' },
  clientPtr: { type: 'Pointer', targetClass: 'Client' },
  professionalPtr: { type: 'Pointer', targetClass: 'Professional' },
  adminPtr: { type: 'Pointer', targetClass: 'Admin' },
  userInfo: { type: 'Object' },
  isBlocked: { type: 'Boolean' }
}
```

## User Types Mapping
The `userType` field uses the following mapping:

| User Type     | Numeric Value |
|---------------|--------------|
| Admin         | 0            |
| Professional  | 1            |
| Client        | 2            |

Reverse mapping is also available:

| Numeric Value | User Type     |
|---------------|--------------|
| 0             | Admin         |
| 1             | Professional  |
| 2             | Client        |

## User Type Pointer Mapping
The pointer fields for each user type:

| User Type     | Pointer Field   |
|---------------|----------------|
| Admin         | adminPtr        |
| Professional  | professionalPtr |
| Client        | clientPtr       |

## userInfo Structure
The `userInfo` object stores device and session information per platform. Example structure:

```js
userInfo[PlatformId] = {
    ts:   "MM-DD HH:mm",      // Timestamp (formatted)
    tsUx: 1234567890,         // Timestamp in Unix format
    appV: "1.0.0",           // App version
    devMod: "iPhone X",      // Device model
    os:   "iOS",             // OS name
    osV:  "14.4",            // OS version
    loc:  "en_US"            // Device locale
};
```

- `PlatformId` is a unique identifier for the device/platform.
- This structure helps track user sessions, device info, and app versioning.

## Notes
- The `User` class is essential for authentication and authorization.
- Sensitive fields like `password` are never returned in API responses.
- Use master key for administrative operations on users.
- Custom fields and mappings enable flexible user management and integration with other classes.

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

- **Create** is enabled to allow user sign-up.

### Object Level Permissions (ACL)
- **Owner & Admin:** Read/Write access
- Other users: No access by default

These permissions ensure that only the user (owner) and admins can read or modify user objects, while the public and other users have no access unless explicitly granted. 