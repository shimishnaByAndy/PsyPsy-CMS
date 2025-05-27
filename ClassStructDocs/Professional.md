# Professional Class

## Overview
The `Professional` class represents a professional's profile in the system. It contains personal, professional, and business information used for onboarding, compliance, and client matching.

## Fields
| Field               | Type      | Description                                                                                   |
|---------------------|-----------|----------------------------------------------------------------------------------------------|
| objectId            | String    | Unique identifier for the professional profile (system-managed).                              |
| createdAt           | Date      | Date and time the profile was created (system-managed).                                       |
| updatedAt           | Date      | Date and time the profile was last updated (system-managed).                                  |
| ACL                 | ACL       | Access control list for profile data (system-managed).                                        |
| userPtr             | Pointer   | Reference to the associated user account (system-managed).                                    |
| profType            | Number    | Professional type – The regulated profession (e.g., psychologist, social worker, etc.).       |
| servOfferedArr      | Array     | Services offered – List of service type codes the professional provides.                      |
| servOfferedObj      | Object    | Service details – Structured info about each offered service (modalities, rates, etc.).       |
| lastName            | String    | Last name – The professional's family name.                                                   |
| firstName           | String    | First name – The professional's given name.                                                   |
| dob                 | Date      | Date of birth – Used to verify identity and ensure compliance.                                |
| offeredLangArr      | Array     | Languages offered – List of languages in which services are provided.                         |
| gender              | Number    | Gender – Used for matching and client preferences.                                            |
| motherTongue        | Number    | Mother tongue – The professional's native language.                                           |
| eduInstitute        | Number    | Educational institution – Code for the institution where the professional graduated.           |
| eduInstStr          | String    | Educational institution (other) – Free text if not in the list.                               |
| businessName        | String    | Business/practice name – Name under which the professional operates (appears on receipts).    |
| meetType            | Number    | Consultation format – In-person, online, or both.                                             |
| addressObj          | Object    | Business address – Structured address for in-person services.                                 |
| taxInfo             | Object    | Tax information – GST/QST numbers for receipts (optional).                                    |
| thirdPartyPayers    | Array     | Third-party payers – Supported payers (e.g., CNESST, SAAQ, IVAC, Veterans).                   |
| servedClientele     | Array     | Client groups served – Types of clients (adults, children, couples, etc.).                    |
| partOfOrder         | Object    | Professional order membership – Details about order membership (number, name, etc.).          |
| partOfPsychoOrder   | Object    | Psychotherapy order membership – If applicable, details for psychotherapy order.              |
| availability        | Array     | Availability – Days and time slots when the professional is available for appointments.        |
| bussEmail           | String    | Professional email – Used for invoices and client communication.                              |
| phoneNb             | Object    | Phone number – Contact number, may include sharing preferences.                               |
| stagedExpertises    | Array     | Staged expertises – Temporarily selected expertises during onboarding.                        |
| changeLog           | Array     | Change log – History of profile changes (system-managed).                                     |
| expertises          | Array     | Expertises – Areas of specialization (e.g., anxiety, trauma, etc.).                           |
| allSubcategsArr     | Array     | All subcategories – All sub-specializations covered (computed).                               |
| bussPhoneNb         | String    | Business phone number – Public phone number for the practice.                                 |

## User-Facing Field Descriptions
- **Professional type (profType):**
  > Choose your professional title (e.g., psychologist, social worker, psychoeducator, etc.).
- **Services offered (servOfferedArr/servOfferedObj):**
  > Select the types of services you provide (e.g., therapy, evaluation, coaching).
- **First/Last name (firstName, lastName):**
  > Your legal name. Used for communication and on official documents.
- **Date of birth (dob):**
  > Your date of birth. Used to verify your identity and ensure compliance.
- **Languages offered (offeredLangArr):**
  > Which languages do you offer services in? Select all that apply.
- **Gender (gender):**
  > Please select your gender. This helps with client matching and preferences.
- **Mother tongue (motherTongue):**
  > What is your native language? This helps us better match you with clients.
- **Educational institution (eduInstitute/eduInstStr):**
  > Where did you receive your professional training? Select from the list or enter manually.
- **Business/practice name (businessName):**
  > The name under which you practice. This will appear on your invoices.
- **Consultation format (meetType):**
  > Do you offer in-person, online, or both types of consultations?
- **Business address (addressObj):**
  > Your practice address. Used for in-person appointment matching and receipts.
- **Tax information (taxInfo):**
  > Enter your GST/QST numbers for receipts (optional).
- **Third-party payers (thirdPartyPayers):**
  > Select which third-party payers you accept (e.g., CNESST, SAAQ, IVAC, Veterans).
- **Client groups served (servedClientele):**
  > Which types of clients do you work with? (e.g., adults, children, couples, families)
- **Professional order membership (partOfOrder):**
  > Details about your professional order (e.g., order name, number, validity).
- **Psychotherapy order membership (partOfPsychoOrder):**
  > If you are a member of a psychotherapy order, provide details here.
- **Availability (availability):**
  > Set your weekly availability for receiving appointment requests. You can update this anytime.
- **Professional email (bussEmail):**
  > Your professional email address. Used for sending invoices and client communication.
- **Phone number (phoneNb):**
  > Your contact number. Used for important notifications or last-minute changes.
- **Expertises (expertises, stagedExpertises, allSubcategsArr):**
  > Select your areas of specialization and sub-specializations.
- **Business phone number (bussPhoneNb):**
  > Your public business phone number, if different from your main contact number.

> **Note:** System fields (`objectId`, `createdAt`, `updatedAt`, `ACL`, `userPtr`, `changeLog`, etc.) are not shown to users but are essential for backend management and security. 

## Raw Structure
```js
Professional: {
  objectId: { type: 'String' },
  createdAt: { type: 'Date' },
  updatedAt: { type: 'Date' },
  ACL: { type: 'ACL' },
  userPtr: { type: 'Pointer', targetClass: '_User' },
  profType: { type: 'Number' },
  servOfferedArr: { type: 'Array' },
  servOfferedObj: { type: 'Object' },
  lastName: { type: 'String' },
  firstName: { type: 'String' },
  dob: { type: 'Date' },
  offeredLangArr: { type: 'Array' },
  gender: { type: 'Number' },
  motherTongue: { type: 'Number' },
  eduInstitute: { type: 'Number' },
  eduInstStr: { type: 'String' },
  businessName: { type: 'String' },
  meetType: { type: 'Number' },
  addressObj: { type: 'Object' },
  taxInfo: { type: 'Object' },
  thirdPartyPayers: { type: 'Array' },
  servedClientele: { type: 'Array' },
  partOfOrder: { type: 'Object' },
  partOfPsychoOrder: { type: 'Object' },
  availability: { type: 'Array' },
  bussEmail: { type: 'String' },
  phoneNb: { type: 'Object' },
  stagedExpertises: { type: 'Array' },
  changeLog: { type: 'Array' },
  expertises: { type: 'Array' },
  allSubcategsArr: { type: 'Array' },
  bussPhoneNb: { type: 'String' }
}
``` 