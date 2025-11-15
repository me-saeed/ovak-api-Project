# Ovok API Tester - Phase 1

A simple Next.js application for testing Ovok API Phase 1: Authentication endpoints.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (optional):
```env
NEXT_PUBLIC_API_BASE_URL=https://api.ovok.com
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Phase 1 Structure

Phase 1 is divided into 5 smaller parts:

- **Part 1.1**: Register & Login (Standard Auth)
- **Part 1.2**: Refresh Token & Account Info
- **Part 1.3**: Session Management
- **Part 1.4**: Practitioner Authentication
- **Part 1.5**: Patient Authentication

## Testing

Each part has its own tab with forms to test the endpoints. Results are displayed with:
- ✅ Green background for successful responses
- ❌ Red background for errors
- Full JSON response displayed

## Bug Reporting

Write bugs manually in your notes/documentation. The app displays responses to help you identify issues.

## Notes

- Tokens are stored in localStorage
- Different auth types store tokens separately:
  - Standard: `access_token`, `refresh_token`
  - Practitioner: `practitioner_access_token`, `practitioner_refresh_token`
  - Patient: `patient_access_token`, `patient_refresh_token`


