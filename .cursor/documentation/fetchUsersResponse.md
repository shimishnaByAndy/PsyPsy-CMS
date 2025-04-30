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
      "14-17": "number",
      "18-24": "number",
      "25-34": "number",
      "35-44": "number",
      "45-54": "number",
      "55-64": "number",
      "65+": "number"
    },
    "genderCounts": {
      "1": "number",
      "2": "number",
      "3": "number",
      "4": "number"
    }
  }
}
```

## Notes
- The `clientPtr` object contains the profile details specific to the `Client` class.
- Ensure to handle undefined values when accessing nested properties.
- Gender mapping: 1 = Woman, 2 = Man, 3 = Other, 4 = Not Disclosed. 