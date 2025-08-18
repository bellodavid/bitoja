# Vercel Deployment Instructions

## Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`

## Deployment Steps

### 1. Build the project locally (optional test)

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

## Environment Variables Setup

Go to your Vercel project dashboard and add these environment variables:

### Required Environment Variables:

- `DATABASE_URL` - Your PostgreSQL connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET` - Random string for JWT signing
- `SESSION_SECRET` - Random string for session signing
- `ENCRYPTION_KEY` - 32-character string for wallet encryption
- `NODE_ENV` - Set to "production"
- `ALLOWED_ORIGINS` - Your Vercel app URL (e.g., https://your-app.vercel.app)

### Optional Environment Variables:

- `RATE_LIMIT_MAX_REQUESTS` - Default: 100
- `RATE_LIMIT_WINDOW_MS` - Default: 900000 (15 minutes)
- `UPLOAD_PATH` - Default: /tmp/uploads (use /tmp for Vercel)

## Post-Deployment

1. Update the CORS origins in your environment variables to include your Vercel app URL
2. Test your API endpoints at `https://your-app.vercel.app/api/`
3. Ensure your database is accessible from Vercel

## Troubleshooting

### 404 Errors

- Check that your API routes are prefixed with `/api/`
- Verify the `vercel.json` routing configuration
- Check environment variables are set correctly

### Database Connection Issues

- Ensure your database allows connections from Vercel's IP ranges
- Check DATABASE_URL format and credentials
- Verify SSL settings if required

### CORS Issues

- Add your Vercel domain to ALLOWED_ORIGINS
- Check that credentials: true is set if using authentication

## Domain Configuration

Once deployed, you can:

1. Add a custom domain in Vercel dashboard
2. Update ALLOWED_ORIGINS to include your custom domain
3. Update any hardcoded URLs in your frontend code
