# Netlify Deployment Guide

This project is configured for deployment on Netlify via GitHub.

## Quick Setup

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Netlify will auto-detect Next.js settings

### 3. Build Settings (Auto-detected)

Netlify will automatically detect:
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 20 (from `.nvmrc`)

### 4. Environment Variables (if needed)

If you need environment variables:
1. Go to Site settings → Environment variables
2. Add any required variables
3. Redeploy

## Configuration Files

### `netlify.toml`
- Configures build settings
- Uses `@netlify/plugin-nextjs` for Next.js support
- Sets Node.js version to 20

### `next.config.js`
- Configured for Netlify compatibility
- React strict mode enabled

### `.nvmrc`
- Specifies Node.js version 20 for Netlify

## Build Process

1. Netlify installs dependencies: `npm install`
2. Runs build: `npm run build`
3. Deploys `.next` directory
4. Next.js plugin handles routing automatically

## Troubleshooting

### Build Fails

**Error: Module not found**
- Check that all dependencies are in `package.json`
- Ensure `node_modules` is in `.gitignore`

**Error: TypeScript errors**
- Run `npm run build` locally first
- Fix any TypeScript errors before pushing

**Error: Missing environment variables**
- Add required env vars in Netlify dashboard
- Redeploy after adding variables

### Deployment Issues

**404 errors on routes**
- The `@netlify/plugin-nextjs` handles this automatically
- If issues persist, check `netlify.toml` configuration

**Slow builds**
- Check Netlify build logs
- Consider upgrading Netlify plan if needed

## Manual Deployment

If you need to deploy manually:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers a new deployment
- Pull requests get preview deployments
- Build status shown in GitHub

## Important Notes

- ✅ `node_modules` is in `.gitignore` (correct)
- ✅ `.next` is in `.gitignore` (correct)
- ✅ Build artifacts are generated during build
- ✅ No sensitive data in repository
- ✅ TypeScript files are included (not in `.gitignore`)

## Next Steps

1. Push code to GitHub
2. Connect repository to Netlify
3. Deploy!
4. Check deployment URL
5. Test all routes

Your site will be available at: `https://your-site-name.netlify.app`

