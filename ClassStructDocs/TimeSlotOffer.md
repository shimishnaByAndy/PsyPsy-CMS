# TimeSlotOffer Class

## Overview
A `TimeSlotOffer` represents a professional's response to an appointment request, proposing one or more available time slots, with all necessary context for the client to make a booking decision.

## Fields, Requirements & Explanations
| Field               | Requirement | Why It's Asked For / Purpose                                                                 |
|---------------------|------------|---------------------------------------------------------------------------------------------|
| objectId            | System     | Unique identifier for the offer (managed by backend).                                        |
| createdAt           | System     | Timestamp when the offer was created (managed by backend).                                   |
| updatedAt           | System     | Timestamp of last update (managed by backend).                                               |
| ACL                 | System     | Access control list for security (managed by backend).                                       |
| sentAt              | Required   | When the offer was sent to the client. Used for tracking and sorting offers.                 |
| timeSlots           | Required   | The actual time slots proposed by the professional. Enables the client to choose a suitable appointment time. |
| status              | Required   | Current status of the offer (e.g., pending, accepted, expired, withdrawn). Drives workflow and notifications. |
| appointmentId       | Required   | ID of the related appointment request. Used for linking the offer to the original appointment.|
| apptPtr             | Required   | Pointer to the Appointment object. Ensures data integrity and enables relational queries.     |
| profPtr             | Required   | Pointer to the Professional who made the offer. Used for matching and display.               |
| profInfo            | Required   | Snapshot of the professional's info at the time of the offer (name, credentials, etc.). For display and audit. |
| applicationStats    | Optional   | Stats about the offer/application (e.g., response time, viewed status). Used for analytics and UI feedback. |
| serviceConfig       | Required   | Details about the service being offered (type, rate, modality, etc.). Ensures clarity for the client. |
| appointmentDuration | Required   | Duration (in minutes) of the proposed session. Needed for scheduling and pricing.            |
| profNoteMsg         | Optional   | Message from the professional to the client (e.g., context, instructions). For personalization. |
| professionalId      | Required   | ID of the professional making the offer. Used for tracking and analytics.                    |
| userPtr             | Required   | Pointer to the user account of the professional. For authentication and notifications.       |

**Legend**
- **Required:** Must be present for a valid time slot offer.
- **Optional:** Can be omitted; filled in if available or needed.
- **System:** Managed by backend or filled automatically during workflow.

## Raw Structure
```js
TimeSlotOffer: {
  objectId: { type: 'String' },
  createdAt: { type: 'Date' },
  updatedAt: { type: 'Date' },
  ACL: { type: 'ACL' },
  sentAt: { type: 'Date' },
  timeSlots: { type: 'Array' },
  status: { type: 'String' },
  appointmentId: { type: 'String' },
  apptPtr: { type: 'Pointer', targetClass: 'Appointment' },
  profPtr: { type: 'Pointer', targetClass: 'Professional' },
  profInfo: { type: 'Object' },
  applicationStats: { type: 'Object' },
  serviceConfig: { type: 'Object' },
  appointmentDuration: { type: 'Number' },
  profNoteMsg: { type: 'Object' },
  professionalId: { type: 'String' },
  userPtr: { type: 'Pointer', targetClass: '_User' }
}
```

## Summary
- **Always required:** sentAt, timeSlots, status, appointmentId, apptPtr, profPtr, profInfo, serviceConfig, appointmentDuration, professionalId, userPtr
- **Optional:** applicationStats, profNoteMsg
- **System:** objectId, createdAt, updatedAt, ACL 