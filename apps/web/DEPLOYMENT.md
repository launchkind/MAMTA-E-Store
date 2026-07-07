# Vercel Deployment Guide

## Required Environment Variables

When deploying to Vercel, you **must** set the following environment variables in your Vercel project settings:

### Critical Variables

1. **API_ENDPOINT** (Server-side API URL)

   ```
   API_ENDPOINT=https://your-api-domain.com
   ```

   - Used by Server Components to fetch data during SSR
   - Must be accessible from Vercel's servers

2. **NEXT_PUBLIC_API_URL** (Client-side API URL)

   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

   - Used by client-side code
   - Must be publicly accessible

### How to Set Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable with its value
4. Select the appropriate environment (Production, Preview, Development)
5. Click **Save**

### Example Production Values

```env
# API Configuration
API_ENDPOINT=https://api.entry.reactbd.com
NEXT_PUBLIC_API_URL=https://api.entry.reactbd.com

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123

# Application Settings
NEXT_PUBLIC_TAX_AMOUNT=0
NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD=999
NEXT_PUBLIC_SHOW_CONSOLE_WARNING=true
NEXT_PUBLIC_AVAILABLE_COUNTRIES=["Bangladesh","United States","Canada","United Kingdom","Australia","Germany","France","India","Japan","China"]
```

## Troubleshooting

### Error: FUNCTION_INVOCATION_FAILED

If you see this error, it usually means:

1. **Missing Environment Variables**: Ensure all required variables are set in Vercel
2. **API Not Accessible**: Make sure your API endpoint is publicly accessible from Vercel's servers
3. **CORS Issues**: Ensure your API allows requests from your Vercel domain

### Checking Logs

1. Go to Vercel Dashboard > Your Project
2. Click on **Deployments**
3. Select the failed deployment
4. Click on **Functions** tab to see function logs
5. Look for error messages

### Common Issues

1. **Logo Not Loading**:
   - Check if `API_ENDPOINT` is set correctly
   - Verify the API endpoint `/api/website-icons/key/main_logo` is accessible
   - The app will gracefully fall back to default logo if fetch fails

2. **Build Fails**:
   - Ensure `NEXT_PUBLIC_API_URL` is set (required at build time)
   - Check if all dependencies are installed

3. **Runtime Errors**:
   - Check function logs in Vercel dashboard
   - Verify API server is running and accessible
   - Check CORS configuration on API server

## Deployment Steps

1. Connect your repository to Vercel
2. Set all environment variables (see above)
3. Deploy
4. Check deployment logs for any errors
5. Test the deployed application

## Important Notes

- Server Components use `API_ENDPOINT` (not prefixed with NEXT*PUBLIC*)
- Client-side code uses `NEXT_PUBLIC_API_URL`
- Both should point to the same API server in most cases
- The layout has a 5-second timeout for logo fetch to prevent hanging
- If logo fetch fails, the default logo is used (no crash)
