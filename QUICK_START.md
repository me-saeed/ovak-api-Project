# Quick Start Guide - Ovok API

## ✅ What We Discovered

After systematic testing, here's what **WORKS** and what you can build:

### Working Authentication ✅
```
POST /auth/tenant/Practitioner/login/start
POST /auth/tenant/Practitioner/login/token
```

### Working FHIR APIs ✅
- ✅ Patient (search, create, read)
- ✅ Practitioner (search)
- ✅ Observation (search)
- ✅ Encounter (search)
- ✅ Appointment (search)
- ✅ Questionnaire (search)
- ✅ QuestionnaireResponse (search)
- ✅ CarePlan (search)
- ✅ Condition (search)
- ✅ ServiceRequest (search)
- ✅ DiagnosticReport (search)

---

## 🚀 Build Your First Feature in 5 Minutes

### Step 1: Authenticate

```javascript
// Generate PKCE
const crypto = require('crypto');
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256')
  .update(codeVerifier).digest('base64url');

// Step 1: Start login
const startRes = await fetch('https://api.ovok.com/auth/tenant/Practitioner/login/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'saeedartists@gmail.com',
    password: '12345678',
    codeChallenge,
    codeChallengeMethod: 'S256'
  })
});
const startData = await startRes.json();

// Step 2: Get token
const tokenRes = await fetch('https://api.ovok.com/auth/tenant/Practitioner/login/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionCode: startData.sessionCode,
    codeVerifier,
    tenantCode: startData.profiles[0].tenantCode
  })
});
const { accessToken } = await tokenRes.json();
```

### Step 2: Use the Token

```javascript
// Search patients
const patients = await fetch('https://api.ovok.com/fhir/Patient?_count=10', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/fhir+json'
  }
});
const data = await patients.json();
console.log(data.entry); // Array of patients
```

### Step 3: Create a Patient

```javascript
const newPatient = await fetch('https://api.ovok.com/fhir/Patient', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json'
  },
  body: JSON.stringify({
    resourceType: 'Patient',
    name: [{ given: ['John'], family: 'Doe' }],
    gender: 'male',
    birthDate: '1990-01-01'
  })
});
const patient = await newPatient.json();
console.log(patient.id); // Patient ID
```

---

## 📁 Project Structure

```
ovok-app/
├── lib/
│   ├── auth.js          # PKCE authentication
│   └── api-client.js     # Axios client with token
├── services/
│   ├── patient-service.js
│   ├── observation-service.js
│   └── questionnaire-service.js
├── components/
│   ├── PatientList.jsx
│   ├── PatientForm.jsx
│   └── ObservationForm.jsx
└── pages/
    ├── login.js
    ├── patients.js
    └── dashboard.js
```

---

## 🎯 Your Working Credentials

- **Email:** saeedartists@gmail.com
- **Password:** 12345678
- **Tenant Code:** encodersoft
- **Project ID:** 019a785d-ac1a-76a8-bb78-48f65b227809

---

## 📊 Test Results

Run the test suite anytime:
```bash
node tests/api-test-suite.js
```

**Current Status:**
- ✅ 15 APIs working
- ❌ 8 APIs need configuration
- 🎯 Ready to build!

---

## 📖 Full Documentation

See `COMPREHENSIVE_ROADMAP.md` for:
- Complete API reference
- Phase-by-phase development plan
- Code examples
- Best practices

---

**You're ready to build! 🚀**

