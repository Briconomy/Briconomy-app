// Google OAuth utilities for Deno - SERVER SIDE ONLY
// This file should NEVER be imported by frontend code

// Load environment variables - these are server-side only
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || Deno.env.get("VITE_GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const APP_URL = Deno.env.get("APP_URL") || Deno.env.get("VITE_APP_URL") || "http://localhost:5173";
const API_URL = Deno.env.get("API_URL") || Deno.env.get("VITE_API_URL") || "http://localhost:8000";

// Validate that we're running server-side
if (!GOOGLE_CLIENT_SECRET) {
  console.error("GOOGLE_CLIENT_SECRET not found! This file should only run on the server.");
  console.error("Make sure you've set GOOGLE_CLIENT_SECRET in your .env file");
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

/**
 * Generates the Google OAuth authorization URL
 */
export function generateGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  if (state) {
    params.append("state", state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for access token
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const tokenEndpoint = "https://oauth2.googleapis.com/token";
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: `${APP_URL}/auth/google/callback`,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Gets user information from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const userInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";
  
  const response = await fetch(userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  return await response.json();
}

/**
 * Generates a random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert to base64-like string without dependencies
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates the configuration
 */
export function validateOAuthConfig(): { valid: boolean; error?: string } {
  if (!GOOGLE_CLIENT_ID) {
    return { valid: false, error: "GOOGLE_CLIENT_ID environment variable is not set" };
  }
  
  if (!GOOGLE_CLIENT_SECRET) {
    return { valid: false, error: "GOOGLE_CLIENT_SECRET environment variable is not set" };
  }

  return { valid: true };
}

export { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APP_URL, API_URL };