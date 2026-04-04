const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/surveyTemplate');

module.exports = app => {
	// Optional endpoint: Send email for a survey (called from frontend)
	app.post('/api/surveys/send-email', async (req, res) => {
		const { title, subject, body, recipients } = req.body;

		if (!recipients || recipients.length === 0) {
			return res.status(400).send({ error: 'No recipients provided' });
		}

		try {
			const survey = { subject, body, title };
			const mailer = new Mailer(survey, surveyTemplate(survey));
			
			await mailer.send();
			
			res.send({ success: true, message: 'Email sent successfully' });
		} catch (error) {
			console.error('Error sending email:', error);
			res.status(500).send({ 
				error: 'Failed to send email', 
				message: error.message 
			});
		}
	});

	// Health check endpoint
	app.get('/api/health', (req, res) => {
		res.send({ status: 'ok', message: 'Survey app is running' });
	});
};
