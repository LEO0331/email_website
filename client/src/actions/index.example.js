import { surveyStorage } from '../utils/surveyStorage';
import { FETCH_SURVEYS } from './types';
import axios from 'axios';

// Survey operations using localStorage

export const submitSurvey = (values, history) => async dispatch => {
  // Create survey and save to localStorage
  surveyStorage.createSurvey(
    values.title,
    values.subject,
    values.body,
    values.recipients
  );
  
  // Optionally send email via backend (only if Resend is configured)
  try {
    const recipients = values.recipients.split(',').map(e => e.trim());
    await axios.post('/api/surveys/send-email', {
      title: values.title,
      subject: values.subject,
      body: values.body,
      recipients: recipients
    });
    console.log('Email sent successfully');
  } catch (error) {
    // Email sending failed, but survey is still created in localStorage
    console.log('Email not sent (Resend not configured or error occurred):', error.message);
  }
  
  // Update Redux state
  dispatch({ 
    type: FETCH_SURVEYS, 
    payload: surveyStorage.getAllSurveys() 
  });
  
  // Navigate back to surveys list
  history.push('/surveys');
};

export const fetchSurveys = () => dispatch => {
  // Get all surveys from localStorage
  const surveys = surveyStorage.getAllSurveys();
  dispatch({ 
    type: FETCH_SURVEYS, 
    payload: surveys 
  });
};
