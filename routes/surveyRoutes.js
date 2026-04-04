var _ = require('lodash');
global._ = _; //When doing ._ calls lodash, defined globally
const {Path} = require('path-parser'); //const Path = require('path-parser').default;
const {URL} = require('url');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/surveyTemplate');
const Survey = require('../models/Survey');
const { updateSurveyVotes, getRecipientByEmailAndSurvey, updateRecipientResponded } = require('../config/db');

module.exports = app => {
	app.get('/api/surveys/', async (req, res) => { //fetch all surveys
		const surveys = Survey.find();
		res.send(surveys);
	});

	app.get('/api/surveys/:surveyId/:choice', (req, res) => {
		res.send('Thanks for voting!!!');
	});

	app.post('/api/surveys/webhooks', (req, res) => { //extract only ID, choices from URL
		const p = new Path('/api/surveys/:surveyId/:choice');
		_.chain(req.body)
			.map(({email, url}) => { 
				let match = null;
				try {
					match = p.test(new URL(url).pathname);
				} catch (error) {
					return null;
				}
				if (match){
					return {email, surveyId: match.surveyId, choice: match.choice}
				}
			})
			.compact() //remove undefined elements after mapping
			.uniqBy(({email, surveyId}) => `${email}:${surveyId}`)
			.each(({surveyId,email,choice}) => { //update record in db
				const recipient = getRecipientByEmailAndSurvey.get(email, surveyId);
				if (recipient && !recipient.responded) {
					updateRecipientResponded.run(recipient.id);
					Survey.updateVotes(surveyId, choice);
				}
	   		})
			.value();
		res.send({});
	});

	app.post('/api/surveys', async (req, res) => {
		const {title, subject, body, recipients} = req.body;
		const recipientsArray = recipients.split(',').map(email => email.trim());
		const survey = Survey.create({ //new instance of survey
			title,
			subject,
			body,
			recipients: recipientsArray
		});
		// Optionally send email
		const sendEmail = process.env.SEND_EMAIL === 'true';
		if (sendEmail) {
			const mailer = new Mailer(survey, surveyTemplate(survey)); //send an email
			try {
				await mailer.send();
			} catch (error) {
				console.error('Error sending email:', error);
			}
		}
		res.send(survey);
	});
};

/*
app.post('/api/surveys/webhooks', (req, res) => {
	const events = _.map(req.body, ({email, url}) => { 
		const pathname = new URL(url).pathname;
		const p = new Path('/api/surveys/:surveyId/:choice');
		const match = p.test(pathname);
		if (match){
			return {email, surveyId: match.surveyId, choice: match.choice}
		}
	});
	const compactEvents = _.compact(events); 
	const uniqueEvents = _.uniqBy(compactEvents, 'email', 'surveyId');
});
*/
