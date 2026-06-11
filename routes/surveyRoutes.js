const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/surveyTemplate');
const { listSurveys, createSurvey } = require('../services/demoStore');
const { sendError, sendList } = require('../services/apiResponse');
const {
	getIdempotencyKey,
	hashRequest,
	readIdempotencyRecord,
	saveIdempotencyRecord,
} = require('../services/idempotencyStore');

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
		return {
			error: {
				code: 'missing_required_param',
				message: 'No recipients provided',
				param: 'recipients',
			},
		};
	}

	if (!Array.isArray(recipients)) {
		return {
			error: {
				code: 'invalid_param_type',
				message: 'Recipients must be an array of email addresses',
				param: 'recipients',
			},
		};
	}

	const sanitizedRecipients = recipients
		.map(recipient => String(recipient).trim())
		.filter(Boolean);

	if (sanitizedRecipients.length === 0) {
		return {
			error: {
				code: 'missing_required_param',
				message: 'No recipients provided',
				param: 'recipients',
			},
		};
	}

	const invalidRecipients = sanitizedRecipients.filter(recipient => !EMAIL_REGEX.test(recipient));
	if (invalidRecipients.length > 0) {
		return {
			error: {
				code: 'invalid_email',
				message: `Invalid recipient emails: ${invalidRecipients.join(', ')}`,
				param: 'recipients',
			},
		};
	}

	return { recipients: sanitizedRecipients };
}

function parseListOptions(req) {
	const limit = Math.min(Math.max(parseInt(req.query?.limit || '20', 10) || 20, 1), 100);
	return {
		limit,
		startingAfter: req.query?.starting_after,
	};
}

function paginateSurveys(surveys, { limit, startingAfter }) {
	const sortedSurveys = [...surveys].sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));
	const startIndex = startingAfter
		? sortedSurveys.findIndex(survey => survey._id === startingAfter) + 1
		: 0;
	const safeStartIndex = startIndex > 0 ? startIndex : 0;
	const page = sortedSurveys.slice(safeStartIndex, safeStartIndex + limit);

	return {
		data: page,
		hasMore: safeStartIndex + limit < sortedSurveys.length,
	};
}

function sendValidationError(res, req, error) {
	return sendError(res, req, 400, {
		type: 'validation_error',
		code: error.code,
		message: error.message,
		param: error.param,
	});
}

function sendRateLimitError(res, req) {
	if (typeof res.set === 'function') {
		res.set('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
	}

	return sendError(res, req, 429, {
		type: 'rate_limit_error',
		code: 'rate_limit_exceeded',
		message: 'Too many requests. Please wait and try again.',
	});
}

function sendIdempotentReplayIfAvailable(req, res) {
	const record = readIdempotencyRecord(req);
	if (!record) {
		return false;
	}

	if (record.requestHash !== hashRequest(req)) {
		sendError(res, req, 409, {
			type: 'idempotency_error',
			code: 'idempotency_key_reused_with_different_params',
			message: 'The provided Idempotency-Key was already used with different request parameters.',
		});
		return true;
	}

	res.status(record.statusCode).send(record.body);
	return true;
}

function sendAndRemember(req, res, statusCode, body) {
	saveIdempotencyRecord(req, statusCode, body);
	return res.status(statusCode).send(body);
}

module.exports = app => {
	app.get('/api/surveys', (req, res) => {
		const page = paginateSurveys(listSurveys(), parseListOptions(req));
		return sendList(res, {
			data: page.data,
			hasMore: page.hasMore,
			url: '/api/surveys',
		});
	});

	app.post('/api/surveys', async (req, res) => {
		if (sendIdempotentReplayIfAvailable(req, res)) {
			return;
		}

		const { title, subject, body, recipients } = req.body;
		if (!title || !subject || !body) {
			return sendValidationError(res, req, {
				code: 'missing_required_param',
				message: 'Title, subject, and body are required',
				param: !title ? 'title' : !subject ? 'subject' : 'body',
			});
		}

		const clientKey = getClientKey(req);
		if (isRateLimited(clientKey)) {
			return sendRateLimitError(res, req);
		}

		const recipientInput = Array.isArray(recipients)
			? recipients
			: String(recipients || '')
					.split(',')
					.map(item => item.trim())
					.filter(Boolean);

		const recipientValidation = normalizeRecipients(recipientInput);
		if (recipientValidation.error) {
			return sendValidationError(res, req, recipientValidation.error);
		}

		const survey = createSurvey({
			title,
			subject,
			body,
			recipients: recipientValidation.recipients,
		});

		try {
			const mailer = new Mailer(survey, surveyTemplate(survey));
			await mailer.send();
		} catch (error) {
			console.error('Survey created but email send failed:', error);
		}

		return sendAndRemember(req, res, 201, survey);
	});

	app.post('/api/surveys/send-email', async (req, res) => {
		if (sendIdempotentReplayIfAvailable(req, res)) {
			return;
		}

		const { title, subject, body, recipients } = req.body;

		const clientKey = getClientKey(req);
		if (isRateLimited(clientKey)) {
			return sendRateLimitError(res, req);
		}

		const recipientValidation = normalizeRecipients(recipients);
		if (recipientValidation.error) {
			return sendValidationError(res, req, recipientValidation.error);
		}

		try {
			const survey = { subject, body, title, recipients: recipientValidation.recipients };
			const mailer = new Mailer(survey, surveyTemplate(survey));
			
			await mailer.send();

			return sendAndRemember(req, res, 200, {
				object: 'email_delivery',
				success: true,
				message: 'Email sent successfully',
				idempotency_key: getIdempotencyKey(req) || null,
			});
		} catch (error) {
			console.error('Error sending email:', error);
			return sendError(res, req, 500, {
				type: 'api_error',
				code: 'email_send_failed',
				message: 'Failed to send email',
			});
		}
	});

	app.get('/api/health', (req, res) => {
		res.send({
			object: 'health_check',
			status: 'ok',
			message: 'Survey app is running',
			request_id: req.requestId || null,
		});
	});
};
