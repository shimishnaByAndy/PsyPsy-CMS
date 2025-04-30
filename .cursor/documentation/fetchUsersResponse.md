# Fetch Users Response for Clients

This document describes the structure of the response received from the `fetchUsers` cloud function when fetching client users.

## Response Structure

```json
{
  "users": [
    {
      "objectId": "string",
      "username": "string",
      "email": "string",
      "userType": "number",
      "clientPtr": {
        "createdAt": "Date",
        "updatedAt": "Date",
        "userPtr": {
          "__type": "Pointer",
          "className": "_User",
          "objectId": "string"
        },
        "gender": "number",
        "ACL": {
          "objectId": {
            "read": true,
            "write": true
          },
          "role:Admin": {
            "read": true,
            "write": true
          }
        },
        "objectId": "string",
        "__type": "Object",
        "className": "Client"
      },
      "createdAt": "Date",
      "updatedAt": "Date",
      "ACL": {
        "role:Admin": {
          "read": true,
          "write": true
        },
        "objectId": {
          "read": true,
          "write": true
        }
      },
      "objectId": "string"
    }
  ],
  "totalUsers": "number",
  "stats": {
    "newUsersThisWeek": "number",
    "newUsersThisMonth": "number",
    "newUsersThisYear": "number",
    "ageRanges": {
      "18-24": "number",
      "25-34": "number",
      "35-44": "number",
      "45-54": "number",
      "55+": "number"
    },
    "genderCounts": {
      "male": "number",
      "female": "number",
      "other": "number"
    }
  }
}
```

## Notes
- The `clientPtr` object contains the profile details specific to the `Client` class.
- Ensure to handle undefined values when accessing nested properties. 