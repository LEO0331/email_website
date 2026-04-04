# Emaily (Backend + Client)

Survey email app with:
- Node/Express backend
- React frontend (CRA) in `client/`
- Optional email sending via Resend

## Requirements

- Node.js `18.x`
- npm `7+`
- Vercel account

## Local Development

Install backend and client dependencies:

```bash
npm install
npm install --prefix client --legacy-peer-deps
```

Run both backend and frontend:

```bash
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

Run backend Jest tests:

```bash
npm run test
```

## Environment Variables

Create `.env` in project root:

```env
PORT=5000
DOMAIN=https://your-vercel-domain.vercel.app
RESEND_API_KEY=your_resend_api_key
MAIL_FROM=Your App <noreply@yourdomain.com>
```

Notes:
- `RESEND_API_KEY` is optional. If missing, API routes still work but emails are skipped.
- `DOMAIN` is used in generated survey links.

## Deploy Backend to Vercel (Manual)

1. Install and login:
   ```bash
   npm i -g vercel
   vercel login
   ```
2. Link the repo to a Vercel project (first run only):
   ```bash
   vercel
   ```
3. Add project environment variables in Vercel Dashboard:
   - `DOMAIN`
   - `RESEND_API_KEY` (optional)
   - `MAIL_FROM` (optional)
4. Deploy production:
   ```bash
   vercel --prod
   ```
5. Verify:
   - Health endpoint: `https://your-vercel-domain.vercel.app/api/health`

## Deploy via GitHub Actions (Vercel)

Workflow file:
- [deploy.yml](C:/Users/LeoLi/Documents/email_website/.github/workflows/deploy.yml)

Set repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Then push to `main` (or `master`).

## Troubleshooting

### `npm install --prefix client` fails with `ERESOLVE`
Use legacy peer deps:

```bash
npm install --prefix client --legacy-peer-deps
```

(`client/.npmrc` already includes `legacy-peer-deps=true`.)

### CRA preflight fails with `jest` / `babel-jest` conflict
Do not upgrade root Jest beyond CRA-compatible version. Root is pinned to:
- `jest@26.6.0`

### Vercel deploy via GitHub Actions fails early
Check that these GitHub secrets exist and are correct:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
