# API Bug Reporting & Improvement Guide

## Overview

This guide provides a systematic approach to testing, documenting, and reporting bugs and improvements for the **Ovok API** (the external APIs used by this project). Your role is to identify issues, inconsistencies, and areas for improvement in the API itself, not in this project's code.

**Base URL:** `https://api.ovok.com`  
**API Documentation:** [https://docs.ovok.com](https://docs.ovok.com)

---

## Table of Contents

1. [Testing Methodology](#testing-methodology)
2. [What to Test](#what-to-test)
3. [Bug Categories](#bug-categories)
4. [Improvement Categories](#improvement-categories)
5. [Documentation Template](#documentation-template)
6. [Testing Checklist](#testing-checklist)
7. [Systematic Testing Approach](#systematic-testing-approach)
8. [Reporting Process](#reporting-process)

---

## Testing Methodology

### 1. **Systematic Endpoint Testing**

For each API endpoint, test:
- ✅ **Happy Path** - Normal, expected usage
- ✅ **Edge Cases** - Boundary conditions, empty values, null values
- ✅ **Error Cases** - Invalid inputs, missing required fields
- ✅ **Authentication** - Valid/invalid tokens, expired tokens
- ✅ **Authorization** - Permissions, access control
- ✅ **Performance** - Response times, timeouts
- ✅ **Consistency** - Response format, error format

### 2. **Cross-Endpoint Testing**

Test how endpoints interact:
- Create → Read → Update → Delete workflows
- Resource references (Patient → Appointment → Encounter)
- Search consistency across endpoints
- Pagination behavior

### 3. **FHIR Compliance Testing**

Since Ovok uses FHIR R4:
- Verify FHIR resource structure compliance
- Check required vs optional fields
- Validate FHIR search parameters
- Test FHIR Bundle operations

---

## What to Test

### Authentication & Authorization APIs

#### `/auth/login`
- [ ] Valid credentials return access token
- [ ] Invalid credentials return proper error
- [ ] Missing fields return validation error
- [ ] Response includes refresh token
- [ ] Token expiration time is reasonable
- [ ] Error messages are clear and helpful

#### `/auth/refresh`
- [ ] Valid refresh token works
- [ ] Expired refresh token returns proper error
- [ ] Invalid refresh token returns proper error
- [ ] New access token is different from old one
- [ ] Refresh token rotation (if implemented)

#### `/auth/register`
- [ ] Valid registration creates account
- [ ] Duplicate email/username handled properly
- [ ] Password requirements enforced
- [ ] Email validation works
- [ ] Response includes access token

#### `/auth/account`
- [ ] Returns correct account information
- [ ] Handles missing/invalid token properly
- [ ] Response format is consistent

#### `/auth/sessions`
- [ ] Lists all active sessions
- [ ] DELETE removes sessions correctly
- [ ] Multiple sessions handled properly

#### Tenant Authentication (`/tenant/practitioner/*`, `/tenant/patient/*`)
- [ ] Practitioner login works
- [ ] Patient login works
- [ ] MFA flow works correctly
- [ ] Exchange token works
- [ ] Token scopes are correct

---

### FHIR Resource APIs

For each FHIR resource type (Patient, Appointment, Encounter, etc.), test:

#### **Create (POST `/fhir/{resourceType}`)**
- [ ] Valid resource creates successfully
- [ ] Returns 201 Created status
- [ ] Response includes generated ID
- [ ] Response includes version/meta information
- [ ] Missing required fields return 400 error
- [ ] Invalid field values return validation error
- [ ] Error messages specify which fields are invalid
- [ ] Duplicate resources handled (if applicable)
- [ ] Resource references validated (e.g., Patient reference exists)

#### **Read (GET `/fhir/{resourceType}/{id}`)**
- [ ] Valid ID returns resource
- [ ] Returns 200 OK status
- [ ] Response format matches FHIR spec
- [ ] Non-existent ID returns 404
- [ ] Invalid ID format returns proper error
- [ ] Includes all expected fields
- [ ] Resource references are valid

#### **Update (PUT `/fhir/{resourceType}/{id}`)**
- [ ] Valid update modifies resource
- [ ] Returns 200 OK or 201 Created
- [ ] Version number increments (if versioning supported)
- [ ] Non-existent ID returns 404
- [ ] Missing required fields return error
- [ ] Partial updates work (or return error if not supported)
- [ ] Concurrent updates handled (version conflicts)

#### **Delete (DELETE `/fhir/{resourceType}/{id}`)**
- [ ] Valid ID deletes resource
- [ ] Returns 204 No Content or 200 OK
- [ ] Deleted resource no longer accessible via GET
- [ ] Non-existent ID returns 404
- [ ] Resources with references handled (cascade vs error)
- [ ] Soft delete vs hard delete (if applicable)

#### **Search (GET `/fhir/{resourceType}?{params}`)**
- [ ] No params returns all resources (with pagination)
- [ ] Search parameters work correctly
- [ ] Multiple search params combine correctly (AND logic)
- [ ] Date range searches work
- [ ] Reference searches work (e.g., `patient=Patient/123`)
- [ ] Pagination works (`_count`, `_offset`, `_page`)
- [ ] Sorting works (`_sort`)
- [ ] Empty results return empty bundle (not error)
- [ ] Invalid search params return 400 error
- [ ] Response includes total count (if available)
- [ ] Response includes pagination links (next, previous)

---

### High-Level APIs

#### **Document APIs (`/documents/*`)**
- [ ] Upload generates credentials correctly
- [ ] File size limits enforced
- [ ] File type validation works
- [ ] Search returns correct documents
- [ ] Public access works without auth
- [ ] Authenticated access requires valid token
- [ ] Delete removes document
- [ ] Metadata updates work
- [ ] Credential generation for replacement works

#### **CMS APIs (`/cms/content/*`)**
- [ ] Create content works
- [ ] Search returns correct results
- [ ] Update modifies content
- [ ] Delete removes content
- [ ] Copy operations work
- [ ] Language-specific content retrieval works
- [ ] Mapped content search works

#### **Localization APIs (`/localization/*`)**
- [ ] Get i18next JSON works
- [ ] Update i18next JSON works
- [ ] Language codes validated
- [ ] Mapped localizations returned correctly

#### **AI Translation (`/ai/translate`)**
- [ ] Translation works for supported languages
- [ ] Unsupported languages return proper error
- [ ] Response time is reasonable
- [ ] Translation quality (if testable)

---

## Bug Categories

### 1. **Functional Bugs**

**Definition:** API doesn't work as documented or expected

**Examples:**
- Endpoint returns wrong status code
- Endpoint returns incorrect data
- Endpoint doesn't validate input properly
- Endpoint crashes/returns 500 error unexpectedly
- Search doesn't filter correctly
- Create doesn't save data properly

**Documentation Format:**
```
**Bug Type:** Functional
**Endpoint:** POST /fhir/Patient
**Issue:** Creating a patient with invalid birthDate format (e.g., "2024-13-45") returns 200 OK instead of 400 Bad Request
**Expected:** Should return 400 with validation error message
**Actual:** Returns 200 OK and creates patient with invalid date
**Steps to Reproduce:**
1. POST /fhir/Patient with birthDate: "2024-13-45"
2. Observe response
**Impact:** High - Data integrity issue
```

---

### 2. **Validation Bugs**

**Definition:** API doesn't properly validate input data

**Examples:**
- Missing required fields accepted
- Invalid data types accepted
- Invalid formats accepted (dates, emails, etc.)
- Out-of-range values accepted
- SQL injection or XSS vulnerabilities (if applicable)

**Documentation Format:**
```
**Bug Type:** Validation
**Endpoint:** POST /fhir/Appointment
**Issue:** Creating appointment without required 'participant' field returns 200 OK
**Expected:** Should return 400 Bad Request with message about missing participant
**Actual:** Returns 200 OK and creates appointment without participants
**Steps to Reproduce:**
1. POST /fhir/Appointment with only status field
2. Observe response
**Impact:** Medium - Data quality issue
```

---

### 3. **Authentication/Authorization Bugs**

**Definition:** Security or access control issues

**Examples:**
- Invalid token accepted
- Expired token accepted
- Missing token accepted
- User can access resources they shouldn't
- Token doesn't expire when it should
- Refresh token doesn't work

**Documentation Format:**
```
**Bug Type:** Security
**Endpoint:** GET /fhir/Patient/{id}
**Issue:** Accessing patient resource with expired token returns 200 OK instead of 401
**Expected:** Should return 401 Unauthorized
**Actual:** Returns 200 OK with patient data
**Steps to Reproduce:**
1. Get access token
2. Wait for expiration
3. GET /fhir/Patient/123 with expired token
**Impact:** Critical - Security vulnerability
```

---

### 4. **Performance Issues**

**Definition:** API is too slow or times out

**Examples:**
- Endpoint takes > 5 seconds for simple operations
- Search with large datasets times out
- No pagination causes slow responses
- No caching where it would help

**Documentation Format:**
```
**Bug Type:** Performance
**Endpoint:** GET /fhir/Patient
**Issue:** Searching patients without _count parameter takes 15+ seconds
**Expected:** Should return results in < 2 seconds or enforce default _count
**Actual:** Returns all patients (1000+) in 15+ seconds
**Steps to Reproduce:**
1. GET /fhir/Patient (no _count param)
2. Measure response time
**Impact:** Medium - User experience issue
```

---

### 5. **Consistency Issues**

**Definition:** API behavior is inconsistent across endpoints

**Examples:**
- Different error message formats
- Different response structures for similar operations
- Inconsistent field naming
- Inconsistent pagination behavior
- Inconsistent date/time formats

**Documentation Format:**
```
**Bug Type:** Consistency
**Endpoints:** POST /fhir/Patient vs POST /fhir/Appointment
**Issue:** Error messages have different formats
**Expected:** Consistent error message format across all endpoints
**Actual:** 
- Patient errors: { "error": "message" }
- Appointment errors: { "message": "error", "code": 400 }
**Steps to Reproduce:**
1. POST invalid Patient data
2. POST invalid Appointment data
3. Compare error response formats
**Impact:** Low - Developer experience issue
```

---

### 6. **Documentation Issues**

**Definition:** API documentation doesn't match actual behavior

**Examples:**
- Documented endpoint doesn't exist
- Documented parameters don't work
- Response format differs from documentation
- Missing documentation for features
- Incorrect examples in documentation

**Documentation Format:**
```
**Bug Type:** Documentation
**Endpoint:** GET /fhir/Patient
**Issue:** Documentation says _sort parameter supports "name" but it doesn't work
**Expected:** _sort=name should sort by patient name
**Actual:** Returns 400 Bad Request: "Invalid sort parameter"
**Steps to Reproduce:**
1. Read documentation for _sort parameter
2. GET /fhir/Patient?_sort=name
3. Observe error
**Impact:** Low - Developer experience issue
```

---

### 7. **FHIR Compliance Issues**

**Definition:** API doesn't follow FHIR R4 specification

**Examples:**
- Missing required FHIR fields
- Incorrect FHIR resource structure
- Invalid FHIR search parameters
- Doesn't support standard FHIR operations
- Bundle operations don't work correctly

**Documentation Format:**
```
**Bug Type:** FHIR Compliance
**Endpoint:** GET /fhir/Patient/{id}
**Issue:** Response missing "meta" field which is recommended in FHIR R4
**Expected:** Response should include meta field with versionId and lastUpdated
**Actual:** Response doesn't include meta field
**Steps to Reproduce:**
1. GET /fhir/Patient/123
2. Check response for meta field
**Impact:** Low - Standards compliance issue
```

---

## Improvement Categories

### 1. **Feature Enhancements**

**Definition:** Missing features that would be useful

**Examples:**
- Bulk operations endpoint
- Export functionality
- Advanced search filters
- Webhooks for resource changes
- GraphQL endpoint
- Rate limiting information in headers

**Documentation Format:**
```
**Improvement Type:** Feature Enhancement
**Area:** Search Functionality
**Suggestion:** Add support for full-text search across patient names
**Current:** Can only search by exact name match
**Proposed:** GET /fhir/Patient?name:contains=john should return all patients with "john" in name
**Benefit:** Better search experience for users
**Priority:** Medium
```

---

### 2. **Developer Experience Improvements**

**Definition:** Things that would make API easier to use

**Examples:**
- Better error messages with field-level details
- Request/response examples in documentation
- SDKs for popular languages
- Postman collection
- OpenAPI/Swagger specification
- Webhook testing tools

**Documentation Format:**
```
**Improvement Type:** Developer Experience
**Area:** Error Messages
**Suggestion:** Include field-level validation errors in response
**Current:** Returns generic "Validation failed" message
**Proposed:** Return { "errors": [{ "field": "birthDate", "message": "Invalid date format" }] }
**Benefit:** Developers can fix issues faster
**Priority:** High
```

---

### 3. **Performance Optimizations**

**Definition:** Ways to make API faster

**Examples:**
- Add caching headers
- Support compression (gzip)
- Add database indexes for common searches
- Implement connection pooling
- Add CDN for static resources

**Documentation Format:**
```
**Improvement Type:** Performance
**Area:** Response Compression
**Suggestion:** Support gzip compression for large responses
**Current:** All responses sent uncompressed
**Proposed:** Accept-Encoding: gzip header should compress responses > 1KB
**Benefit:** Faster response times, less bandwidth
**Priority:** Medium
```

---

### 4. **Reliability Improvements**

**Definition:** Ways to make API more reliable

**Examples:**
- Retry logic documentation
- Rate limiting information
- Status page/health check endpoint
- Better timeout handling
- Idempotency keys for POST requests

**Documentation Format:**
```
**Improvement Type:** Reliability
**Area:** Idempotency
**Suggestion:** Support idempotency keys for POST requests
**Current:** Duplicate POST requests create duplicate resources
**Proposed:** POST with Idempotency-Key header returns same resource if key matches
**Benefit:** Prevents duplicate resource creation
**Priority:** High
```

---

## Documentation Template

### Bug Report Template

```markdown
## Bug Report: [Brief Description]

**Date:** YYYY-MM-DD
**Reporter:** [Your Name]
**Severity:** Critical / High / Medium / Low

### Basic Information
- **Endpoint:** [Method] [Path]
- **API Version:** v1.0
- **Environment:** Production / Sandbox

### Description
[Clear description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Request Details
**Method:** [GET/POST/PUT/DELETE]
**URL:** [Full URL]
**Headers:**
```
Authorization: Bearer [token]
Content-Type: application/fhir+json
```

**Request Body:**
```json
{
  "example": "data"
}
```

### Response Details
**Status Code:** [e.g., 200, 400, 500]
**Response Body:**
```json
{
  "error": "example"
}
```

**Response Headers:**
```
Content-Type: application/json
```

### Impact
- **User Impact:** [How does this affect users?]
- **Workaround:** [Is there a workaround?]
- **Frequency:** [Always / Sometimes / Rarely]

### Additional Context
- Screenshots (if applicable)
- Related issues
- Environment details
```

---

### Improvement Suggestion Template

```markdown
## Improvement Suggestion: [Brief Description]

**Date:** YYYY-MM-DD
**Reporter:** [Your Name]
**Priority:** High / Medium / Low

### Area
[Authentication / FHIR Resources / Search / Documentation / etc.]

### Current Behavior
[How it works now]

### Proposed Improvement
[What should be changed/added]

### Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

### Use Case
[Real-world scenario where this would help]

### Implementation Considerations
[Any technical considerations or concerns]

### Related APIs/Endpoints
[List related endpoints that might be affected]
```

---

## Testing Checklist

### Daily Testing Routine

Use this checklist to systematically test APIs:

#### Authentication APIs
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Refresh token
- [ ] Get account info
- [ ] List sessions
- [ ] Revoke sessions
- [ ] Practitioner login
- [ ] Patient login

#### Patient Resource
- [ ] Create patient (valid data)
- [ ] Create patient (missing required fields)
- [ ] Create patient (invalid data)
- [ ] Get patient by ID
- [ ] Get non-existent patient
- [ ] Update patient
- [ ] Delete patient
- [ ] Search patients (no filters)
- [ ] Search patients (with filters)
- [ ] Search patients (pagination)

#### Appointment Resource
- [ ] Create appointment
- [ ] Get appointment
- [ ] Update appointment
- [ ] Delete appointment
- [ ] Search appointments
- [ ] Search by patient
- [ ] Search by date

#### Encounter Resource
- [ ] Create encounter
- [ ] Get encounter
- [ ] Update encounter
- [ ] Search encounters

#### Condition Resource
- [ ] Create condition
- [ ] Get condition
- [ ] Update condition
- [ ] Search conditions

#### CarePlan Resource
- [ ] Create care plan
- [ ] Get care plan
- [ ] Update care plan
- [ ] Search care plans

#### ServiceRequest Resource
- [ ] Create service request
- [ ] Get service request
- [ ] Update service request
- [ ] Search service requests

#### Questionnaire Resource
- [ ] Create questionnaire
- [ ] Get questionnaire
- [ ] Update questionnaire
- [ ] Submit response
- [ ] Get responses

#### Observation Resource
- [ ] Create observation
- [ ] Get observation
- [ ] Search observations

#### Document APIs
- [ ] Upload document
- [ ] Get document
- [ ] Search documents
- [ ] Delete document

---

## Systematic Testing Approach

### Week 1: Authentication & Core Resources
**Focus:** Authentication APIs and Patient resource
- Test all authentication endpoints thoroughly
- Test Patient CRUD operations
- Test Patient search functionality
- Document all findings

### Week 2: Clinical Resources
**Focus:** Appointment, Encounter, Condition, CarePlan
- Test each resource type systematically
- Test resource relationships
- Test search and filtering
- Document findings

### Week 3: Workflow Resources
**Focus:** ServiceRequest, Questionnaire, Observation
- Test workflow-related resources
- Test end-to-end workflows
- Test resource references
- Document findings

### Week 4: Advanced Features & Edge Cases
**Focus:** Document APIs, Bundle operations, edge cases
- Test document management
- Test FHIR Bundle operations
- Test edge cases and error scenarios
- Test performance with larger datasets
- Document findings

### Ongoing: Continuous Testing
- Test new features as you use them
- Re-test fixed bugs
- Test after API updates
- Monitor for regressions

---

## Reporting Process

### 1. **Document Immediately**
When you find a bug or have an improvement idea:
- Document it using the templates above
- Include all relevant details
- Take screenshots if applicable
- Note the date and time

### 2. **Categorize**
- Determine if it's a bug or improvement
- Assign severity/priority
- Tag with relevant categories

### 3. **Verify Reproducibility**
- Try to reproduce the issue
- Test in different scenarios
- Check if it's environment-specific

### 4. **Create Report**
- Use the template
- Include all details
- Make it clear and actionable

### 5. **Track Your Reports**
Create a simple tracking system:
- List of bugs found
- List of improvements suggested
- Status (reported, fixed, in-progress)
- Dates

### 6. **Follow Up**
- Check if reported issues are fixed
- Verify fixes work correctly
- Update your tracking list

---

## Tools & Resources

### Testing Tools
- **Postman** - API testing and documentation
- **curl** - Command-line testing
- **Browser DevTools** - Network inspection
- **API Explorer** (if available in project)

### Documentation
- **Ovok API Docs:** [https://docs.ovok.com](https://docs.ovok.com)
- **FHIR R4 Spec:** [https://www.hl7.org/fhir/](https://www.hl7.org/fhir/)
- **This Project's API Client** - See `lib/api-client.ts` and `lib/services/*`

### Tracking
- Create a simple markdown file or spreadsheet to track:
  - Bug reports sent
  - Improvement suggestions sent
  - Status updates
  - Response from API team

---

## Tips for Effective Bug Reporting

1. **Be Specific:** Include exact URLs, request bodies, and response codes
2. **Be Reproducible:** Provide clear steps to reproduce
3. **Be Objective:** Focus on facts, not opinions
4. **Be Helpful:** Suggest fixes if you can
5. **Be Patient:** Some issues may be by design or have workarounds
6. **Be Persistent:** Follow up on critical issues
7. **Be Organized:** Keep track of what you've reported

---

## Example Bug Report

```markdown
## Bug Report: Patient Search Returns 500 Error with Special Characters

**Date:** 2024-01-15
**Reporter:** QA Tester
**Severity:** High

### Basic Information
- **Endpoint:** GET /fhir/Patient?name=O'Brien
- **API Version:** v1.0
- **Environment:** Production

### Description
Searching for patients with apostrophes in their name (e.g., "O'Brien") causes a 500 Internal Server Error instead of returning matching results or an empty result set.

### Steps to Reproduce
1. Create a patient with name "John O'Brien"
2. Search: GET /fhir/Patient?name=O'Brien
3. Observe 500 error

### Expected Behavior
Should return patient "John O'Brien" or empty result set if no match

### Actual Behavior
Returns 500 Internal Server Error

### Request Details
**Method:** GET
**URL:** https://api.ovok.com/fhir/Patient?name=O'Brien
**Headers:**
```
Authorization: Bearer [valid-token]
Accept: application/fhir+json
```

### Response Details
**Status Code:** 500
**Response Body:**
```json
{
  "error": "Internal Server Error"
}
```

### Impact
- **User Impact:** Users cannot search for patients with apostrophes in names
- **Workaround:** None known
- **Frequency:** Always

### Additional Context
- Also occurs with other special characters: hyphens, periods
- URL encoding doesn't help: `name=O%27Brien` still fails
```

---

## Example Improvement Suggestion

```markdown
## Improvement Suggestion: Add Field-Level Validation Errors

**Date:** 2024-01-15
**Reporter:** QA Tester
**Priority:** High

### Area
Error Handling / Validation

### Current Behavior
When creating a resource with invalid data, API returns:
```json
{
  "error": "Validation failed"
}
```
This doesn't tell developers which fields are invalid.

### Proposed Improvement
Return detailed field-level errors:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "birthDate",
      "message": "Invalid date format. Expected YYYY-MM-DD"
    },
    {
      "field": "gender",
      "message": "Invalid value. Must be one of: male, female, other, unknown"
    }
  ]
}
```

### Benefits
- Developers can fix issues faster
- Better user experience in frontend applications
- Reduces support requests
- Follows REST API best practices

### Use Case
Developer creates a Patient with invalid birthDate and gender. Instead of guessing what's wrong, they get specific field-level errors.

### Implementation Considerations
- Maintain backward compatibility if possible
- Consider adding "details" as optional field
- Document in API reference

### Related APIs/Endpoints
- All POST /fhir/{resourceType} endpoints
- All PUT /fhir/{resourceType}/{id} endpoints
```

---

## Quick Reference: Common Issues to Look For

### Authentication
- [ ] Tokens expire too quickly or not at all
- [ ] Refresh tokens don't work
- [ ] Invalid tokens are accepted
- [ ] Missing tokens return unclear errors

### CRUD Operations
- [ ] Create accepts invalid data
- [ ] Update doesn't validate data
- [ ] Delete doesn't check dependencies
- [ ] Read returns wrong data

### Search
- [ ] Search parameters don't work
- [ ] Pagination is broken
- [ ] Sorting doesn't work
- [ ] Special characters break search
- [ ] No results return error instead of empty array

### Error Handling
- [ ] Generic error messages
- [ ] Wrong HTTP status codes
- [ ] 500 errors for validation issues
- [ ] No error details provided

### Performance
- [ ] Slow responses (> 5 seconds)
- [ ] No pagination defaults
- [ ] Large responses not compressed
- [ ] Timeouts on valid requests

### Consistency
- [ ] Different error formats
- [ ] Inconsistent field names
- [ ] Different response structures
- [ ] Inconsistent date formats

---

## Getting Started

1. **Start with Authentication APIs** - These are foundational
2. **Test Patient Resource Thoroughly** - It's the most used resource
3. **Document Everything** - Even small issues matter
4. **Create a Tracking System** - Keep a list of all findings
5. **Test Real Workflows** - Use the app to find issues naturally
6. **Read API Documentation** - Compare actual behavior to docs
7. **Test Edge Cases** - Invalid inputs, empty values, null values
8. **Test Error Scenarios** - What happens when things go wrong?

---

## Remember

- **Your goal:** Find bugs and suggest improvements in the Ovok API
- **Not your goal:** Fix bugs in this project's code
- **Focus on:** API behavior, response formats, error handling, performance
- **Document:** Everything you find, even if it seems minor
- **Be thorough:** Test systematically, don't skip steps
- **Be professional:** Clear, detailed, actionable reports

Good luck with your testing! 🚀

