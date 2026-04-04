const Database = require('better-sqlite3');

// Create or open the database file
const db = new Database('surveys.db', { verbose: console.log });

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    subject TEXT,
    body TEXT,
    recipients TEXT, -- JSON string of emails
    yes INTEGER DEFAULT 0,
    no INTEGER DEFAULT 0,
    dateSent DATETIME,
    lastResponded DATETIME
  );

  CREATE TABLE IF NOT EXISTS recipients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id INTEGER,
    email TEXT,
    responded BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (survey_id) REFERENCES surveys(id)
  );
`);

// Prepared statements for common operations
const insertSurvey = db.prepare(`
  INSERT INTO surveys (title, subject, body, recipients, dateSent)
  VALUES (?, ?, ?, ?, ?)
`);

const getAllSurveys = db.prepare(`
  SELECT * FROM surveys ORDER BY dateSent DESC
`);

const getSurveyById = db.prepare(`
  SELECT * FROM surveys WHERE id = ?
`);

const updateSurveyVotes = db.prepare(`
  UPDATE surveys SET yes = yes + ?, no = no + ?, lastResponded = ? WHERE id = ?
`);

const insertRecipient = db.prepare(`
  INSERT INTO recipients (survey_id, email) VALUES (?, ?)
`);

const updateRecipientResponded = db.prepare(`
  UPDATE recipients SET responded = TRUE WHERE id = ?
`);

const getRecipientByEmailAndSurvey = db.prepare(`
  SELECT * FROM recipients WHERE email = ? AND survey_id = ?
`);

module.exports = {
  db,
  insertSurvey,
  getAllSurveys,
  getSurveyById,
  updateSurveyVotes,
  insertRecipient,
  updateRecipientResponded,
  getRecipientsBySurveyId,
  getRecipientByEmailAndSurvey
};