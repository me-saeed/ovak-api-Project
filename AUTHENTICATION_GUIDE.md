# Ovok Authentication Guide - Complete Explanation

## Understanding the 404 Error

The error `Cannot POST /tenant/practitioner/login` means this endpoint **doesn't exist** on the API base URL you're using (`https://api.ovok.com`).

## Important Discovery

Based on the error and documentation review, here's what we know:

### 1. Available Endpoints on `https://api.ovok.com`

**Standard Authentication (CONFIRMED WORKING):**
- ✅ `POST /auth/register` - Register a new account
- ✅ `POST /auth/login` - Login with email, password, clientId
- ✅ `POST /auth/refresh` - Refresh token
- ✅ `GET /auth/account` - Get account info
- ✅ `GET /auth/sessions` - Get sessions
- ✅ `DELETE /auth/sessions` - Revoke sessions

**Tenant Authentication (MAY NOT EXIST ON THIS BASE URL):**
- ❓ `POST /tenant/practitioner/login` - **404 Error (Doesn't exist)**
- ❓ `POST /tenant/practitioner/exchange-token` - Unknown
- ❓ `POST /tenant/practitioner/mfa` - Unknown
- ❓ `POST /tenant/patient/login` - Unknown
- ❓ `POST /tenant/patient/register` - Unknown

## Key Understanding

### What "Practitioner" Registration on UI Means

When you registered as a **Practitioner on the Ovok UI**, this likely means:
1. You created a **user account** with the **role** of Practitioner
2. This is different from using a "tenant practitioner login" endpoint
3. You might still need to use the **standard `/auth/login`** endpoint
4. The **Client ID** you see in the UI might be for:
   - API application registration (OAuth client)
   - Organization/tenant identifier
   - Not necessarily for tenant-specific endpoints

## The Correct Approach

### Option 1: Use Standard Authentication (Most Likely)

Since you registered on the UI and got a Client ID, try this:

1. **Use Standard Login:**
   ```
   POST https://api.ovok.com/auth/login
   {
     "email": "your-email@example.com",
     "password": "your-password",
     "clientId": "your-client-id-from-ui"
   }
   ```

2. **What the Client ID might be:**
   - An OAuth client ID for your application
   - An organization identifier
   - A tenant identifier (but still used with standard auth)

3. **After login, you'll get:**
   - `access_token` - JWT token to use for API calls
   - `refresh_token` - To refresh the access token
   - Token will contain your role (Practitioner) in the claims

### Option 2: Tenant Endpoints Might Be on Different Base URL

If tenant endpoints exist, they might be on:
- `https://{your-tenant}.ovok.com/tenant/practitioner/login`
- Or require a different authentication flow first

## Understanding Client ID

### What is Client ID?

The `clientId` is typically:
1. **OAuth Client ID** - Identifies your application
2. **Organization ID** - Identifies your organization/tenant
3. **API Key** - For API access

### Where to Find It:

1. **In Ovok UI:**
   - Check your account settings
   - Look in API/Developer section
   - Check organization settings
   - Look for "Client ID", "Application ID", or "API Key"

2. **From Documentation:**
   - Development Setup guide
   - API credentials section
   - OAuth configuration

3. **From Support:**
   - Contact Ovok support
   - Ask for API credentials
   - Request OAuth client registration

## Recommended Testing Flow

### Step 1: Try Standard Login First

```javascript
POST https://api.ovok.com/auth/login
Content-Type: application/json

{
  "email": "your-email",
  "password": "your-password",
  "clientId": "client-id-from-ui"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Step 2: Decode the JWT Token

The token you get will contain information about your role. Decode it at [jwt.io](https://jwt.io) to see:
- Your user ID
- Your role (might say "Practitioner")
- Your profile/tenant information
- Expiration time

### Step 3: Use the Token

Once you have the token, use it in the Authorization header:
```
Authorization: Bearer {access_token}
```

## Common Issues and Solutions

### Issue 1: 422 Error - Missing clientId
**Solution:** Make sure you include `clientId` in the request body

### Issue 2: 404 Error - Endpoint Not Found
**Solution:** 
- The endpoint doesn't exist on that base URL
- Try the standard `/auth/login` instead
- Check if you need a different base URL

### Issue 3: 401 Error - Invalid Credentials
**Solution:**
- Verify email and password are correct
- Check if Client ID is correct
- Ensure account is activated

### Issue 4: Client ID Not Working
**Solution:**
- The Client ID from UI might be for a different purpose
- You might need to register an OAuth application first
- Contact support to get the correct Client ID

## What to Do Next

### 1. Try Standard Login
Use `/auth/login` with your email, password, and the Client ID from the UI.

### 2. Check the Token
Decode the JWT token to see what information it contains about your role and permissions.

### 3. Test API Access
Try using the token to access other endpoints to see what you can access.

### 4. Contact Support
If standard login doesn't work or you need tenant-specific access, contact Ovok support with:
- Your account email
- The Client ID you're trying to use
- The error messages you're getting
- Ask: "What is the correct way to authenticate as a Practitioner?"

## Summary

**Most Likely Solution:**
- Use `POST /auth/login` (standard endpoint)
- Include `clientId` from your UI account
- The token will contain your Practitioner role
- Use this token for all API calls

**The `/tenant/practitioner/login` endpoint:**
- Doesn't exist on `https://api.ovok.com`
- Might exist on tenant-specific URLs
- Might require different setup
- Documentation might be outdated or for different API version

**Next Steps:**
1. ✅ Try standard `/auth/login` with your Client ID
2. ✅ Decode the token to see your role
3. ✅ Test API access with the token
4. ✅ Contact support if needed


