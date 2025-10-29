import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Get API URL - works for both localhost and network access
const getApiUrl = () => {
  // Check if we're running on localhost or via IP
  const currentHost = globalThis.location.hostname;

  // If accessing via IP (not localhost), use that IP for API calls
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8816`;
  }

  // Default to localhost for API server
  return 'http://localhost:8816';
};

export const biometricService = {
  // Check if device supports biometric authentication
  isSupported(): boolean {
    return typeof globalThis.window !== 'undefined' &&
           typeof globalThis.PublicKeyCredential !== 'undefined';
  },

  // Register user's biometric credential
  async register(userId: string, userName: string, userEmail: string) {
    try {
      if (!this.isSupported()) {
        throw new Error('Biometric authentication is not supported on this device');
      }

      // Get challenge from server
      const apiUrl = getApiUrl();
      const optionsResponse = await fetch(`${apiUrl}/api/auth/biometric/register-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, userName, userEmail })
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        throw new Error(error.message || 'Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Trigger device biometric prompt
      const credential = await startRegistration(options);

      // Send credential to server for storage
      const verifyResponse = await fetch(`${apiUrl}/api/auth/biometric/register-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, credential })
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.message || 'Failed to verify registration');
      }

      return await verifyResponse.json();
    } catch (error) {
      console.error('Biometric registration error:', error);
      throw error;
    }
  },

  // Authenticate using biometric
  async authenticate(email: string) {
    try {
      if (!this.isSupported()) {
        throw new Error('Biometric authentication is not supported on this device');
      }

      const apiUrl = getApiUrl();
      const optionsResponse = await fetch(`${apiUrl}/api/auth/biometric/login-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        throw new Error(error.message || 'Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      const credential = await startAuthentication(options);

      const verifyResponse = await fetch(`${apiUrl}/api/auth/biometric/login-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, credential })
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.message || 'Failed to verify authentication');
      }

      return await verifyResponse.json();
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw error;
    }
  },

  // Toggle biometric for a user
  async toggleBiometric(userId: string, enabled: boolean) {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/users/${userId}/biometric`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle biometric');
      }

      return await response.json();
    } catch (error) {
      console.error('Toggle biometric error:', error);
      throw error;
    }
  }
};
