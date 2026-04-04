const { insertSurvey, getAllSurveys, getSurveyById, updateSurveyVotes, insertRecipient } = require('../config/db');

class Survey {
  static create({ title, subject, body, recipients }) {
    const recipientsJson = JSON.stringify(recipients);
    const dateSent = new Date().toISOString();
    const result = insertSurvey.run(title, subject, body, recipientsJson, dateSent);
    const surveyId = result.lastInsertRowid;

    // Insert recipients
    recipients.forEach(email => {
      insertRecipient.run(surveyId, email);
    });

    return { id: surveyId, title, subject, body, recipients, yes: 0, no: 0, dateSent };
  }

  static find() {
    return getAllSurveys.all().map(row => ({
      ...row,
      recipients: JSON.parse(row.recipients || '[]'),
      _id: row.id // for compatibility
    }));
  }

  static findById(id) {
    const row = getSurveyById.get(id);
    if (row) {
      return {
        ...row,
        recipients: JSON.parse(row.recipients || '[]'),
        _id: row.id
      };
    }
    return null;
  }

  static updateVotes(id, choice) {
    const increment = choice === 'yes' ? [1, 0] : [0, 1];
    const lastResponded = new Date().toISOString();
    updateSurveyVotes.run(...increment, lastResponded, id);
  }
}

module.exports = Survey;
