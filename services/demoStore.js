const DEFAULT_CREDITS = 5;

let currentUser = false;
let surveys = [];
let surveyCounter = 1;

function getCurrentUser() {
  return currentUser;
}

function loginDemoUser() {
  if (currentUser && currentUser.id) {
    return currentUser;
  }

  currentUser = {
    id: 'demo-user',
    name: 'Demo User',
    credits: DEFAULT_CREDITS,
  };

  return currentUser;
}

function logoutDemoUser() {
  currentUser = false;
}

function listSurveys() {
  return surveys;
}

function createSurvey({ title, subject, body, recipients }) {
  const survey = {
    _id: `survey-${surveyCounter++}`,
    title,
    subject,
    body,
    recipients,
    yes: 0,
    no: 0,
    dateSent: new Date().toISOString(),
  };

  surveys.push(survey);
  return survey;
}

function clearDemoStore() {
  currentUser = false;
  surveys = [];
  surveyCounter = 1;
}

module.exports = {
  getCurrentUser,
  loginDemoUser,
  logoutDemoUser,
  listSurveys,
  createSurvey,
  clearDemoStore,
};
