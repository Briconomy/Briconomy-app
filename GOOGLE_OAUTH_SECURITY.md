# Google OAuth Security Guide

## Environment Variables Security

### PUBLIC (Safe to expose to browsers):
- `GOOGLE_CLIENT_ID` - This is meant to be public and visible in browser network requests
- `APP_URL` / `VITE_APP_URL` - Frontend URLs are public
- `API_URL` / `VITE_API_URL` - API endpoint URLs are discoverable anyway

### PRIVATE (Server-side only):
- `GOOGLE_CLIENT_SECRET` - Must NEVER be accessible to frontend/browsers
- `SESSION_SECRET` - Used for server-side session management

## Security Architecture

```
┌─────────────────┐    HTTP Requests    ┌──────────────────┐
│   Frontend      │ ──────────────────► │   Backend        │
│   (Port 5173)   │                     │   (Port 8000)    │
│                 │                     │                  │
│ safe Client ID  │                     │ safe Client ID     │
│ unsafe Client Secret│                 │ safe Client Secret │
└─────────────────┘                     └──────────────────┘
```

## OAuth Flow Security

1. **Frontend** initiates OAuth with public Client ID
2. **Google** redirects to your callback URL with authorization code
3. **Backend** exchanges code + Client Secret for access token
4. **Frontend** never sees the Client Secret

## File Access Patterns

### SECURE:
- `oauth-utils.ts` only imported by `api-server.ts` (backend)
- `dev-server.ts` (frontend) has no access to OAuth utilities
- Frontend uses API calls to backend for OAuth operations

### INSECURE (what we avoided):
- Importing `oauth-utils.ts` in frontend components
- Exposing Client Secret through frontend environment variables
- Client-side OAuth token exchange

## Production Deployment Notes

1. Use proper environment variable management (Docker secrets, etc.)
2. Ensure `.env` files are not committed to version control
3. Use HTTPS in production
4. Rotate secrets regularly
5. Monitor for unauthorized access attempts

## Verification Steps

To verify your setup is secure:

1. Check browser Network tab - should only see Client ID, never Client Secret
2. Confirm `oauth-utils.ts` is never bundled in frontend JavaScript
3. Test that frontend cannot access `Deno.env.get("GOOGLE_CLIENT_SECRET")`