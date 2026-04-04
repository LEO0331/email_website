// Local storage utility for surveys
const SURVEYS_KEY = 'surveys_data';

export const surveyStorage = {
  // Get all surveys
  getAllSurveys: () => {
    const data = localStorage.getItem(SURVEYS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get a single survey by ID
  getSurveyById: (id) => {
    const surveys = surveyStorage.getAllSurveys();
    return surveys.find(s => s.id === id);
  },

  // Create a new survey
  createSurvey: (title, subject, body, recipients) => {
    const surveys = surveyStorage.getAllSurveys();
    const newSurvey = {
      id: Date.now(), // Simple unique ID
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({
        email: email.trim(),
        responded: false
      })),
      yes: 0,
      no: 0,
      dateSent: new Date().toISOString(),
      lastResponded: null
    };
    surveys.push(newSurvey);
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
    return newSurvey;
  },

  // Update survey votes
  updateSurveyVotes: (surveyId, choice) => {
    const surveys = surveyStorage.getAllSurveys();
    const survey = surveys.find(s => s.id === surveyId);
    if (survey) {
      if (choice === 'yes') {
        survey.yes += 1;
      } else {
        survey.no += 1;
      }
      survey.lastResponded = new Date().toISOString();
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
    }
    return survey;
  },

  // Mark recipient as responded
  markRecipientResponded: (surveyId, email) => {
    const surveys = surveyStorage.getAllSurveys();
    const survey = surveys.find(s => s.id === surveyId);
    if (survey) {
      const recipient = survey.recipients.find(r => r.email === email);
      if (recipient) {
        recipient.responded = true;
      }
      localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
    }
    return survey;
  },

  // Clear all surveys (for testing)
  clear: () => {
    localStorage.removeItem(SURVEYS_KEY);
  }
};
