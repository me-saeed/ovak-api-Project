# Ovok API Documentation

## Platform Overview

**Ovok** is a secure, scalable, standards-based platform designed to accelerate the development of modern digital health applications. These applications typically include:

- Telemedicine, streaming vital data, care plans and questionnaires
- Managing healthcare data with FHIR (Fast Healthcare Interoperability Resources) resources
- Scheduling, patient intake, practitioner and patient portals

**API Version:** v1.0

**Official Documentation:**
- Welcome: [https://docs.ovok.com/docs/welcome-to-ovok](https://docs.ovok.com/docs/welcome-to-ovok)
- API Reference: [https://docs.ovok.com/reference/introduction-high-level-api](https://docs.ovok.com/reference/introduction-high-level-api)

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Authorization](#authorization)
3. [High-level API Introduction](#high-level-api-introduction)
4. [Public APIs](#public-apis)
5. [FHIR API](#fhir-api)
6. [FHIR Resources](#fhir-resources)
7. [Projects](#projects)
8. [Bots](#bots)
9. [Access Policies](#access-policies)

---

## Development Setup

### Getting Started

Write your first digital application in 10 minutes. The Development Setup guide provides instructions for:

- Setting up your development environment
- Obtaining API credentials
- Acquiring an `access_token` for authorization
- Basic configuration

**Note:** Most API endpoints require an `access_token` for authorization. Refer to the Development Setup guide for detailed instructions on obtaining access tokens.

---

## Authorization

### Authentication Methods

Ovok supports multiple authentication methods:

1. **Standard Authentication**: Login/Register endpoints for general users
2. **Tenant Authentication**: Separate authentication flows for Practitioners and Patients
3. **Session Management**: Manage multiple active sessions
4. **Token Refresh**: Refresh expired access tokens

### Authorization Header Format

All authenticated requests should include the access token in the Authorization header:

```
Authorization: Bearer {access_token}
```

---

## High-level API Introduction

High-level APIs provide endpoints for user authentication, video calls, and a selection of most frequently used FHIR resources in a simplified format.

### How to use this API?

Most of the high-level API endpoints require an `access_token` for authorization. The acquisition of an `access_token` is described in the Development Setup guide.

---

## Public APIs

### Authentication

#### Refresh access token
- **Method:** `POST`
- **Endpoint:** `/auth/refresh`
- **Description:** Refresh an existing access token

#### Login
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Description:** Authenticate and obtain access token

#### Get account information
- **Method:** `GET`
- **Endpoint:** `/auth/account`
- **Description:** Retrieve current account information

#### Register an account
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Description:** Create a new user account

---

### Authentication - Session Management

#### Get all sessions
- **Method:** `GET`
- **Endpoint:** `/auth/sessions`
- **Description:** Retrieve all active sessions for the current user

#### Revoke sessions
- **Method:** `DELETE`
- **Endpoint:** `/auth/sessions`
- **Description:** Revoke one or more user sessions

---

### Tenant Authentication

#### Practitioner - Login
- **Method:** `POST`
- **Endpoint:** `/tenant/practitioner/login`
- **Description:** Authenticate as a practitioner

#### Practitioner - Exchange Token
- **Method:** `POST`
- **Endpoint:** `/tenant/practitioner/exchange-token`
- **Description:** Exchange a token for practitioner access

#### Practitioner - MFA
- **Method:** `POST`
- **Endpoint:** `/tenant/practitioner/mfa`
- **Description:** Complete multi-factor authentication for practitioner

#### Patient - Login
- **Method:** `POST`
- **Endpoint:** `/tenant/patient/login`
- **Description:** Authenticate as a patient

#### Patient - Exchange Token
- **Method:** `POST`
- **Endpoint:** `/tenant/patient/exchange-token`
- **Description:** Exchange a token for patient access

#### Patient - MFA
- **Method:** `POST`
- **Endpoint:** `/tenant/patient/mfa`
- **Description:** Complete multi-factor authentication for patient

#### Patient - Register
- **Method:** `POST`
- **Endpoint:** `/tenant/patient/register`
- **Description:** Register a new patient account

---

### Organization Code Information

#### Receive Organization Codes
- **Method:** `POST`
- **Endpoint:** `/organization-codes`
- **Description:** Receive and process organization codes

---

### AI Translation

#### Translate
- **Method:** `POST`
- **Endpoint:** `/ai/translate`
- **Description:** Translate text using AI translation service

---

### Document

#### Upload document - Generate credentials
- **Method:** `POST`
- **Endpoint:** `/documents/upload`
- **Description:** Upload a document and generate access credentials

#### Search documents
- **Method:** `GET`
- **Endpoint:** `/documents/search`
- **Description:** Search for documents

#### Get a document as public user
- **Method:** `GET`
- **Endpoint:** `/documents/{id}/public`
- **Description:** Retrieve a document without authentication

#### Get a document as authenticated user
- **Method:** `GET`
- **Endpoint:** `/documents/{id}`
- **Description:** Retrieve a document with authentication

#### Delete a document
- **Method:** `DELETE`
- **Endpoint:** `/documents/{id}`
- **Description:** Delete a document

#### Update document metadata
- **Method:** `PATCH`
- **Endpoint:** `/documents/{id}`
- **Description:** Update metadata for a document

#### Generate credentials for document file replacement
- **Method:** `POST`
- **Endpoint:** `/documents/{id}/credentials`
- **Description:** Generate new credentials for replacing a document file

---

### CMS (Content Management System)

#### Search mapped content
- **Method:** `GET`
- **Endpoint:** `/cms/content/mapped/search`
- **Description:** Search for mapped content

#### Copy contents
- **Method:** `POST`
- **Endpoint:** `/cms/content/copy`
- **Description:** Copy multiple content items

#### Copy a content
- **Method:** `POST`
- **Endpoint:** `/cms/content/{id}/copy`
- **Description:** Copy a single content item

#### Create content
- **Method:** `POST`
- **Endpoint:** `/cms/content`
- **Description:** Create new content

#### Search content
- **Method:** `GET`
- **Endpoint:** `/cms/content/search`
- **Description:** Search for content items

#### Update content
- **Method:** `PUT`
- **Endpoint:** `/cms/content/{id}`
- **Description:** Update existing content

#### Get content by key and language
- **Method:** `GET`
- **Endpoint:** `/cms/content/{key}/{language}`
- **Description:** Retrieve content by key and language

#### Delete content
- **Method:** `DELETE`
- **Endpoint:** `/cms/content/{id}`
- **Description:** Delete content

---

### Localization Keys

#### i18next - Get JSON
- **Method:** `GET`
- **Endpoint:** `/localization/i18next/{language}`
- **Description:** Get i18next JSON for a specific language

#### i18next - Update JSON
- **Method:** `PATCH`
- **Endpoint:** `/localization/i18next/{language}`
- **Description:** Update i18next JSON for a specific language

#### Mapped Localizations
- **Method:** `GET`
- **Endpoint:** `/localization/mapped`
- **Description:** Get mapped localizations

---

## FHIR API

The FHIR API provides standard FHIR (Fast Healthcare Interoperability Resources) endpoints for healthcare data management.

### Search

#### Search FHIR resources
- **Method:** `GET`
- **Endpoint:** `/fhir/{resourceType}`
- **Description:** Search for FHIR resources by type

---

### Create

#### Create a FHIR resource
- **Method:** `POST`
- **Endpoint:** `/fhir/{resourceType}`
- **Description:** Create a new FHIR resource

---

### Read

#### Read a FHIR resource
- **Method:** `GET`
- **Endpoint:** `/fhir/{resourceType}/{id}`
- **Description:** Retrieve a specific FHIR resource by ID

---

### Update

#### Update a FHIR resource
- **Method:** `PUT`
- **Endpoint:** `/fhir/{resourceType}/{id}`
- **Description:** Update an existing FHIR resource

---

### Delete

#### Delete a FHIR resource
- **Method:** `DELETE`
- **Endpoint:** `/fhir/{resourceType}/{id}`
- **Description:** Delete a FHIR resource

---

### Bundle

#### Bundle Operation
- **Method:** `POST`
- **Endpoint:** `/fhir/Bundle`
- **Description:** Execute a FHIR Bundle operation (batch/transaction)

---

## FHIR Resources

FHIR (Fast Healthcare Interoperability Resources) is a standard for exchanging healthcare information electronically. Ovok provides comprehensive support for FHIR resources.

### Common FHIR Resource Types

The following FHIR resource types are commonly used in Ovok:

- **Patient**: Demographics and administrative information about a person receiving care
- **Practitioner**: A person who is directly or indirectly involved in the provisioning of healthcare
- **Observation**: Measurements and simple assertions made about a patient
- **Encounter**: An interaction between a patient and healthcare provider(s)
- **Appointment**: A booking of a healthcare event
- **Questionnaire**: A structured set of questions
- **QuestionnaireResponse**: A structured set of answers to questions
- **CarePlan**: Describes the intention of how one or more practitioners intend to deliver care
- **Condition**: A clinical condition, problem, diagnosis, or other event
- **Medication**: Medication information
- **DocumentReference**: A reference to a document
- **Binary**: Binary content (images, PDFs, etc.)

### FHIR Resource References

FHIR resources can reference other resources using resource references. References follow the format:

```
{resourceType}/{id}
```

Example: `Patient/123` or `Practitioner/456`

### Binary Resources

Binary resources are used to store binary content such as:
- Images (DICOM, JPEG, PNG)
- Documents (PDF, DOCX)
- Other binary data

### FHIR Subscriptions

FHIR Subscriptions allow you to receive notifications when resources change. This enables real-time updates and event-driven architectures.

---

## Projects

Projects in Ovok are used to encapsulate and organize resources. Projects provide:

- **Resource Organization**: Group related resources together
- **Access Control**: Apply access policies at the project level
- **Isolation**: Separate resources between different applications or tenants

### Project Management

Projects help structure your application by:
- Organizing FHIR resources
- Managing access policies
- Separating development, staging, and production environments

---

## Bots

Bots in Ovok are automated processes that can perform actions based on events, schedules, or triggers.

### Bot Basics

Bots are serverless functions that can:
- Respond to events
- Execute on schedules (cron jobs)
- Process data automatically
- Send notifications

### Cron Jobs

Cron jobs allow you to schedule bot executions at specific times or intervals using cron syntax.

**Example Cron Patterns:**
- `0 0 * * *` - Daily at midnight
- `*/5 * * * *` - Every 5 minutes
- `0 9 * * 1-5` - Weekdays at 9 AM

### Custom Email Bot

Custom Email Bots allow you to:
- Send automated emails
- Customize email templates
- Trigger emails based on events
- Include dynamic content

### Events

Bots can respond to various events:
- Resource creation
- Resource updates
- Resource deletion
- Custom application events

### Questionnaire Responses Bot

Specialized bots for processing questionnaire responses:
- Validate responses
- Process answers
- Trigger follow-up actions
- Store results

### Secrets

Bots can securely access secrets for:
- API keys
- Database credentials
- External service authentication
- Sensitive configuration data

**Security Note:** Secrets are encrypted and only accessible within bot execution contexts.

---

## Access Policies

Access Policies control who can access which resources and what operations they can perform.

### Access Policy Management

Access policies can be managed through:
- Project-level policies
- Resource-type policies
- Resource-specific policies
- User/role-based policies

### Access Policy Examples

#### Compartments

Compartments provide a way to logically group resources. Access policies can be applied to compartments to control access to groups of resources.

**Example:** Patient compartment containing all resources related to a specific patient.

#### Criteria-Based Access Policy

Access policies can be based on criteria such as:
- Resource attributes
- User roles
- Time-based conditions
- Custom business rules

**Example:** Allow practitioners to access only their assigned patients.

#### Hidden Resource Fields

Access policies can hide specific fields from certain users while allowing access to the resource itself.

**Example:** Hide sensitive patient information from non-clinical staff.

#### Parameterized Access Policy

Access policies can accept parameters to make them reusable and flexible.

**Example:** A policy that grants access based on a dynamic organization ID.

#### Patient Access

Special access policies for patient-facing applications:
- Patients can access their own resources
- Patients can access resources shared with them
- Patients cannot access other patients' resources

### Testing Access Policies

Access policies should be tested to ensure:
- Correct access grants
- Proper access denials
- Edge cases are handled
- Performance is acceptable

---

## API Endpoint Summary

### Authentication Endpoints
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/refresh` - Refresh token
- `GET /auth/account` - Get account info
- `GET /auth/sessions` - Get all sessions
- `DELETE /auth/sessions` - Revoke sessions

### Tenant Authentication Endpoints
- `POST /tenant/practitioner/login` - Practitioner login
- `POST /tenant/practitioner/exchange-token` - Exchange practitioner token
- `POST /tenant/practitioner/mfa` - Practitioner MFA
- `POST /tenant/patient/login` - Patient login
- `POST /tenant/patient/exchange-token` - Exchange patient token
- `POST /tenant/patient/mfa` - Patient MFA
- `POST /tenant/patient/register` - Patient register

### Organization Endpoints
- `POST /organization-codes` - Receive organization codes

### AI Translation Endpoints
- `POST /ai/translate` - Translate text

### Document Endpoints
- `POST /documents/upload` - Upload document
- `GET /documents/search` - Search documents
- `GET /documents/{id}/public` - Get public document
- `GET /documents/{id}` - Get authenticated document
- `DELETE /documents/{id}` - Delete document
- `PATCH /documents/{id}` - Update document metadata
- `POST /documents/{id}/credentials` - Generate credentials

### CMS Endpoints
- `GET /cms/content/mapped/search` - Search mapped content
- `POST /cms/content/copy` - Copy contents
- `POST /cms/content/{id}/copy` - Copy content
- `POST /cms/content` - Create content
- `GET /cms/content/search` - Search content
- `PUT /cms/content/{id}` - Update content
- `GET /cms/content/{key}/{language}` - Get content by key/language
- `DELETE /cms/content/{id}` - Delete content

### Localization Endpoints
- `GET /localization/i18next/{language}` - Get i18next JSON
- `PATCH /localization/i18next/{language}` - Update i18next JSON
- `GET /localization/mapped` - Get mapped localizations

### FHIR Endpoints
- `GET /fhir/{resourceType}` - Search FHIR resources
- `POST /fhir/{resourceType}` - Create FHIR resource
- `GET /fhir/{resourceType}/{id}` - Read FHIR resource
- `PUT /fhir/{resourceType}/{id}` - Update FHIR resource
- `DELETE /fhir/{resourceType}/{id}` - Delete FHIR resource
- `POST /fhir/Bundle` - Bundle operation

---

## Notes

- All endpoints require proper authentication unless specified as public
- Access tokens should be included in the Authorization header: `Authorization: Bearer {access_token}`
- For detailed request/response schemas and examples, refer to the official Ovok API documentation at [https://docs.ovok.com](https://docs.ovok.com)
- Base URL: Typically `https://api.ovok.com` or your tenant-specific URL
- API responses follow standard HTTP status codes
- FHIR resources follow FHIR R4 specification

---

## Reference Links

- **Welcome Documentation**: [https://docs.ovok.com/docs/welcome-to-ovok](https://docs.ovok.com/docs/welcome-to-ovok)
- **API Reference**: [https://docs.ovok.com/reference/introduction-high-level-api](https://docs.ovok.com/reference/introduction-high-level-api)
- **API Version**: v1.0
- **FHIR Specification**: [https://www.hl7.org/fhir/](https://www.hl7.org/fhir/)

---

## Quick Reference

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

### Common Headers
- `Authorization: Bearer {token}` - Authentication token
- `Content-Type: application/json` - JSON content
- `Content-Type: application/fhir+json` - FHIR JSON content
- `Accept: application/json` - Accept JSON response
- `Accept: application/fhir+json` - Accept FHIR JSON response


