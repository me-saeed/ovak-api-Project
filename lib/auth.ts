/**
 * Ovok Authentication Service
 * Implements PKCE flow for Practitioner authentication
 */

const BASE_URL = 'https://api.ovok.com';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  project: {
    reference: string;
    display: string;
  };
  profile: {
    reference: string;
    display: string;
  };
  expiresIn: number;
}

export interface Profile {
  tenantCode: string;
  project: {
    id: string;
    resourceType: string;
    name: string;
  };
  profile: {
    resourceType: string;
    id: string;
    name: Array<{
      given: string[];
      family: string;
    }>;
  };
}

export interface LoginStartResponse {
  nextStep: string;
  sessionCode: string;
  profiles: Profile[];
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto
    const crypto = require('crypto');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  } else {
    // Client-side: use Web Crypto API
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const codeChallenge = btoa(String.fromCharCode(...hashArray))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        return { codeVerifier, codeChallenge };
      })
      .then(result => result) as any;
  }
}

/**
 * Start practitioner login (Step 1 of PKCE flow)
 */
export async function startPractitionerLogin(
  email: string,
  password: string
): Promise<LoginStartResponse> {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  
  // Store codeVerifier for later use
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  }
  
  const response = await fetch(`${BASE_URL}/auth/tenant/Practitioner/login/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      codeChallenge,
      codeChallengeMethod: 'S256',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Login failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Complete practitioner login and get access token (Step 2 of PKCE flow)
 */
export async function completePractitionerLogin(
  sessionCode: string,
  tenantCode: string
): Promise<LoginResponse> {
  let codeVerifier: string;
  
  if (typeof window !== 'undefined') {
    codeVerifier = sessionStorage.getItem('pkce_code_verifier') || '';
    sessionStorage.removeItem('pkce_code_verifier');
  } else {
    throw new Error('Code verifier not found');
  }

  const response = await fetch(`${BASE_URL}/auth/tenant/Practitioner/login/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sessionCode,
      codeVerifier,
      tenantCode,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Store tokens
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('projectId', data.project.reference.split('/')[1]);
    localStorage.setItem('profileId', data.profile.reference.split('/')[1]);
  }

  return data;
}

/**
 * Full login flow
 */
export async function loginPractitioner(
  email: string,
  password: string
): Promise<LoginResponse> {
  // Step 1: Start login
  const startData = await startPractitionerLogin(email, password);
  
  // Step 2: Complete login with first profile
  if (startData.profiles && startData.profiles.length > 0) {
    return completePractitionerLogin(
      startData.sessionCode,
      startData.profiles[0].tenantCode
    );
  }
  
  throw new Error('No profiles found');
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Get profile ID
 */
export function getProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('profileId');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * Register a new practitioner account
 */
export async function registerPractitioner(
  email: string,
  password: string,
  name: string,
  surname: string,
  clientId: string
): Promise<any> {
  if (!clientId) {
    throw new Error('Client ID is required for registration. Please get your Client ID from the Ovok dashboard.');
  }

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      name,
      surname,
      clientId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Registration failed: ${response.status}`);
  }

  const data = await response.json();
  
  // If tokens are provided, store them
  if (typeof window !== 'undefined') {
    if (data.accessToken || data.access_token) {
      localStorage.setItem('accessToken', data.accessToken || data.access_token);
    }
    if (data.refreshToken || data.refresh_token) {
      localStorage.setItem('refreshToken', data.refreshToken || data.refresh_token);
    }
  }

  return data;
}

/**
 * Logout
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('projectId');
    localStorage.removeItem('profileId');
  }
}

