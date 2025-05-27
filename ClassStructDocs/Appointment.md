# Appointment Class

## Overview
The `Appointment` class represents an appointment request or booking in the system. It captures all relevant details for matching, scheduling, and workflow management between clients and professionals.

## Fields & Explanations
| Field               | Why It's Asked For / Purpose                                                                                   |
|---------------------|----------------------------------------------------------------------------------------------------------------|
| objectId            | System-managed unique identifier for the appointment. Used for tracking and referencing the appointment in the backend. |
| createdAt           | System-managed timestamp for when the appointment request was created. Used for sorting and auditing.           |
| updatedAt           | System-managed timestamp for the last update. Used for tracking changes and status updates.                     |
| ACL                 | System-managed access control list. Ensures only authorized users can view or modify the appointment.           |
| availArr            | To know when the client is available. Used to match with professionals' availabilities.                         |
| genderPref          | To respect client's preference for the professional's gender. Filters professionals accordingly.                |
| afterDate           | To specify the earliest acceptable date for the appointment. Avoids offering slots before this date.            |
| isForClient         | To clarify if the appointment is for the user or someone else (e.g., child, dependent). Personalizes intake and consent. |
| clientGeoLoc        | To know the client's location. Enables location-based matching for in-person sessions.                          |
| profilePtr          | To link the appointment to a specific client profile. Ensures correct data association.                         |
| clientPtr           | To link the appointment to the user account. For authentication and notifications.                              |
| maxBudget           | To set a maximum price the client is willing to pay. Filters out professionals above this rate.                |
| searchRadius        | To define how far the client is willing to travel. Limits professional search to this area.                     |
| concernedPers       | To capture details about the person receiving care (if not the user). Ensures appropriate intake and matching.  |
| groupedPeriodsArr   | To organize available time slots. Helps professionals propose matching slots efficiently.                       |
| consultReasonsArr   | To understand the client's reasons for seeking help. Enables better professional matching and preparation.      |
| meetPref            | To know if the client prefers in-person, online, or either. Filters professionals by consultation format.       |
| thirdPartyPayer     | To indicate if a third-party (e.g., CNESST, SAAQ) will pay. Filters professionals who accept these payers.      |
| clientCancelled     | To track if/why the client cancelled. For analytics, policy enforcement, and notifications.                     |
| subcategsIndArr     | To specify subcategories of the service needed. Enables precise professional matching.                          |
| serviceType         | To define the main type of service requested (e.g., therapy, evaluation). Filters and matches professionals.    |
| expertisesIndArr    | To specify particular areas of expertise needed. Ensures the professional has relevant experience.              |
| profTypesArr        | To allow the client to request specific professional types. Filters offers to those professions.                |
| applications        | To track all professional offers for this appointment. Lets the client review and choose from offers.           |
| applicationCount    | To show how many professionals have responded. For client awareness and analytics.                              |
| aggregatedStats     | To provide summary stats (e.g., response times, offer rates). For analytics and user feedback.                 |
| clientNoteMsg       | To let the client add extra notes for the professional. Provides context or special instructions.               |
| tppObj              | To store details about the third-party payer. For billing and eligibility checks.                               |
| langPref            | To specify preferred language(s) for the session. Matches with professionals who speak those languages.        |
| description         | To allow the client to describe their needs in their own words. Gives professionals more context.               |
| status              | To track the current state of the appointment (e.g., requested, confirmed, completed). Drives workflow and notifications. |
| clientAddress       | To provide the address for in-person sessions. Used for location-based matching and logistics.                  |
| scheduledTimestamp  | To record the exact scheduled time. For reminders, calendar sync, and session management.                      |
| dateTime            | To store the appointment date/time as a string. For display and compatibility.                                 |
| title               | To give the appointment a short, descriptive title. For easy reference in lists and notifications.              |
| periodsArr          | To list all possible time slots. Used for matching and scheduling.                                             |
| clientAgeGroup      | To specify the age group of the client. Some professionals only serve certain age groups.                      |
| appliedProfIds      | To track which professionals have applied. Prevents duplicate offers and supports analytics.                   |
| clientDOB           | To record the client's date of birth. For eligibility, consent, and age-appropriate matching.                  |
| noAvailPref         | To indicate if the client has no availability preference. Allows professionals to propose any slot.            |

> **Note:** System fields (`objectId`, `createdAt`, `updatedAt`, `ACL`, `profilePtr`, `clientPtr`, etc.) are not shown to users but are essential for backend management and security.

## Raw Structure
```js
Appointment: {
  objectId: { type: 'String' },
  createdAt: { type: 'Date' },
  updatedAt: { type: 'Date' },
  ACL: { type: 'ACL' },
  availArr: { type: 'Array' },
  genderPref: { type: 'Number' },
  afterDate: { type: 'Number' },
  isForClient: { type: 'Boolean' },
  clientGeoLoc: { type: 'GeoPoint' },
  profilePtr: { type: 'Pointer', targetClass: 'Client' },
  clientPtr: { type: 'Pointer', targetClass: '_User' },
  maxBudget: { type: 'Number' },
  searchRadius: { type: 'Number' },
  concernedPers: { type: 'Object' },
  groupedPeriodsArr: { type: 'Array' },
  consultReasonsArr: { type: 'Array' },
  meetPref: { type: 'Number' },
  thirdPartyPayer: { type: 'Number' },
  clientCancelled: { type: 'Object' },
  subcategsIndArr: { type: 'Array' },
  serviceType: { type: 'Number' },
  expertisesIndArr: { type: 'Array' },
  profTypesArr: { type: 'Array' },
  applications: { type: 'Array' },
  applicationCount: { type: 'Number' },
  aggregatedStats: { type: 'Object' },
  clientNoteMsg: { type: 'String' },
  tppObj: { type: 'Object' },
  langPref: { type: 'Array' },
  description: { type: 'String' },
  status: { type: 'String' },
  clientAddress: { type: 'Object' },
  scheduledTimestamp: { type: 'Number' },
  dateTime: { type: 'String' },
  title: { type: 'String' },
  periodsArr: { type: 'Array' },
  clientAgeGroup: { type: 'Number' },
  appliedProfIds: { type: 'Array' },
  clientDOB: { type: 'String' },
  noAvailPref: { type: 'Boolean' }
}
```

## Field Requirement Matrix
| Field               | Requirement | Notes (When/Why)                                                                                 |
|---------------------|-------------|--------------------------------------------------------------------------------------------------|
| objectId            | System      | Managed by backend (Parse).                                                                      |
| createdAt           | System      | Managed by backend.                                                                              |
| updatedAt           | System      | Managed by backend.                                                                              |
| ACL                 | System      | Managed by backend.                                                                              |
| availArr            | Required    | Needed to match with professional availability.                                                  |
| genderPref          | Optional    | Only if client has a preference for professional's gender.                                       |
| afterDate           | Optional    | Only if client wants to exclude dates before a certain time.                                     |
| isForClient         | Required    | Clarifies if appointment is for the user or another person.                                      |
| clientGeoLoc        | Conditional | Required for in-person or location-based matching; optional for online-only requests.            |
| profilePtr          | Required    | Links to the client profile; always needed.                                                      |
| clientPtr           | Required    | Links to the user account; always needed.                                                        |
| maxBudget           | Optional    | Only if client wants to set a price cap.                                                         |
| searchRadius        | Conditional | Required for in-person/location-based requests; optional for online-only.                        |
| concernedPers       | Conditional | Required if appointment is for someone other than the user (e.g., child, dependent).             |
| groupedPeriodsArr   | Optional    | Used for advanced scheduling; not always present.                                                |
| consultReasonsArr   | Required    | Needed to match with professionals and for intake.                                               |
| meetPref            | Required    | Specifies in-person, online, or either.                                                          |
| thirdPartyPayer     | Optional    | Only if client wants to use a third-party payer.                                                 |
| clientCancelled     | System/Opt  | Populated if/when the client cancels.                                                            |
| subcategsIndArr     | Optional    | Only if client specifies subcategories for the service.                                          |
| serviceType         | Required    | Main type of service requested (e.g., therapy, evaluation).                                      |
| expertisesIndArr    | Optional    | Only if client specifies particular expertises.                                                  |
| profTypesArr        | Optional    | Only if client wants to restrict to certain professional types.                                  |
| applications        | System      | Populated as professionals respond.                                                              |
| applicationCount    | System      | Populated as professionals respond.                                                              |
| aggregatedStats     | System      | Populated for analytics.                                                                         |
| clientNoteMsg       | Optional    | Only if client wants to add extra notes.                                                         |
| tppObj              | Optional    | Only if third-party payer is used.                                                               |
| langPref            | Optional    | Only if client has a language preference.                                                        |
| description         | Optional    | Only if client wants to provide a free-text description.                                         |
| status              | System      | Managed by backend/workflow.                                                                     |
| clientAddress       | Conditional | Required for in-person sessions; optional for online-only.                                       |
| scheduledTimestamp  | System/Opt  | Populated when appointment is scheduled.                                                         |
| dateTime            | System/Opt  | Populated when appointment is scheduled.                                                         |
| title               | Optional    | Only if client wants to give a custom title.                                                     |
| periodsArr          | Optional    | Used for advanced scheduling; not always present.                                                |
| clientAgeGroup      | Conditional | Required if relevant for matching (e.g., child, adult, senior).                                  |
| appliedProfIds      | System      | Populated as professionals apply.                                                                |
| clientDOB           | Conditional | Required if appointment is for someone other than the user, or for age-based matching.           |
| noAvailPref         | Optional    | Only if client indicates no availability preference.                                             |

**Legend**
- **Required:** Must be present for a valid appointment request.
- **Optional:** Can be omitted; filled in by user if desired.
- **Conditional:** Required only in certain flows (e.g., in-person, for dependents, or if a specific option is selected).
- **System:** Managed by backend or filled automatically during workflow. 