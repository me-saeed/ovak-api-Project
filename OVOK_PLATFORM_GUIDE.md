# Ovok Platform Guide: How Everything Works Together

## Table of Contents

1. [Platform Architecture Overview](#platform-architecture-overview)
2. [Authentication Flows](#authentication-flows)
3. [How APIs Work Together](#how-apis-work-together)
4. [Common Workflows](#common-workflows)
5. [API Dependencies](#api-dependencies)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Testing Strategy](#testing-strategy)

---

## Platform Architecture Overview

### What is Ovok?

Ovok is an **API-first digital health platform** that provides:
- **FHIR-compliant healthcare data management** - Standard healthcare data exchange
- **Multi-tenant architecture** - Separate spaces for different organizations
- **Role-based access** - Different authentication for Practitioners vs Patients
- **Project-based organization** - Resources grouped into projects
- **Automated workflows** - Bots for event-driven automation

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    Ovok Platform                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  High-Level  │  │   FHIR API   │  │   Projects   │ │
│  │     API      │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│  ┌──────┴──────────────────┴──────────────────┴──────┐ │
│  │         Authentication & Authorization Layer       │ │
│  └───────────────────────────────────────────────────┘ │
│         │                                               │
│  ┌──────┴───────────────────────────────────────────┐ │
│  │         Access Policies & Security               │ │
│  └───────────────────────────────────────────────────┘ │
│         │                                               │
│  ┌──────┴───────────────────────────────────────────┐ │
│  │         Bots & Automation                        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Key Concepts

1. **Projects**: Logical containers that group related resources
2. **Tenants**: Separate organizations with their own data and users
3. **Access Policies**: Control who can access what resources
4. **FHIR Resources**: Standard healthcare data structures
5. **Bots**: Automated processes that respond to events

---

## Authentication Flows

### Understanding the Three Authentication Layers

Ovok has **three distinct authentication systems** that serve different purposes:

#### 1. Standard Authentication (`/auth/*`)
**Purpose**: General platform access, admin operations, API management

**Flow:**
```
1. POST /auth/register  → Create account
2. POST /auth/login     → Get access_token
3. Use access_token     → Access general APIs
4. POST /auth/refresh   → Refresh expired token
```

**Use Cases:**
- Platform administrators
- API developers
- System integrations
- General account management

#### 2. Tenant Authentication - Practitioner (`/tenant/practitioner/*`)
**Purpose**: Healthcare provider access to patient data and clinical operations

**Flow:**
```
1. POST /tenant/practitioner/login        → Initial auth
2. POST /tenant/practitioner/mfa          → Multi-factor (if required)
3. POST /tenant/practitioner/exchange-token → Get tenant-scoped token
4. Use tenant token → Access FHIR resources, patient data
```

**Use Cases:**
- Doctors accessing patient records
- Nurses viewing care plans
- Clinical staff managing appointments
- Practitioners creating observations

#### 3. Tenant Authentication - Patient (`/tenant/patient/*`)
**Purpose**: Patient access to their own health data

**Flow:**
```
1. POST /tenant/patient/register  → Patient registration
2. POST /tenant/patient/login      → Patient login
3. POST /tenant/patient/mfa        → Multi-factor (if required)
4. POST /tenant/patient/exchange-token → Get patient-scoped token
5. Use patient token → Access own resources only
```

**Use Cases:**
- Patients viewing their records
- Patients completing questionnaires
- Patients accessing appointments
- Patients uploading documents

### Why Three Different Auth Systems?

- **Security**: Different access levels require different authentication
- **Compliance**: Healthcare regulations require role-based access
- **Isolation**: Patients can only see their data, practitioners see assigned patients
- **Access Policies**: Different policies apply to different user types

---

## How APIs Work Together

### The API Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│                    API Request Flow                          │
└─────────────────────────────────────────────────────────────┘

1. Authentication APIs
   ↓
   [Get access_token]
   ↓
2. High-Level APIs (Simplified operations)
   ↓
   [Documents, CMS, Translation, Organization Codes]
   ↓
3. FHIR APIs (Standard healthcare operations)
   ↓
   [Patient, Practitioner, Observation, Encounter, etc.]
   ↓
4. Supporting Systems
   ↓
   [Bots trigger on events]
   [Access Policies enforce security]
   [Projects organize resources]
```

### API Categories and Their Relationships

#### Category 1: Foundation APIs (Start Here)
**Authentication APIs** → Required for everything else
- Must authenticate before accessing any other API
- Different auth types unlock different capabilities

#### Category 2: Content Management APIs
**CMS & Localization APIs** → Manage application content
- Independent of FHIR resources
- Used for UI content, translations, static data
- Can be used with any authentication type

#### Category 3: Document Management APIs
**Document APIs** → Handle files and documents
- Can work standalone or link to FHIR DocumentReference
- Supports both public and authenticated access
- Often used with FHIR resources

#### Category 4: Core Healthcare APIs
**FHIR APIs** → Manage healthcare data
- Requires tenant authentication (Practitioner or Patient)
- Resources reference each other (Patient → Encounter → Observation)
- Access policies control visibility

#### Category 5: Automation APIs
**Bots** → Respond to API events
- Triggered by FHIR resource changes
- Can call other APIs
- Use secrets for external integrations

---

## Common Workflows

### Workflow 1: Patient Registration & Onboarding

```
Step 1: Patient Registration
  POST /tenant/patient/register
  → Creates patient account
  → Returns patient_id

Step 2: Patient Login
  POST /tenant/patient/login
  → Returns access_token (patient-scoped)

Step 3: Create Patient FHIR Resource
  POST /fhir/Patient
  → Creates FHIR Patient resource
  → Links to patient account

Step 4: Complete Intake Questionnaire
  GET /fhir/Questionnaire/{id}  → Get questionnaire
  POST /fhir/QuestionnaireResponse → Submit answers
  → Bot may process responses automatically

Step 5: Upload Documents
  POST /documents/upload
  → Upload medical records, insurance cards, etc.
  POST /fhir/DocumentReference
  → Link document to patient
```

**Dependencies:**
- Registration → Login → FHIR Patient → Questionnaire → Documents

### Workflow 2: Practitioner Clinical Workflow

```
Step 1: Practitioner Login
  POST /tenant/practitioner/login
  → Returns practitioner-scoped token

Step 2: Search for Patients
  GET /fhir/Patient?name=John
  → Find patients (access policy controls visibility)

Step 3: View Patient Details
  GET /fhir/Patient/{patientId}
  → Get full patient record

Step 4: Create Encounter
  POST /fhir/Encounter
  → Reference: Patient/{patientId}
  → Reference: Practitioner/{practitionerId}
  → Creates visit record

Step 5: Record Observations
  POST /fhir/Observation
  → Reference: Patient/{patientId}
  → Reference: Encounter/{encounterId}
  → Record vital signs, lab results, etc.

Step 6: Create Care Plan
  POST /fhir/CarePlan
  → Reference: Patient/{patientId}
  → Reference: Practitioner/{practitionerId}
  → Define treatment plan

Step 7: Schedule Follow-up
  POST /fhir/Appointment
  → Reference: Patient/{patientId}
  → Reference: Practitioner/{practitionerId}
  → Book next visit
```

**Dependencies:**
- Login → Search Patient → Read Patient → Create Encounter → Create Observations → Create CarePlan → Create Appointment

### Workflow 3: Document Management with FHIR

```
Step 1: Upload Document
  POST /documents/upload
  → Returns document_id and credentials

Step 2: Link to FHIR Resource
  POST /fhir/DocumentReference
  {
    "subject": { "reference": "Patient/123" },
    "content": [{
      "attachment": {
        "url": "https://.../documents/{document_id}"
      }
    }]
  }

Step 3: Access Document
  GET /documents/{id}  (authenticated)
  GET /documents/{id}/public  (if public credentials provided)
```

**Dependencies:**
- Upload Document → Create DocumentReference → Link to Patient

### Workflow 4: Multi-Resource Operations (Bundle)

```
Step 1: Create Multiple Resources at Once
  POST /fhir/Bundle
  {
    "type": "transaction",
    "entry": [
      { "resource": { Patient data } },
      { "resource": { Encounter data, references Patient } },
      { "resource": { Observation data, references Patient & Encounter } }
    ]
  }
  → All resources created atomically
  → References resolved automatically
```

**Dependencies:**
- Bundle creates all resources together, maintaining references

### Workflow 5: Event-Driven Automation (Bots)

```
Step 1: FHIR Resource Created
  POST /fhir/QuestionnaireResponse
  → Resource created

Step 2: Bot Triggered
  → Bot automatically executes
  → Bot can read the QuestionnaireResponse
  → Bot can create other resources
  → Bot can send emails via Custom Email Bot
  → Bot can access secrets for external APIs

Step 3: Bot Actions
  GET /fhir/QuestionnaireResponse/{id}
  → Bot reads response
  POST /fhir/Observation
  → Bot creates observation based on response
  → Bot uses secrets to call external service
```

**Dependencies:**
- Resource creation → Bot event → Bot reads resource → Bot creates/modifies resources

---

## API Dependencies

### Dependency Map

```
┌─────────────────────────────────────────────────────────┐
│                    Dependency Tree                       │
└─────────────────────────────────────────────────────────┘

Level 0 (No Dependencies):
  - POST /auth/register
  - POST /auth/login
  - POST /tenant/patient/register
  - POST /tenant/practitioner/login

Level 1 (Requires Authentication):
  - GET /auth/account (needs: access_token)
  - GET /auth/sessions (needs: access_token)
  - POST /auth/refresh (needs: refresh_token)

Level 2 (Requires Tenant Auth):
  - GET /fhir/Patient (needs: tenant token)
  - POST /fhir/Patient (needs: tenant token)
  - GET /fhir/Practitioner (needs: tenant token)

Level 3 (Requires Existing Resources):
  - POST /fhir/Encounter (needs: Patient exists, Practitioner exists)
  - POST /fhir/Observation (needs: Patient exists, optionally Encounter)
  - POST /fhir/Appointment (needs: Patient exists, Practitioner exists)

Level 4 (Requires Multiple Resources):
  - POST /fhir/CarePlan (needs: Patient, Practitioner, possibly Condition)
  - POST /fhir/QuestionnaireResponse (needs: Questionnaire exists, Patient exists)

Level 5 (Complex Operations):
  - POST /fhir/Bundle (can create multiple interdependent resources)
  - Bot operations (triggered by resource changes)
```

### Testing Order Based on Dependencies

**Phase 1: Foundation (No Dependencies)**
1. ✅ Authentication APIs
   - Register, Login, Refresh Token
   - Session Management
   - Account Information

**Phase 2: Independent APIs (Only need auth)**
2. ✅ Organization Codes
3. ✅ AI Translation
4. ✅ CMS APIs
5. ✅ Localization APIs
6. ✅ Document Upload (standalone)

**Phase 3: Tenant Authentication**
7. ✅ Practitioner Login/Exchange Token/MFA
8. ✅ Patient Register/Login/Exchange Token/MFA

**Phase 4: Basic FHIR Resources (Need tenant auth)**
9. ✅ Create Patient (FHIR)
10. ✅ Create Practitioner (FHIR)
11. ✅ Read Patient/Practitioner
12. ✅ Search Patient/Practitioner

**Phase 5: Dependent FHIR Resources**
13. ✅ Create Encounter (needs Patient + Practitioner)
14. ✅ Create Observation (needs Patient, optionally Encounter)
15. ✅ Create Appointment (needs Patient + Practitioner)

**Phase 6: Complex FHIR Resources**
16. ✅ Create Questionnaire
17. ✅ Create QuestionnaireResponse (needs Questionnaire + Patient)
18. ✅ Create CarePlan (needs Patient + Practitioner)
19. ✅ Create Condition (needs Patient)

**Phase 7: Advanced Operations**
20. ✅ Bundle Operations
21. ✅ Document + DocumentReference linking
22. ✅ Search with filters and parameters
23. ✅ Update operations
24. ✅ Delete operations

**Phase 8: Integration Testing**
25. ✅ Bot triggers
26. ✅ Access policy testing
27. ✅ Multi-tenant isolation
28. ✅ End-to-end workflows

---

## Data Flow Diagrams

### Patient Data Flow

```
Patient Registration
    │
    ├─→ Account Created (/tenant/patient/register)
    │
    ├─→ Patient Logs In (/tenant/patient/login)
    │   └─→ Gets patient-scoped token
    │
    ├─→ FHIR Patient Created (/fhir/Patient)
    │   └─→ Links to account
    │
    ├─→ Documents Uploaded (/documents/upload)
    │   └─→ Linked via DocumentReference
    │
    ├─→ Questionnaire Completed (/fhir/QuestionnaireResponse)
    │   └─→ Bot processes response
    │       └─→ Creates Observations
    │
    └─→ Appointment Scheduled (/fhir/Appointment)
        └─→ Encounter Created on visit (/fhir/Encounter)
            └─→ Observations Recorded (/fhir/Observation)
                └─→ CarePlan Updated (/fhir/CarePlan)
```

### Practitioner Data Flow

```
Practitioner Login
    │
    ├─→ Authenticates (/tenant/practitioner/login)
    │   └─→ Gets practitioner-scoped token
    │
    ├─→ Searches Patients (/fhir/Patient?name=...)
    │   └─→ Access policy filters results
    │
    ├─→ Views Patient Record (/fhir/Patient/{id})
    │   └─→ Can see assigned patients only
    │
    ├─→ Creates Encounter (/fhir/Encounter)
    │   ├─→ References Patient
    │   └─→ References Practitioner
    │
    ├─→ Records Observations (/fhir/Observation)
    │   ├─→ References Patient
    │   ├─→ References Encounter
    │   └─→ References Practitioner
    │
    └─→ Updates CarePlan (/fhir/CarePlan)
        ├─→ References Patient
        └─→ References Practitioner
```

### Resource Reference Chain

```
Patient/{id}
    │
    ├─→ Encounter/{id} (references Patient)
    │   │
    │   └─→ Observation/{id} (references Patient + Encounter)
    │
    ├─→ Appointment/{id} (references Patient + Practitioner)
    │
    ├─→ QuestionnaireResponse/{id} (references Patient + Questionnaire)
    │
    ├─→ CarePlan/{id} (references Patient + Practitioner)
    │
    ├─→ Condition/{id} (references Patient)
    │
    └─→ DocumentReference/{id} (references Patient)
        └─→ Points to Binary or /documents/{id}
```

---

## Testing Strategy

### 1. Test Authentication First

**Why**: Everything depends on authentication

**Test Sequence:**
```
1. Test registration (no dependencies)
2. Test login (depends on registration)
3. Test token refresh (depends on login)
4. Test account info (depends on valid token)
5. Test session management (depends on login)
```

### 2. Test Independent APIs

**Why**: These don't depend on FHIR resources

**Test Sequence:**
```
1. Organization Codes API
2. AI Translation API
3. CMS APIs (create, read, update, delete)
4. Localization APIs
5. Document Upload (standalone)
```

### 3. Test Tenant Authentication

**Why**: Required for FHIR operations

**Test Sequence:**
```
1. Practitioner login flow
2. Practitioner token exchange
3. Practitioner MFA (if applicable)
4. Patient registration
5. Patient login flow
6. Patient token exchange
7. Patient MFA (if applicable)
```

### 4. Test Basic FHIR Resources

**Why**: Foundation for all healthcare operations

**Test Sequence:**
```
1. Create Patient (no dependencies)
2. Create Practitioner (no dependencies)
3. Read Patient (depends on create)
4. Read Practitioner (depends on create)
5. Search Patient (depends on create)
6. Search Practitioner (depends on create)
7. Update Patient (depends on create)
8. Update Practitioner (depends on create)
```

### 5. Test Dependent FHIR Resources

**Why**: These require other resources to exist

**Test Sequence:**
```
1. Create Encounter (needs Patient + Practitioner)
2. Create Observation (needs Patient)
3. Create Appointment (needs Patient + Practitioner)
4. Create Questionnaire (no dependencies)
5. Create QuestionnaireResponse (needs Questionnaire + Patient)
6. Create Condition (needs Patient)
7. Create CarePlan (needs Patient + Practitioner)
```

### 6. Test Complex Operations

**Why**: Advanced functionality

**Test Sequence:**
```
1. Bundle operations (create multiple resources)
2. Document + DocumentReference linking
3. Search with complex filters
4. Delete operations (test cascading)
5. Update with references
```

### 7. Test Integration & Workflows

**Why**: Real-world scenarios

**Test Scenarios:**
```
1. Complete patient onboarding workflow
2. Complete practitioner clinical workflow
3. Document management workflow
4. Bot trigger and execution
5. Access policy enforcement
6. Multi-tenant isolation
```

### Testing Checklist Template

```markdown
## Authentication Tests
- [ ] Register account
- [ ] Login
- [ ] Refresh token
- [ ] Get account info
- [ ] Get sessions
- [ ] Revoke sessions
- [ ] Practitioner login
- [ ] Practitioner exchange token
- [ ] Patient register
- [ ] Patient login
- [ ] Patient exchange token

## Independent API Tests
- [ ] Organization codes
- [ ] AI translation
- [ ] CMS operations
- [ ] Localization
- [ ] Document upload

## FHIR Basic Tests
- [ ] Create Patient
- [ ] Create Practitioner
- [ ] Read resources
- [ ] Search resources
- [ ] Update resources
- [ ] Delete resources

## FHIR Dependent Tests
- [ ] Create Encounter
- [ ] Create Observation
- [ ] Create Appointment
- [ ] Create QuestionnaireResponse
- [ ] Create CarePlan

## Advanced Tests
- [ ] Bundle operations
- [ ] Document linking
- [ ] Complex searches
- [ ] Bot triggers
- [ ] Access policies
```

---

## Key Takeaways for Testing

### 1. **Authentication is the Foundation**
- Always authenticate first
- Different auth types unlock different APIs
- Tokens expire - test refresh flow

### 2. **Resources Have Dependencies**
- Patient and Practitioner are usually created first
- Other resources reference them
- Use Bundle API for atomic multi-resource operations

### 3. **Access Policies Matter**
- Practitioners see only assigned patients
- Patients see only their own data
- Test access denial scenarios

### 4. **Projects Organize Resources**
- Resources belong to projects
- Access policies apply at project level
- Test project isolation

### 5. **Bots Automate Workflows**
- Bots trigger on resource changes
- Bots can create/modify resources
- Test bot execution and side effects

### 6. **FHIR is Standardized**
- Resources follow FHIR R4 specification
- References use standard format: `ResourceType/id`
- Search uses FHIR search parameters

### 7. **Test End-to-End Workflows**
- Don't just test individual APIs
- Test complete user journeys
- Test error scenarios and edge cases

---

## Next Steps

1. **Set up your test environment**
   - Get API credentials
   - Configure base URL
   - Set up authentication

2. **Start with authentication tests**
   - Follow the dependency order
   - Document your test tokens

3. **Build test data incrementally**
   - Create Patient first
   - Create Practitioner second
   - Then create dependent resources

4. **Test workflows, not just endpoints**
   - Patient onboarding
   - Clinical encounter
   - Document management

5. **Verify access policies**
   - Test what each role can see
   - Test access denials
   - Test multi-tenant isolation

---

## Reference

- **Full API Documentation**: See `OVOK_API_DOCUMENTATION.md`
- **Official Docs**: [https://docs.ovok.com](https://docs.ovok.com)


