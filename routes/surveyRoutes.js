const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/surveyTemplate');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const RATE_LIMIT_WINDOW_MS = Number(process.env.EMAIL_RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.EMAIL_RATE_LIMIT_MAX || 5);
const requestBuckets = new Map();

function getClientKey(req) {
	const forwarded = req.headers && req.headers['x-forwarded-for'];
	if (typeof forwarded === 'string' && forwarded.trim()) {
		return forwarded.split(',')[0].trim();
	}

	return req.ip || req.connection?.remoteAddress || 'unknown-client';
}

function isRateLimited(clientKey, now = Date.now()) {
	const windowStart = now - RATE_LIMIT_WINDOW_MS;
	const requestTimes = requestBuckets.get(clientKey) || [];
	const activeRequests = requestTimes.filter(timestamp => timestamp > windowStart);

	activeRequests.push(now);
	requestBuckets.set(clientKey, activeRequests);

	return activeRequests.length > RATE_LIMIT_MAX;
}

function normalizeRecipients(recipients) {
	if (recipients == null) {
		return { error: 'No recipients provided' };
	}

	if (!Array.isArray(recipients)) {
		return { error: 'Recipients must be an array of email addresses' };
	}

	const sanitizedRecipients = recipients
		.map(recipient => String(recipient).trim())
		.filter(Boolean);

	if (sanitizedRecipients.length === 0) {
		return { error: 'No recipients provided' };
	}

	const invalidRecipients = sanitizedRecipients.filter(recipient => !EMAIL_REGEX.test(recipient));
	if (invalidRecipients.length > 0) {
		return { error: `Invalid recipient emails: ${invalidRecipients.join(', ')}` };
	}

	return { recipients: sanitizedRecipients };
}

module.exports = app => {
	// Optional endpoint: Send email for a survey (called from frontend)
	app.post('/api/surveys/send-email', async (req, res) => {
		const { title, subject, body, recipients } = req.body;

		const clientKey = getClientKey(req);
		if (isRateLimited(clientKey)) {
			return res.status(429).send({ error: 'Too many requests. Please wait and try again.' });
		}

		const recipientValidation = normalizeRecipients(recipients);
		if (recipientValidation.error) {
			return res.status(400).send({ error: recipientValidation.error });
		}

		try {
			const survey = { subject, body, title, recipients: recipientValidation.recipients };
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
