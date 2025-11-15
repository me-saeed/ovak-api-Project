# Ovok API Testing Roadmap

This document provides a structured approach to testing all Ovok APIs, organized by dependencies and complexity.

## Testing Phases

### Phase 1: Foundation - Authentication ✅
**Goal**: Establish authentication and verify token management

#### Standard Authentication
- [ ] `POST /auth/register` - Register new account
- [ ] `POST /auth/login` - Login and get access token
- [ ] `POST /auth/refresh` - Refresh expired token
- [ ] `GET /auth/account` - Get account information
- [ ] `GET /auth/sessions` - List all sessions
- [ ] `DELETE /auth/sessions` - Revoke sessions

#### Tenant Authentication - Practitioner
- [ ] `POST /tenant/practitioner/login` - Practitioner login
- [ ] `POST /tenant/practitioner/exchange-token` - Exchange token
- [ ] `POST /tenant/practitioner/mfa` - Multi-factor authentication

#### Tenant Authentication - Patient
- [ ] `POST /tenant/patient/register` - Patient registration
- [ ] `POST /tenant/patient/login` - Patient login
- [ ] `POST /tenant/patient/exchange-token` - Exchange token
- [ ] `POST /tenant/patient/mfa` - Multi-factor authentication

**Test Data Needed:**
- Test account credentials
- Practitioner credentials
- Patient registration data

**Success Criteria:**
- All authentication endpoints return valid tokens
- Tokens can be used for subsequent API calls
- Token refresh works correctly
- Sessions can be managed

---

### Phase 2: Independent APIs ✅
**Goal**: Test APIs that don't depend on FHIR resources

#### Organization Codes
- [ ] `POST /organization-codes` - Receive organization codes

#### AI Translation
- [ ] `POST /ai/translate` - Translate text

#### CMS (Content Management)
- [ ] `POST /cms/content` - Create content
- [ ] `GET /cms/content/search` - Search content
- [ ] `GET /cms/content/{key}/{language}` - Get content by key/language
- [ ] `PUT /cms/content/{id}` - Update content
- [ ] `DELETE /cms/content/{id}` - Delete content
- [ ] `POST /cms/content/copy` - Copy multiple contents
- [ ] `POST /cms/content/{id}/copy` - Copy single content
- [ ] `GET /cms/content/mapped/search` - Search mapped content

#### Localization
- [ ] `GET /localization/i18next/{language}` - Get i18next JSON
- [ ] `PATCH /localization/i18next/{language}` - Update i18next JSON
- [ ] `GET /localization/mapped` - Get mapped localizations

**Test Data Needed:**
- Sample content for CMS
- Translation text samples
- Language codes for localization

**Success Criteria:**
- All endpoints respond correctly
- CRUD operations work as expected
- Search and filtering work properly

---

### Phase 3: Document Management ✅
**Goal**: Test document upload and management

#### Document Operations
- [ ] `POST /documents/upload` - Upload document (generate credentials)
- [ ] `GET /documents/search` - Search documents
- [ ] `GET /documents/{id}/public` - Get public document
- [ ] `GET /documents/{id}` - Get authenticated document
- [ ] `PATCH /documents/{id}` - Update document metadata
- [ ] `POST /documents/{id}/credentials` - Generate credentials for replacement
- [ ] `DELETE /documents/{id}` - Delete document

**Test Data Needed:**
- Sample documents (PDF, images, etc.)
- Document metadata

**Success Criteria:**
- Documents can be uploaded
- Documents can be retrieved (public and authenticated)
- Metadata can be updated
- Documents can be deleted
- Credentials generation works

---

### Phase 4: Basic FHIR Resources ✅
**Goal**: Create and manage foundational FHIR resources

#### Patient Resource
- [ ] `POST /fhir/Patient` - Create patient
- [ ] `GET /fhir/Patient/{id}` - Read patient
- [ ] `GET /fhir/Patient?name={name}` - Search patients
- [ ] `PUT /fhir/Patient/{id}` - Update patient
- [ ] `DELETE /fhir/Patient/{id}` - Delete patient

#### Practitioner Resource
- [ ] `POST /fhir/Practitioner` - Create practitioner
- [ ] `GET /fhir/Practitioner/{id}` - Read practitioner
- [ ] `GET /fhir/Practitioner?name={name}` - Search practitioners
- [ ] `PUT /fhir/Practitioner/{id}` - Update practitioner
- [ ] `DELETE /fhir/Practitioner/{id}` - Delete practitioner

**Test Data Needed:**
- Patient demographics (name, DOB, gender, etc.)
- Practitioner information (name, qualifications, etc.)

**Success Criteria:**
- Resources can be created with valid FHIR structure
- Resources can be read by ID
- Search returns expected results
- Updates modify resources correctly
- Deletes remove resources

**Notes:**
- These are foundational resources - other resources will reference them
- Save the IDs for use in Phase 5

---

### Phase 5: Dependent FHIR Resources ✅
**Goal**: Create resources that depend on Patient/Practitioner

#### Encounter Resource
- [ ] `POST /fhir/Encounter` - Create encounter (references Patient + Practitioner)
- [ ] `GET /fhir/Encounter/{id}` - Read encounter
- [ ] `GET /fhir/Encounter?patient={patientId}` - Search encounters by patient
- [ ] `PUT /fhir/Encounter/{id}` - Update encounter
- [ ] `DELETE /fhir/Encounter/{id}` - Delete encounter

#### Observation Resource
- [ ] `POST /fhir/Observation` - Create observation (references Patient, optionally Encounter)
- [ ] `GET /fhir/Observation/{id}` - Read observation
- [ ] `GET /fhir/Observation?patient={patientId}` - Search observations by patient
- [ ] `PUT /fhir/Observation/{id}` - Update observation
- [ ] `DELETE /fhir/Observation/{id}` - Delete observation

#### Appointment Resource
- [ ] `POST /fhir/Appointment` - Create appointment (references Patient + Practitioner)
- [ ] `GET /fhir/Appointment/{id}` - Read appointment
- [ ] `GET /fhir/Appointment?patient={patientId}` - Search appointments by patient
- [ ] `PUT /fhir/Appointment/{id}` - Update appointment
- [ ] `DELETE /fhir/Appointment/{id}` - Delete appointment

**Test Data Needed:**
- Patient ID (from Phase 4)
- Practitioner ID (from Phase 4)
- Encounter details (status, type, period)
- Observation data (value, code, effective date)
- Appointment details (status, start time, participant)

**Success Criteria:**
- Resources created with correct references
- References resolve correctly
- Search by reference works
- Updates maintain references

---

### Phase 6: Complex FHIR Resources ✅
**Goal**: Test resources with multiple dependencies

#### Questionnaire Resource
- [ ] `POST /fhir/Questionnaire` - Create questionnaire
- [ ] `GET /fhir/Questionnaire/{id}` - Read questionnaire
- [ ] `GET /fhir/Questionnaire` - Search questionnaires
- [ ] `PUT /fhir/Questionnaire/{id}` - Update questionnaire
- [ ] `DELETE /fhir/Questionnaire/{id}` - Delete questionnaire

#### QuestionnaireResponse Resource
- [ ] `POST /fhir/QuestionnaireResponse` - Create response (references Questionnaire + Patient)
- [ ] `GET /fhir/QuestionnaireResponse/{id}` - Read response
- [ ] `GET /fhir/QuestionnaireResponse?patient={patientId}` - Search responses
- [ ] `PUT /fhir/QuestionnaireResponse/{id}` - Update response
- [ ] `DELETE /fhir/QuestionnaireResponse/{id}` - Delete response

#### Condition Resource
- [ ] `POST /fhir/Condition` - Create condition (references Patient)
- [ ] `GET /fhir/Condition/{id}` - Read condition
- [ ] `GET /fhir/Condition?patient={patientId}` - Search conditions
- [ ] `PUT /fhir/Condition/{id}` - Update condition
- [ ] `DELETE /fhir/Condition/{id}` - Delete condition

#### CarePlan Resource
- [ ] `POST /fhir/CarePlan` - Create care plan (references Patient + Practitioner, optionally Condition)
- [ ] `GET /fhir/CarePlan/{id}` - Read care plan
- [ ] `GET /fhir/CarePlan?patient={patientId}` - Search care plans
- [ ] `PUT /fhir/CarePlan/{id}` - Update care plan
- [ ] `DELETE /fhir/CarePlan/{id}` - Delete care plan

**Test Data Needed:**
- Questionnaire structure (questions, answer options)
- QuestionnaireResponse answers
- Condition details (code, onset date, severity)
- CarePlan details (goals, activities, status)

**Success Criteria:**
- Complex resources created successfully
- Multiple references work correctly
- Search with multiple filters works
- Updates maintain all references

---

### Phase 7: Advanced FHIR Operations ✅
**Goal**: Test complex operations and edge cases

#### Bundle Operations
- [ ] `POST /fhir/Bundle` - Transaction bundle (create multiple resources atomically)
- [ ] `POST /fhir/Bundle` - Batch bundle (multiple operations)
- [ ] Test bundle with interdependent resources
- [ ] Test bundle rollback on error

#### Binary Resources
- [ ] `POST /fhir/Binary` - Create binary resource
- [ ] `GET /fhir/Binary/{id}` - Read binary resource
- [ ] Link binary to DocumentReference

#### DocumentReference with Documents
- [ ] Upload document via `/documents/upload`
- [ ] Create DocumentReference linking to document
- [ ] Link DocumentReference to Patient
- [ ] Retrieve document via DocumentReference

#### Advanced Search
- [ ] Search with multiple parameters
- [ ] Search with date ranges
- [ ] Search with reference filters
- [ ] Search with _include/_revinclude
- [ ] Search with pagination
- [ ] Search with sorting

**Test Data Needed:**
- Multiple resources for bundle
- Binary files (images, PDFs)
- Complex search queries

**Success Criteria:**
- Bundles execute atomically
- Binary resources work correctly
- Document linking works end-to-end
- Advanced searches return correct results

---

### Phase 8: Integration & Workflows ✅
**Goal**: Test complete user journeys

#### Patient Onboarding Workflow
- [ ] Patient registers
- [ ] Patient logs in
- [ ] Create FHIR Patient resource
- [ ] Upload documents
- [ ] Complete questionnaire
- [ ] Verify bot processes questionnaire (if applicable)
- [ ] Schedule appointment

#### Practitioner Clinical Workflow
- [ ] Practitioner logs in
- [ ] Search for patient
- [ ] View patient record
- [ ] Create encounter
- [ ] Record observations
- [ ] Create/update care plan
- [ ] Schedule follow-up appointment

#### Document Management Workflow
- [ ] Upload document
- [ ] Create DocumentReference
- [ ] Link to Patient
- [ ] Retrieve document
- [ ] Update document metadata
- [ ] Delete document

#### Multi-Resource Workflow
- [ ] Create Patient, Practitioner, Encounter, Observation in one Bundle
- [ ] Verify all resources created
- [ ] Verify references resolved
- [ ] Search across related resources

**Success Criteria:**
- Complete workflows execute successfully
- All steps complete in correct order
- Data persists correctly
- References maintained throughout

---

### Phase 9: Access Control & Security ✅
**Goal**: Verify access policies and security

#### Patient Access
- [ ] Patient can access own resources
- [ ] Patient cannot access other patients' resources
- [ ] Patient cannot access practitioner-only resources
- [ ] Patient can see shared resources

#### Practitioner Access
- [ ] Practitioner can access assigned patients
- [ ] Practitioner cannot access unassigned patients
- [ ] Practitioner can create resources for patients
- [ ] Practitioner can update own resources

#### Access Policy Testing
- [ ] Test compartment-based access
- [ ] Test criteria-based access
- [ ] Test hidden resource fields
- [ ] Test parameterized access policies
- [ ] Test access denial scenarios

#### Multi-Tenant Isolation
- [ ] Resources from Tenant A not visible to Tenant B
- [ ] Practitioners from different tenants isolated
- [ ] Patients from different tenants isolated

**Success Criteria:**
- Access policies enforced correctly
- Unauthorized access denied
- Tenant isolation maintained
- Role-based access works

---

### Phase 10: Error Handling & Edge Cases ✅
**Goal**: Test error scenarios and edge cases

#### Invalid Requests
- [ ] Missing required fields
- [ ] Invalid data types
- [ ] Invalid references
- [ ] Malformed JSON
- [ ] Missing authentication

#### Resource Not Found
- [ ] Read non-existent resource
- [ ] Update non-existent resource
- [ ] Delete non-existent resource
- [ ] Reference non-existent resource

#### Validation Errors
- [ ] Invalid FHIR structure
- [ ] Invalid codes/values
- [ ] Missing required references
- [ ] Circular references

#### Edge Cases
- [ ] Very large resources
- [ ] Special characters in data
- [ ] Unicode characters
- [ ] Empty searches
- [ ] Concurrent updates
- [ ] Token expiration during request

**Success Criteria:**
- Appropriate error codes returned
- Error messages are clear
- No system crashes
- Graceful error handling

---

## Test Data Management

### Test Data Template

```json
{
  "patient": {
    "id": "patient-123",
    "name": "John Doe",
    "birthDate": "1990-01-01",
    "gender": "male"
  },
  "practitioner": {
    "id": "practitioner-456",
    "name": "Dr. Jane Smith",
    "qualification": "MD"
  },
  "encounter": {
    "id": "encounter-789",
    "status": "finished",
    "type": "ambulatory"
  }
}
```

### Resource ID Tracking

Keep track of created resource IDs:
- Patient IDs: `[]`
- Practitioner IDs: `[]`
- Encounter IDs: `[]`
- Observation IDs: `[]`
- Appointment IDs: `[]`
- Document IDs: `[]`

---

## Testing Tools Recommendations

### API Testing Tools
- **Postman** - For manual API testing
- **Insomnia** - Alternative to Postman
- **curl** - Command-line testing
- **HTTPie** - User-friendly CLI tool

### Test Automation
- **Jest/Mocha** - JavaScript testing
- **pytest** - Python testing
- **REST Assured** - Java testing
- **Newman** - Postman collection runner

### Documentation
- **Swagger/OpenAPI** - API documentation
- **FHIR Validator** - Validate FHIR resources

---

## Progress Tracking

### Overall Progress
- [ ] Phase 1: Foundation (0/11)
- [ ] Phase 2: Independent APIs (0/13)
- [ ] Phase 3: Document Management (0/7)
- [ ] Phase 4: Basic FHIR Resources (0/10)
- [ ] Phase 5: Dependent FHIR Resources (0/15)
- [ ] Phase 6: Complex FHIR Resources (0/20)
- [ ] Phase 7: Advanced Operations (0/8)
- [ ] Phase 8: Integration Workflows (0/4)
- [ ] Phase 9: Access Control (0/12)
- [ ] Phase 10: Error Handling (0/15)

**Total Endpoints to Test: ~125**

---

## Notes & Observations

### Issues Found
- 

### Questions
- 

### Best Practices Discovered
- 

---

## References

- **Platform Guide**: See `OVOK_PLATFORM_GUIDE.md`
- **API Documentation**: See `OVOK_API_DOCUMENTATION.md`
- **Official Docs**: [https://docs.ovok.com](https://docs.ovok.com)


