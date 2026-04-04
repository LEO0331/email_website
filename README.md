# Emaily (Backend + Client)

Survey email app with:
- Node/Express backend
- React frontend (CRA) in `client/`
- Optional email sending via Resend

## Requirements

- Node.js `18.x`
- npm `7+` (project was originally pinned to npm `7.5.4`)
- Heroku account + app

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
DOMAIN=https://your-app-name.herokuapp.com
RESEND_API_KEY=your_resend_api_key
MAIL_FROM=Your App <noreply@yourdomain.com>
```

Notes:
- `RESEND_API_KEY` is optional. If missing, API routes still work but emails are skipped.
- `DOMAIN` is used in generated survey links.

## Deploy to Heroku (Manual)

1. Install and login:
   ```bash
   heroku login
   ```
2. Create app:
   ```bash
   heroku create your-app-name
   ```
3. Set config vars:
   ```bash
   heroku config:set DOMAIN=https://your-app-name.herokuapp.com --app your-app-name
   heroku config:set RESEND_API_KEY=your_resend_api_key --app your-app-name
   heroku config:set MAIL_FROM="Your App <noreply@yourdomain.com>" --app your-app-name
   ```
4. Deploy:
   ```bash
   git push heroku main
   ```
5. Verify:
   - Health: `https://your-app-name.herokuapp.com/api/health`

## Deploy via GitHub Actions

Set repository secrets:
- `HEROKU_API_KEY`
- `HEROKU_APP_NAME`
- `HEROKU_EMAIL`

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

### GitHub Action fails with `heroku: not found`
Ensure workflow includes Heroku CLI install step before deploy.

### Action log shows `heroku create  --buildpack ...` (blank app name)
`HEROKU_APP_NAME` secret is missing or empty. Set it in GitHub repository secrets.
