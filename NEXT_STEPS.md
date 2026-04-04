# Implementation Checklist - Client-Side Updates

This file lists the remaining client-side updates needed to complete the localStorage migration.

## ✅ Backend Changes (DONE)
- [x] Simplified `index.js` to only serve static files
- [x] Removed `routes/surveyRoutes.js`
- [x] Removed `config/db.js`
- [x] Removed MongoDB/Mongoose/Passport/Stripe dependencies
- [x] Created `client/src/utils/surveyStorage.js` with localStorage API
- [x] Updated `package.json` to only require Express
- [x] Updated `.env.example` (no vars required)

## ⏳ Client-Side Changes (YOU NEED TO DO)

### Priority 1: Make It Work Locally
- [ ] Update `client/src/actions/index.js` 
  - Remove `fetchUser`, `handleToken` actions (auth removed)
  - Update `submitSurvey` to use `surveyStorage.createSurvey()`
  - Update `fetchSurveys` to use `surveyStorage.getAllSurveys()`
  - Reference: `client/src/actions/index.example.js`

- [ ] Update `client/src/reducers/surveyReducer.js`
  - Ensure it handles FETCH_SURVEYS action
  - No MongoDB operations needed

- [ ] Update `client/src/component/Dashboard.js`
  - In `componentDidMount()`, call Redux action to fetch surveys
  - Remove any API call logic outside of actions

### Priority 2: Clean Up UI
- [ ] Update `client/src/component/Header.js`
  - Remove auth/login buttons (fetchUser removed)
  - Remove Stripe payment button (no credits)
  - Keep only navigation to surveys

- [ ] Can safely delete: `client/src/component/Payments.js` (payments removed)

- [ ] Update component imports if you delete Payments.js

### Priority 3: Test
- [ ] Run: `npm run dev`
- [ ] Create a survey (should save to localStorage)
- [ ] Refresh page (survey should persist)
- [ ] Check browser DevTools → Application → Local Storage → surveys_data

### Priority 4: Deploy
- [ ] Build client: `cd client && npm run build && cd ..`
- [ ] Push to GitHub
- [ ] Enable GitHub Pages in repo settings
- [ ] Test at your GitHub Pages URL

## Files to Modify

### Must Modify
1. `client/src/actions/index.js` - Main logic change
2. `client/src/component/Header.js` - Remove auth/payment UI
3. `client/src/reducers/surveyReducer.js` - Keep simple

### Should Clean Up
- `client/src/component/Payments.js` - Delete (optional)
- Client-side auth-related code - Remove

### Reference Files
- `client/src/actions/index.example.js` - Copy logic from here
- `client/src/utils/surveyStorage.js` - Already created, just use it
- `MIGRATION_GUIDE.md` - Detailed instructions
- `README_LOCALHOST.md` - Full documentation

## Quick Reference: surveyStorage Methods

```javascript
import { surveyStorage } from '../utils/surveyStorage';

// Get all surveys
surveyStorage.getAllSurveys()  // returns []

// Create survey
surveyStorage.createSurvey(title, subject, body, recipients)
// recipients is a comma-separated string like "a@test.com, b@test.com"

// Update votes when user clicks yes/no
surveyStorage.updateSurveyVotes(surveyId, 'yes')  // or 'no'

// Mark recipient as responded
surveyStorage.markRecipientResponded(surveyId, email)

// Clear all (for testing)
surveyStorage.clear()
```

## Common Issues

**"Cannot find module surveyStorage"**
- Make sure `client/src/utils/surveyStorage.js` exists
- Import with: `import { surveyStorage } from '../utils/surveyStorage'`

**"Surveys don't persist after refresh"**
- Check localStorage is enabled in browser
- Open DevTools → Application → Storage → Local Storage
- Should see entry for your domain with key `surveys_data`

**"Redux state shows undefined"**
- Make sure surveyReducer returns `action.payload` for FETCH_SURVEYS
- Dispatch the action after modifying localStorage

**"Page is blank in production"**
- Check that `client/build` contains `index.html`, `js/`, `css/`
- Verify `homepage` in `client/package.json` matches your deployment URL

## Final Check Before Deploying

```bash
# 1. Install dependencies
npm install

# 2. Build client
cd client && npm run build && cd ..

# 3. Test locally
npm run start

# 4. Create a survey and refresh - should persist

# 5. Delete node_modules (optional, save space)
rm -rf node_modules client/node_modules

# 6. Push to GitHub with build folder included
git add -A
git commit -m "Migrate to localStorage demo"
git push
```

That's it! Your app is ready for GitHub Pages deployment.
