# API Bug Reports - Ovok API

**Generated:** 2025-11-16  
**Tester:** QA Team  
**API Base URL:** https://api.ovok.com  
**Total Bugs Found:** 7

---

## Summary

- **Total Bugs:** 7
- **Critical:** 0
- **High:** 3
- **Medium:** 3
- **Low:** 1

### Bug Breakdown by Type
- **Validation:** 3 bugs
- **Error Handling:** 2 bugs
- **Security:** 1 bug
- **Consistency:** 1 bug

---

## Bug Reports

### Bug #1: Patient Creation Accepts Missing Required Fields

**Type:** Validation  
**Severity:** High  
**Endpoint:** POST /fhir/Patient  
**Date Found:** 2025-11-16  
**Status:** Open

#### Description
The API accepts and successfully creates a Patient resource with only `resourceType: "Patient"` and no other required fields (such as name). This violates FHIR R4 specification which requires at least one identifier or name for a Patient resource.

#### Expected Behavior
Should return `400 Bad Request` with a validation error message indicating that required fields are missing (specifically, Patient should have at least one identifier or name).

#### Actual Behavior
Returns `201 Created` and successfully creates a Patient resource with only the resourceType field.

#### Steps to Reproduce
1. Make a POST request to `/fhir/Patient`
2. Send body with only: `{ "resourceType": "Patient" }`
3. Observe that the request succeeds with status 201

#### Request Details
```json
POST /fhir/Patient
Content-Type: application/fhir+json
Authorization: Bearer [token]

{
  "resourceType": "Patient"
}
```

#### Response Details
- **Status Code:** 201 Created
- **Response Body:**
```json
{
  "resourceType": "Patient",
  "id": "019a8b06-d3e8-705d-8c46-19bb2cf1bf76",
  "meta": {
    "versionId": "019a8b06-d3e9-77c3-977b-e5557d965a3a",
    "lastUpdated": "2025-11-16T04:57:51.849Z"
  }
}
```

#### Impact
- **User Impact:** Data integrity issue - allows creation of incomplete/invalid patient records
- **Workaround:** Frontend validation, but backend should enforce this
- **Frequency:** Always
- **FHIR Compliance:** Violates FHIR R4 Patient resource requirements

#### Additional Notes
According to FHIR R4 specification, a Patient resource should have at least one identifier or name. This bug allows creation of patients that don't meet minimum requirements.

---

### Bug #2: Patient Creation Accepts Invalid Gender Value

**Type:** Validation  
**Severity:** High  
**Endpoint:** POST /fhir/Patient  
**Date Found:** 2025-11-16  
**Status:** Open

#### Description
The API accepts invalid gender values that are not part of the FHIR R4 Patient.gender value set. The gender field should only accept: `male`, `female`, `other`, or `unknown`. However, the API accepts any string value (e.g., "invalid-gender") and stores it.

#### Expected Behavior
Should return `400 Bad Request` with a validation error indicating that the gender value must be one of: `male`, `female`, `other`, or `unknown`.

#### Actual Behavior
Returns `201 Created` and successfully creates a Patient with the invalid gender value stored.

#### Steps to Reproduce
1. Make a POST request to `/fhir/Patient`
2. Send body with invalid gender: `{ "resourceType": "Patient", "name": [{ "given": ["John"], "family": "Doe" }], "gender": "invalid-gender" }`
3. Observe that the request succeeds and the invalid gender is stored

#### Request Details
```json
POST /fhir/Patient
Content-Type: application/fhir+json
Authorization: Bearer [token]

{
  "resourceType": "Patient",
  "name": [{
    "given": ["John"],
    "family": "Doe"
  }],
  "gender": "invalid-gender"
}
```

#### Response Details
- **Status Code:** 201 Created
- **Response Body:**
```json
{
  "resourceType": "Patient",
  "name": [{
    "given": ["John"],
    "family": "Doe"
  }],
  "gender": "invalid-gender",
  "id": "019a8b06-d47e-7416-81cb-96edf243f091",
  "meta": {
    "versionId": "019a8b06-d47e-7416-81cb-99a39021a29b",
    "lastUpdated": "2025-11-16T04:57:51.998Z"
  }
}
```

#### Impact
- **User Impact:** Data quality issue - invalid enum values stored in database
- **Workaround:** Frontend validation, but backend should enforce enum constraints
- **Frequency:** Always
- **FHIR Compliance:** Violates FHIR R4 value set constraints

#### Additional Notes
FHIR R4 defines Patient.gender as a code with a fixed value set. The API should validate against this value set and reject invalid values.

---

### Bug #3: Generic Error Messages for Invalid Date Formats

**Type:** Error Handling  
**Severity:** Medium  
**Endpoint:** POST /fhir/Patient  
**Date Found:** 2025-11-16  
**Status:** Open

#### Description
When creating a Patient with an invalid birthDate format, the API returns a generic error message "Invalid date format" without specifying the expected format or providing field-level error details that would help developers fix the issue quickly.

#### Expected Behavior
Should return `400 Bad Request` with a detailed error message that:
- Specifies which field has the error (birthDate)
- Indicates the expected format (YYYY-MM-DD)
- Provides an example of a valid date

#### Actual Behavior
Returns `400 Bad Request` with a generic message "Invalid date format" and the field path in the expression array, but doesn't specify the expected format.

#### Steps to Reproduce
1. Make a POST request to `/fhir/Patient`
2. Send body with invalid date format: `{ "resourceType": "Patient", "name": [{ "given": ["John"], "family": "Doe" }], "birthDate": "2024-13-45" }`
3. Observe the error response

#### Request Details
```json
POST /fhir/Patient
Content-Type: application/fhir+json
Authorization: Bearer [token]

{
  "resourceType": "Patient",
  "name": [{
    "given": ["John"],
    "family": "Doe"
  }],
  "birthDate": "2024-13-45"
}
```

#### Response Details
- **Status Code:** 400 Bad Request
- **Response Body:**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "structure",
    "details": {
      "text": "Invalid date format"
    },
    "expression": ["Patient.birthDate"]
  }]
}
```

#### Impact
- **User Impact:** Developer experience issue - makes debugging harder
- **Workaround:** Developers need to check FHIR documentation for date format
- **Frequency:** Always
- **Improvement Suggestion:** Include expected format in error message, e.g., "Invalid date format. Expected YYYY-MM-DD format."

#### Additional Notes
While the error does include the field path in the expression array, it would be more helpful to include the expected format directly in the error message.

---

### Bug #4: Patient GET Accepts Empty ID

**Type:** Security  
**Severity:** High  
**Endpoint:** GET /fhir/Patient/{id}  
**Date Found:** 2025-11-16  
**Status:** Open

#### Description
The API accepts an empty string as a Patient ID in the URL path (`GET /fhir/Patient/`) and returns a 200 OK response instead of 404 Not Found. This could indicate a security issue or improper input validation.

#### Expected Behavior
Should return `404 Not Found` when an empty or invalid ID is provided in the URL path.

#### Actual Behavior
Returns `200 OK` when accessing `/fhir/Patient/` (with empty ID).

#### Steps to Reproduce
1. Make a GET request to `/fhir/Patient/` (note the trailing slash with no ID)
2. Observe that the request returns 200 OK instead of 404

#### Request Details
```
GET /fhir/Patient/
Authorization: Bearer [token]
```

#### Response Details
- **Status Code:** 200 OK
- **Response Body:** (Unknown - needs investigation)

#### Impact
- **User Impact:** Security/validation concern - unclear what resource is returned
- **Workaround:** Frontend should validate IDs before making requests
- **Frequency:** Always
- **Security Concern:** Could potentially expose unintended data or indicate routing issues

#### Additional Notes
This needs further investigation to determine:
- What resource is actually returned?
- Is this a routing issue?
- Could this be exploited to access unintended resources?

---

### Bug #5: Inconsistent Error Response Formats Across Endpoints

**Type:** Consistency  
**Severity:** Medium  
**Endpoint:** Multiple POST endpoints  
**Date Found:** 2025-11-16  
**Status:** Open

#### Description
Different FHIR resource endpoints return error responses in different formats, even though they all use the OperationOutcome structure. The error details, codes, and structure vary between endpoints, making it harder for developers to handle errors consistently.

#### Expected Behavior
All FHIR endpoints should return errors in a consistent OperationOutcome format with the same structure for error codes, severity levels, and detail messages.

#### Actual Behavior
Different endpoints return errors with varying structures:
- Patient endpoint: Uses `code: "invalid"` with different message format
- Appointment endpoint: Uses `code: "invariant"` and `code: "structure"` with multiple issues
- Encounter endpoint: Uses `code: "structure"` with different message format

#### Steps to Reproduce
1. POST to `/fhir/Patient` with empty body: `{}`
2. POST to `/fhir/Appointment` with empty body: `{ "resourceType": "Appointment" }`
3. POST to `/fhir/Encounter` with empty body: `{ "resourceType": "Encounter" }`
4. Compare the error response formats

#### Request Details
```json
# Patient
POST /fhir/Patient
Body: {}

# Appointment
POST /fhir/Appointment
Body: { "resourceType": "Appointment" }

# Encounter
POST /fhir/Encounter
Body: { "resourceType": "Encounter" }
```

#### Response Details

**Patient Error:**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "invalid",
    "details": {
      "text": "Incorrect resource type: expected Patient, but found <EMPTY>"
    }
  }]
}
```

**Appointment Error:**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invariant",
      "details": {
        "text": "Constraint app-3 not met: Only proposed or cancelled appointments can be missing start/end dates"
      },
      "expression": ["Appointment"],
      "diagnostics": "{...}"
    },
    {
      "severity": "error",
      "code": "structure",
      "details": {
        "text": "Missing required property"
      },
      "expression": ["Appointment.status"]
    },
    {
      "severity": "error",
      "code": "structure",
      "details": {
        "text": "Missing required property"
      },
      "expression": ["Appointment.participant"]
    }
  ]
}
```

**Encounter Error:**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "structure",
      "details": {
        "text": "Missing required property"
      },
      "expression": ["Encounter.status"]
    },
    {
      "severity": "error",
      "code": "structure",
      "details": {
        "text": "Missing required property"
      },
      "expression": ["Encounter.class"]
    }
  ]
}
```

#### Impact
- **User Impact:** Developer experience issue - requires different error handling logic for different endpoints
- **Workaround:** Developers must handle each endpoint's error format separately
- **Frequency:** Always
- **Best Practice:** Consistent error formats improve developer experience and reduce integration complexity

#### Additional Notes
While all responses use OperationOutcome (which is correct for FHIR), the structure and detail of error messages varies. Standardizing error formats would improve API usability.

---

### Bug #6: Patient Search Accepts _count=0

**Type:** Validation  
**Severity:** Low  
**Endpoint:** GET /fhir/Patient  
**Date Found:** 2025-11-16  
**Status:** Open

#### Description
The API accepts `_count=0` as a valid search parameter, which doesn't make practical sense (returning 0 results). This should either be rejected as invalid or have a minimum value enforced.

#### Expected Behavior
Should return `400 Bad Request` indicating that `_count` must be greater than 0, or enforce a minimum value (typically 1 or 10).

#### Actual Behavior
Returns `200 OK` and accepts `_count=0` as a valid parameter.

#### Steps to Reproduce
1. Make a GET request to `/fhir/Patient?_count=0`
2. Observe that the request succeeds with status 200

#### Request Details
```
GET /fhir/Patient?_count=0
Authorization: Bearer [token]
```

#### Response Details
- **Status Code:** 200 OK
- **Response Body:** (Returns empty or no results)

#### Impact
- **User Impact:** Minor - doesn't break functionality but is semantically incorrect
- **Workaround:** Frontend can validate _count parameter
- **Frequency:** Always
- **FHIR Note:** FHIR spec doesn't explicitly prohibit _count=0, but it's not practical

#### Additional Notes
While not a critical issue, validating that `_count >= 1` would improve API clarity and prevent confusion.

---

### Bug #7: Generic Error Message for Invalid Date Format (Text)

**Type:** Error Handling  
**Severity:** Medium  
**Endpoint:** POST /fhir/Patient  
**Date Found:** 2025-11-16  
**Status:** Open

#### Description
Similar to Bug #3, when creating a Patient with a completely invalid date format (non-date text like "not-a-date"), the API returns a generic "Invalid date format" message without specifying the expected format.

#### Expected Behavior
Should return `400 Bad Request` with a detailed error message specifying:
- The field with the error (birthDate)
- The expected format (YYYY-MM-DD)
- An example of a valid date

#### Actual Behavior
Returns `400 Bad Request` with generic message "Invalid date format" and field path in expression array.

#### Steps to Reproduce
1. Make a POST request to `/fhir/Patient`
2. Send body with text instead of date: `{ "resourceType": "Patient", "name": [{ "given": ["John"], "family": "Doe" }], "birthDate": "not-a-date" }`
3. Observe the error response

#### Request Details
```json
POST /fhir/Patient
Content-Type: application/fhir+json
Authorization: Bearer [token]

{
  "resourceType": "Patient",
  "name": [{
    "given": ["John"],
    "family": "Doe"
  }],
  "birthDate": "not-a-date"
}
```

#### Response Details
- **Status Code:** 400 Bad Request
- **Response Body:**
```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "structure",
    "details": {
      "text": "Invalid date format"
    },
    "expression": ["Patient.birthDate"]
  }]
}
```

#### Impact
- **User Impact:** Developer experience issue - makes debugging harder
- **Workaround:** Developers need to check FHIR documentation
- **Frequency:** Always
- **Improvement Suggestion:** Include expected format in error message

#### Additional Notes
This is the same issue as Bug #3 but with a different invalid input type. Both should be addressed together with improved error messaging.

---

## Recommendations

### High Priority Fixes
1. **Bug #1** - Enforce required fields validation for Patient creation
2. **Bug #2** - Validate enum values (gender) against FHIR value sets
3. **Bug #4** - Fix empty ID handling in GET requests

### Medium Priority Improvements
4. **Bug #3 & #7** - Improve error messages with expected formats
5. **Bug #5** - Standardize error response formats across endpoints

### Low Priority
6. **Bug #6** - Validate _count parameter minimum value

### General Recommendations
- Implement comprehensive input validation for all FHIR resources
- Standardize error response formats across all endpoints
- Improve error messages to include expected formats and examples
- Add field-level validation errors in OperationOutcome responses
- Review and enforce FHIR R4 compliance for all resource types

---

## Testing Methodology

These bugs were found using automated testing that covers:
- Missing required fields
- Invalid data types and formats
- Invalid enum values
- Edge cases in search parameters
- Error response consistency
- Security edge cases

For detailed testing methodology, see `API_BUG_REPORTING_GUIDE.md`.

---

**Report Generated:** 2025-11-16  
**Test Script:** `tests/api-bug-testing.js`  
**Detailed JSON Reports:** `tests/bug-reports.json`
