# Local Storage Migration Guide

This app now uses browser local storage instead of MongoDB backend for a fully client-side demo that works on GitHub Pages.

## Changes Made to Backend

- **Backend is now minimal**: Only serves the React frontend files
- **No API endpoints**: Survey operations happen entirely in the browser
- **No database**: All data stored in browser's localStorage

## Changes Needed in Frontend (client/)

### 1. Update Actions (`client/src/actions/index.js`)

Replace API calls with localStorage operations:

```javascript
import { surveyStorage } from '../utils/surveyStorage';
import { FETCH_SURVEYS } from './types';

// Remove fetchUser - no longer needed
// Remove handleToken - payments removed

export const submitSurvey = (values, history) => dispatch => {
  // Create survey in localStorage instead of API
  surveyStorage.createSurvey(
    values.title,
    values.subject,
    values.body,
    values.recipients
  );
  history.push('/surveys');
  dispatch({ type: FETCH_SURVEYS, payload: surveyStorage.getAllSurveys() });
};

export const fetchSurveys = () => dispatch => {
  const surveys = surveyStorage.getAllSurveys();
  dispatch({ type: FETCH_SURVEYS, payload: surveys });
};
```

### 2. Update Components

**Dashboard.js** - Remove API calls for fetching surveys:
```javascript
componentDidMount() {
  // Instead of: this.props.fetchSurveys();
  const surveys = surveyStorage.getAllSurveys();
  this.props.dispatch({ type: FETCH_SURVEYS, payload: surveys });
}
```

**SurveyList.js** - No changes needed, just display from Redux state

**SurveyFormReview.js** - Update onCancel:
```javascript
onCancel = () => {
  this.props.history.push('/surveys');
}
```

### 3. Remove Auth/Payment Components

- **Header.js**: Remove auth/login buttons, remove Stripe payment button
- **Payments.js**: Can be deleted (no longer needed)
- Remove any references to `fetchUser` action

### 4. Update Reducers

**authReducer.js** - Can return empty/null state (no auth needed)

**surveyReducer.js** - Updated to work with local data:
```javascript
export default function(state = [], action) {
  switch(action.type) {
    case FETCH_SURVEYS:
      return action.payload || [];
    default:
      return state;
  }
}
```

## How to Import and Use surveyStorage

In your React components:
```javascript
import { surveyStorage } from '../utils/surveyStorage';

// Get all surveys
const surveys = surveyStorage.getAllSurveys();

// Create a survey
surveyStorage.createSurvey(title, subject, body, recipients);

// Update votes (when user clicks yes/no)
surveyStorage.updateSurveyVotes(surveyId, 'yes' or 'no');

// Mark recipient as responded
surveyStorage.markRecipientResponded(surveyId, email);

// Clear all data (for testing)
surveyStorage.clear();
```

## Testing Locally

1. Run `npm run dev` - backend serves frontend, all data stored in browser
2. Create surveys - they're saved to browser localStorage
3. Refresh page - surveys persist
4. Open DevTools → Application → Local Storage to see data

## Deploying to GitHub Pages

1. Build client: `cd client && npm run build`
2. Push to GitHub
3. Enable GitHub Pages in repo settings, point to `client/build`
4. Users can now create and view surveys entirely in their browser!

## Important Notes

- **Data is local to each browser**: If user clears browser data or uses incognito mode, surveys are lost
- **No email functionality**: Surveys can't be sent to recipients automatically
- **No voting via email links**: Voting only works within the app (no webhook support)
- **Great for demo**: Perfect for showcasing survey creation/UI without server complexity
