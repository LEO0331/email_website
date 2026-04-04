import { surveyStorage } from '../utils/surveyStorage';
import { FETCH_SURVEYS } from './types';

// Survey operations using localStorage

export const submitSurvey = (values, history) => dispatch => {
  // Create survey and save to localStorage
  surveyStorage.createSurvey(
    values.title,
    values.subject,
    values.body,
    values.recipients
  );
  
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
