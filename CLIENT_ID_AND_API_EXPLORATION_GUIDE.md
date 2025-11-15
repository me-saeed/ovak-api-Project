# Client ID and API Exploration Guide

## Understanding Client ID

### What is Client ID?

The **Client ID** is a public identifier for your application that's used **only during authentication** (login/register). According to the [Ovok documentation](https://docs.ovok.com/docs/development-1):

- It's a `ClientApplication` resource in Ovok
- It stores a secret used to generate tokens during login/register
- It identifies your app when authenticating users
- **It's NOT needed for subsequent API calls** after you have a token

### How Client ID Works in the Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. REGISTER/LOGIN (Client ID Required)
   ┌─────────────────────────────────────┐
   │ POST /auth/register or /auth/login  │
   │ {                                    │
   │   "email": "...",                    │
   │   "password": "...",                 │
   │   "clientId": "your-client-id"  ←───┼─── Client ID needed here
   │ }                                    │
   └─────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────┐
   │ Response:                            │
   │ {                                    │
   │   "access_token": "eyJhbGc...",      │
   │   "refresh_token": "...",            │
   │   "token_type": "Bearer"             │
   │ }                                    │
   └─────────────────────────────────────┘
                    │
                    ▼
2. ALL SUBSEQUENT API CALLS (No Client ID Needed)
   ┌─────────────────────────────────────┐
   │ GET /auth/me                         │
   │ GET /fhir/Patient                    │
   │ POST /fhir/Observation               │
   │ etc...                               │
   │                                      │
   │ Header:                              │
   │ Authorization: Bearer {access_token} │ ←─── Only token needed
   └─────────────────────────────────────┘
```

### Key Points:

1. **Client ID is ONLY for authentication** - Use it when calling `/auth/register` or `/auth/login`
2. **After login, you get a token** - This token contains all the information about your identity
3. **Token is used for all other APIs** - No need to send Client ID again
4. **Token contains your permissions** - The JWT token includes your role, project, and access policies

---

## Your Current Situation

You've successfully:
- ✅ Authenticated and received a token
- ✅ Called `/auth/me` and got your user details
- ✅ Have access to your project, profile, and access policies

**What you have:**
- **User ID**: `019a785d-b443-7316-b974-9390c165e502`
- **Project ID**: `019a785d-ac1a-76a8-bb78-48f65b227809`
- **Practitioner Profile**: `Practitioner/019a785d-b35f-76e0-94bc-ce23532634ce`
- **Access Token**: (stored in localStorage)

**What you can do now:**
- Use this token to explore ALL other APIs
- No need to use Client ID anymore (unless you need to login again)

---

## How to Explore Other APIs

### Step 1: Understanding Your Access Token

Your token is a JWT (JSON Web Token) that contains:
- Your user ID
- Your username
- Your profile (Practitioner)
- Your project
- Your permissions (scope)
- Expiration time

**Decode your token** at [jwt.io](https://jwt.io) to see all this information.

### Step 2: Using the Token for API Calls

Your `api-client.ts` already automatically adds the token to all requests:

```typescript
// This happens automatically for all API calls
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

So when you call any API, the token is automatically included!

### Step 3: Exploring FHIR APIs

Based on your `/auth/me` response, you have access to these resources. Here are examples:

#### 1. Search for Patients

```typescript
// GET /fhir/Patient
const response = await apiClient.get('/fhir/Patient', {
  params: {
    _count: 10,
    _sort: '-_lastUpdated'
  }
});
```

#### 2. Create a Patient

```typescript
// POST /fhir/Patient
const newPatient = {
  resourceType: "Patient",
  name: [{
    given: ["John"],
    family: "Doe"
  }],
  gender: "male",
  birthDate: "1990-01-01"
};

const response = await apiClient.post('/fhir/Patient', newPatient);
```

#### 3. Search for Observations

```typescript
// GET /fhir/Observation
const response = await apiClient.get('/fhir/Observation', {
  params: {
    _count: 20,
    status: "final"
  }
});
```

#### 4. Create an Observation

```typescript
// POST /fhir/Observation
const observation = {
  resourceType: "Observation",
  status: "final",
  code: {
    coding: [{
      system: "http://loinc.org",
      code: "85354-9",
      display: "Blood pressure panel"
    }]
  },
  subject: {
    reference: "Patient/019a785d-b443-7316-b974-9390c165e502"
  },
  valueQuantity: {
    value: 120,
    unit: "mmHg"
  }
};

const response = await apiClient.post('/fhir/Observation', observation);
```

#### 5. Get Your Practitioner Profile

```typescript
// GET /fhir/Practitioner/{id}
const practitionerId = "019a785d-b35f-76e0-94bc-ce23532634ce";
const response = await apiClient.get(`/fhir/Practitioner/${practitionerId}`);
```

#### 6. Search for Service Requests

```typescript
// GET /fhir/ServiceRequest
const response = await apiClient.get('/fhir/ServiceRequest', {
  params: {
    _count: 10,
    status: "active"
  }
});
```

---

## Implementing Features - Practical Examples

### Example 1: Patient Management Feature

Create a component to list and create patients:

```typescript
'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'

export default function PatientManagement() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/fhir/Patient', {
        params: { _count: 20 }
      })
      setPatients(response.data.entry?.map((entry: any) => entry.resource) || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Create a new patient
  const createPatient = async (patientData: any) => {
    try {
      const response = await apiClient.post('/fhir/Patient', {
        resourceType: "Patient",
        name: [{
          given: [patientData.firstName],
          family: patientData.lastName
        }],
        gender: patientData.gender,
        birthDate: patientData.birthDate
      })
      await fetchPatients() // Refresh list
      return response.data
    } catch (error) {
      console.error('Error creating patient:', error)
      throw error
    }
  }

  return (
    <div>
      <h2>Patient Management</h2>
      {/* Your UI here */}
    </div>
  )
}
```

### Example 2: Observation Dashboard

Create a dashboard to view patient observations:

```typescript
'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'

export default function ObservationDashboard() {
  const [observations, setObservations] = useState([])
  const [patientId, setPatientId] = useState('')

  const fetchObservations = async () => {
    try {
      const params: any = { _count: 50 }
      if (patientId) {
        params.subject = `Patient/${patientId}`
      }
      
      const response = await apiClient.get('/fhir/Observation', { params })
      setObservations(response.data.entry?.map((entry: any) => entry.resource) || [])
    } catch (error) {
      console.error('Error fetching observations:', error)
    }
  }

  return (
    <div>
      <input 
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        placeholder="Filter by Patient ID"
      />
      <button onClick={fetchObservations}>Load Observations</button>
      {/* Display observations */}
    </div>
  )
}
```

### Example 3: Questionnaire Response Handler

Create a feature to submit questionnaire responses:

```typescript
'use client'

import apiClient from '@/lib/api-client'

export async function submitQuestionnaireResponse(
  questionnaireId: string,
  patientId: string,
  answers: any[]
) {
  const response = await apiClient.post('/fhir/QuestionnaireResponse', {
    resourceType: "QuestionnaireResponse",
    status: "completed",
    questionnaire: `Questionnaire/${questionnaireId}`,
    subject: {
      reference: `Patient/${patientId}`
    },
    item: answers.map(answer => ({
      linkId: answer.questionId,
      answer: [{
        valueString: answer.value
      }]
    }))
  })
  
  return response.data
}
```

---

## Available API Endpoints You Can Explore

Based on your `/auth/me` response, you have access to these resources:

### FHIR Resources (via `/fhir/{resourceType}`)

1. **Patient** - Patient demographics
2. **Practitioner** - Healthcare providers
3. **Organization** - Healthcare organizations
4. **ServiceRequest** - Orders for services
5. **DiagnosticReport** - Diagnostic test results
6. **Questionnaire** - Forms and surveys
7. **Observation** - Clinical measurements
8. **Encounter** - Patient visits
9. **Appointment** - Scheduled appointments
10. **CarePlan** - Care plans
11. **Condition** - Diagnoses
12. **Medication** - Medications
13. **DocumentReference** - Document references

### High-Level APIs (via `/api.ovok.com`)

1. **Documents** - `/documents/*` - File management
2. **CMS** - `/cms/content/*` - Content management
3. **Localization** - `/localization/*` - Translations
4. **AI Translation** - `/ai/translate` - Text translation

### Authentication APIs

1. **Account Info** - `GET /auth/account`
2. **Sessions** - `GET /auth/sessions`
3. **Refresh Token** - `POST /auth/refresh`

---

## Testing Your API Access

### Quick Test Script

Create a test component to verify your access:

```typescript
'use client'

import { useState } from 'react'
import apiClient from '@/lib/api-client'

export default function APITester() {
  const [endpoint, setEndpoint] = useState('/fhir/Patient')
  const [method, setMethod] = useState('GET')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      let response
      switch (method) {
        case 'GET':
          response = await apiClient.get(endpoint)
          break
        case 'POST':
          response = await apiClient.post(endpoint, {})
          break
        default:
          response = await apiClient.get(endpoint)
      }
      setResult(response.data)
    } catch (error: any) {
      setResult({
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>GET</option>
          <option>POST</option>
        </select>
        <input 
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="flex-1 px-2 border"
          placeholder="/fhir/Patient"
        />
        <button onClick={testAPI} disabled={loading}>
          {loading ? 'Testing...' : 'Test API'}
        </button>
      </div>
      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
```

---

## Understanding Access Policies

From your `/auth/me` response, you can see your access policy. It shows:

- **What resources you can access**: `"resourceType": "*"` means you can access all resources
- **Read-only resources**: Some resources like `SearchParameter` are read-only
- **Hidden fields**: Some fields are hidden (like `passwordHash`, `mfaSecret`)
- **Read-only fields**: Some fields can't be modified (like `email`, `emailVerified`)

This means:
- ✅ You can create, read, update most resources
- ✅ You have full access to your project
- ⚠️ Some system resources are read-only
- ⚠️ Some sensitive fields are hidden

---

## Common Patterns

### Pattern 1: Search with Filters

```typescript
const searchPatients = async (filters: {
  name?: string
  gender?: string
  birthDate?: string
}) => {
  const params: any = { _count: 20 }
  
  if (filters.name) {
    params.name = filters.name
  }
  if (filters.gender) {
    params.gender = filters.gender
  }
  if (filters.birthDate) {
    params.birthdate = filters.birthDate
  }
  
  const response = await apiClient.get('/fhir/Patient', { params })
  return response.data.entry?.map((entry: any) => entry.resource) || []
}
```

### Pattern 2: Create with References

```typescript
const createObservation = async (
  patientId: string,
  practitionerId: string,
  value: number
) => {
  const observation = {
    resourceType: "Observation",
    status: "final",
    subject: {
      reference: `Patient/${patientId}` // Reference to patient
    },
    performer: [{
      reference: `Practitioner/${practitionerId}` // Reference to practitioner
    }],
    valueQuantity: {
      value: value,
      unit: "mmHg"
    }
  }
  
  return await apiClient.post('/fhir/Observation', observation)
}
```

### Pattern 3: Update Resource

```typescript
const updatePatient = async (patientId: string, updates: any) => {
  // First, get the current resource
  const current = await apiClient.get(`/fhir/Patient/${patientId}`)
  
  // Merge updates
  const updated = {
    ...current.data,
    ...updates,
    id: patientId // Ensure ID is preserved
  }
  
  // Update using PUT
  return await apiClient.put(`/fhir/Patient/${patientId}`, updated)
}
```

---

## Next Steps

1. **Explore FHIR Resources**: Start with Patient, Practitioner, Observation
2. **Build Features**: Create components for common healthcare workflows
3. **Test Access Policies**: Verify what you can and cannot access
4. **Handle Errors**: Implement proper error handling for API calls
5. **Refresh Tokens**: Implement token refresh when tokens expire

---

## Summary

- **Client ID**: Only needed for `/auth/login` and `/auth/register`
- **Access Token**: Used for ALL other API calls (automatically added by your api-client)
- **Your Token**: Already working! Use it to explore all APIs
- **FHIR APIs**: Start with `/fhir/Patient`, `/fhir/Observation`, etc.
- **Access Policies**: You have broad access to most resources in your project

**You're all set!** Your token is valid and ready to use. Start exploring the APIs and building features! 🚀

